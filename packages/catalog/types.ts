/**
 * The catalog schema.
 *
 * The shape is inherited from a commerce backend rather than designed around
 * what a shopping UI wishes it had, which is why stock lives per (colorway,
 * size) rather than per product. `tools/debrand` fills it with synthetic data;
 * the shape is worth keeping because it is the shape real storefront data
 * comes in, and the screens are built to handle that.
 */

export type Gender = 'mens' | 'womens' | 'unisex';
export type ProductType = 'Shoes' | 'Apparel' | 'Other';

/** Cushioning vocabulary, as the catalog's facet data expresses it. */
export type Cushion = 'Plush' | 'Balanced' | 'Responsive' | string;

export interface Size {
  /** Variation value, e.g. "9.5" or "M". */
  value: string;
  label: string;
  /** Derived from SFCC `selectable`: false means this size is out of stock. */
  available: boolean;
}

export interface Width {
  /** e.g. "1D", "2E". */
  value: string;
  /** e.g. "Medium (1D)". */
  label: string;
  available: boolean;
}

export interface ProductImage {
  /**
   * A `swatch:#RRGGBB,...#frame` URI. The synthetic catalog has no photography,
   * so this describes colours to draw rather than an image to fetch — see
   * `images.ts`.
   */
  url: string;
  alt: string;
}

/** One product review. Generated; see `tools/debrand/reviews.js`. */
export interface ProductReview {
  id: number;
  publishedDate: string;
  title: string;
  text: string;
  rating: number;
  author: string;
  badge: string | null;
}

export interface ReviewDimension {
  label: string;
  /** Zero-based average across the ordered values below. */
  average: number;
  values: string[];
}

export interface ProductReviews {
  averageRating: number | null;
  reviewCount: number;
  dimensions: ReviewDimension[];
  recent: ProductReview[];
}

export interface ReviewsSnapshot {
  harvestedAt: string;
  source: string;
  products: Record<string, ProductReviews>;
}

export interface Colorway {
  /** Colour code, e.g. "197". Combines with the style id to form a variant. */
  code: string;
  /** e.g. "White/Cyber Yellow/Black". */
  name: string;
  images: ProductImage[];
  price: number | null;
  listPrice: number | null;
  /** Which variation attribute the sizes belong to (`size_Shoe` vs `size_Apparel`). */
  sizeAttrId?: string;
  sizes: Size[];
  widths: Width[];
  soldOut: boolean;
}

export interface Product {
  /** Style number, e.g. "110498". */
  id: string;
  name: string;
  gender: Gender | null;
  productType: ProductType;
  /** Product family, e.g. "Halcyon", "Softfall", "Quickstep". */
  franchise: string | null;
  price: number | null;
  listPrice: number | null;
  onSale: boolean;
  description: string;
  /** e.g. ["Long runs", "Daily training"]. */
  bestFor: string[];
  features: string[];
  cushion: Cushion | null;
  /** e.g. "neutral_support", "max_support". */
  support: string | null;
  /** e.g. "speed", "cushion". */
  experience: string | null;
  rating: number | null;
  reviewCount: number;
  /** e.g. "New Style". */
  badge: string | null;
  /** Merchandising group ids this product belongs to. */
  groups: string[];
  colors: Colorway[];
  url: string;
}

export interface Category {
  id: string;
  label: string;
  productIds: string[];
}

export interface FacetOption {
  value: string;
  count: number;
}

export interface Facet {
  name: string;
  display_name: string;
  options: FacetOption[];
}

export interface Catalog {
  harvestedAt: string;
  source: string;
  counts: {
    products: number;
    shoes: number;
    apparel: number;
    colorways: number;
  };
  categories: Category[];
  facets: Facet[];
  products: Product[];
}

/** A line in the cart, identified by its variant id. */
export interface CartLine {
  /** Variant id, e.g. "1104981D197.090" (style + width + colour + size). */
  variantId: string;
  productId: string;
  colorCode: string;
  size: string;
  width: string;
  quantity: number;
}
