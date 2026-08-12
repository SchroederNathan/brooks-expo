/**
 * Cart state.
 *
 * @ref LLP 0000#live-brooks-data — The journey ends at a working cart; we never
 * submit payment or place an order. The Brooks Cart-AddProduct endpoint is
 * documented in LLP 0002 and we build the exact variant id it expects, but the
 * cart itself lives on the device: adding to a stranger's real Brooks basket
 * from a prototype would be both unreliable (Akamai) and rude.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import { catalog } from '../data/catalog';
import { byId, colorwayOf, variantId } from '../data/query';
import type { Product } from '../data/types';

const STORAGE_KEY = 'brooks.cart.v1';
const FREE_SHIPPING_OVER = 100;

export interface CartLine {
  variantId: string;
  productId: string;
  colorCode: string;
  size: string;
  width: string;
  quantity: number;
  /** When it was added — drives "recently added" affordances. */
  addedAt: number;
}

interface State {
  lines: CartLine[];
  hydrated: boolean;
}

type Action =
  | { type: 'hydrate'; lines: CartLine[] }
  | { type: 'add'; line: Omit<CartLine, 'addedAt'> }
  | { type: 'setQuantity'; variantId: string; quantity: number }
  | { type: 'remove'; variantId: string }
  | { type: 'clear' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { lines: action.lines, hydrated: true };
    case 'add': {
      const existing = state.lines.find((l) => l.variantId === action.line.variantId);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.variantId === action.line.variantId
              ? { ...l, quantity: l.quantity + action.line.quantity, addedAt: Date.now() }
              : l
          ),
        };
      }
      return { ...state, lines: [{ ...action.line, addedAt: Date.now() }, ...state.lines] };
    }
    case 'setQuantity':
      if (action.quantity <= 0) {
        return { ...state, lines: state.lines.filter((l) => l.variantId !== action.variantId) };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.variantId === action.variantId ? { ...l, quantity: action.quantity } : l
        ),
      };
    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.variantId !== action.variantId) };
    case 'clear':
      return { ...state, lines: [] };
  }
}

export interface CartItemView extends CartLine {
  product: Product;
  colorName: string;
  imageUrl: string;
  unitPrice: number;
  lineTotal: number;
}

interface CartContextValue {
  lines: CartLine[];
  items: CartItemView[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  freeShippingRemaining: number;
  hydrated: boolean;
  add(input: {
    productId: string;
    colorCode: string;
    size: string;
    width: string;
    quantity?: number;
  }): string;
  setQuantity(variantId: string, quantity: number): void;
  remove(variantId: string): void;
  clear(): void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], hydrated: false });

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        let lines: CartLine[] = [];
        try {
          lines = raw ? JSON.parse(raw) : [];
        } catch {
          lines = [];
        }
        // Drop lines whose product left the catalog between snapshots.
        dispatch({ type: 'hydrate', lines: lines.filter((l) => byId(catalog, l.productId)) });
      })
      .catch(() => dispatch({ type: 'hydrate', lines: [] }));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines)).catch(() => {});
  }, [state.lines, state.hydrated]);

  const add = useCallback<CartContextValue['add']>((input) => {
    const id = variantId(input.productId, input.width, input.colorCode, input.size);
    dispatch({
      type: 'add',
      line: {
        variantId: id,
        productId: input.productId,
        colorCode: input.colorCode,
        size: input.size,
        width: input.width,
        quantity: input.quantity ?? 1,
      },
    });
    return id;
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const items: CartItemView[] = state.lines.flatMap((line) => {
      const product = byId(catalog, line.productId);
      if (!product) return [];
      const color = colorwayOf(product, line.colorCode);
      const unitPrice = color.price ?? product.price ?? 0;
      return [
        {
          ...line,
          product,
          colorName: color.name,
          imageUrl: color.images[0]?.url ?? '',
          unitPrice,
          lineTotal: unitPrice * line.quantity,
        },
      ];
    });

    const subtotal = items.reduce((n, i) => n + i.lineTotal, 0);
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : 5;

    return {
      lines: state.lines,
      items,
      count,
      subtotal,
      shipping,
      total: subtotal + shipping,
      freeShippingRemaining: Math.max(0, FREE_SHIPPING_OVER - subtotal),
      hydrated: state.hydrated,
      add,
      setQuantity: (variantId, quantity) => dispatch({ type: 'setQuantity', variantId, quantity }),
      remove: (variantId) => dispatch({ type: 'remove', variantId }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [state, add]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
