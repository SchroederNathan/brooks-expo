import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductTile } from '../../src/components/ProductTile';
import {
  Button,
  Press,
  Squiggle,
  Txt,
  notify,
  select,
} from '../../src/components/primitives';
import { catalog } from '../../src/data/catalog';
import { VOICE } from '../../src/data/editorial';
import type { Product } from '../../src/data/types';
import { color, space } from '../../src/theme/tokens';

const { width: W } = Dimensions.get('window');
const TILE_W = Math.floor((W - space.gutter * 2 - space.lg) / 2);

/**
 * The Shoe Finder.
 *
 * @ref LLP 0003#shoe-finder — A condensed but faithful take on Brooks's real
 * 16-step quiz ("Shoe Finder S26 US"): single-select steps auto-advance with a
 * selection haptic, the flow branches on trail, the barefoot "Take 'em off"
 * checkpoint plays as a full-screen beat, and results name *why* — which is what
 * turns a quiz into advice.
 */

type Answers = {
  use?: 'road' | 'trail' | 'walk';
  trailType?: 'light' | 'mountain' | 'speed';
  race?: string;
  mileage?: string;
  feel?: 'Plush' | 'Balanced' | 'Responsive';
  balance?: 'steady' | 'slight' | 'wobbly';
  gender?: 'womens' | 'mens';
};

interface Step {
  id: string;
  eyebrow: string;
  question: string;
  hint?: string;
  options: { value: string; label: string; caption?: string }[];
  set: (a: Answers, value: string) => Answers;
}

const STEPS: Record<string, Step> = {
  use: {
    id: 'use',
    eyebrow: 'First things first',
    question: 'Where do you run?',
    options: [
      { value: 'road', label: 'Road', caption: 'Pavement, sidewalks, treadmill' },
      { value: 'trail', label: 'Trail', caption: 'Dirt, rocks, roots' },
      { value: 'walk', label: 'Walking', caption: 'All-day comfort' },
    ],
    set: (a, v) => ({ ...a, use: v as Answers['use'] }),
  },
  trailType: {
    id: 'trailType',
    eyebrow: 'Trail check',
    question: 'What kind of trails?',
    options: [
      { value: 'light', label: 'Light trails', caption: 'Groomed paths, gravel' },
      { value: 'mountain', label: 'Technical & mountain', caption: 'Steep, rocky, wild' },
      { value: 'speed', label: 'Fast trail racing', caption: 'Race day off-road' },
    ],
    set: (a, v) => ({ ...a, trailType: v as Answers['trailType'] }),
  },
  race: {
    id: 'race',
    eyebrow: 'The goal',
    question: 'Training for something?',
    options: [
      { value: 'fun', label: 'Just running for me' },
      { value: '5k', label: 'A 5K or 10K' },
      { value: 'half', label: 'A half marathon' },
      { value: 'marathon', label: 'A marathon or more' },
    ],
    set: (a, v) => ({ ...a, race: v }),
  },
  mileage: {
    id: 'mileage',
    eyebrow: 'Volume',
    question: 'Miles per week, roughly?',
    options: [
      { value: 'low', label: 'Under 10' },
      { value: 'mid', label: '10 – 25' },
      { value: 'high', label: '25 and up' },
    ],
    set: (a, v) => ({ ...a, mileage: v }),
  },
  feel: {
    id: 'feel',
    eyebrow: 'Feel under foot',
    question: 'How should the ground feel?',
    options: [
      { value: 'Plush', label: 'Soft & plush', caption: 'Pillowy, protective' },
      { value: 'Balanced', label: 'Balanced', caption: 'Soft and smooth' },
      { value: 'Responsive', label: 'Springy & fast', caption: 'Energetic toe-off' },
    ],
    set: (a, v) => ({ ...a, feel: v as Answers['feel'] }),
  },
  balance: {
    id: 'balance',
    eyebrow: 'The barefoot test',
    question: 'Standing on one foot — how did it go?',
    hint: 'Eyes forward, knee soft. Ten seconds.',
    options: [
      { value: 'steady', label: 'Rock steady' },
      { value: 'slight', label: 'A little wobbly' },
      { value: 'wobbly', label: 'Grabbed the counter' },
    ],
    set: (a, v) => ({ ...a, balance: v as Answers['balance'] }),
  },
  gender: {
    id: 'gender',
    eyebrow: 'Almost there',
    question: 'Which fit?',
    options: [
      { value: 'womens', label: "Women's" },
      { value: 'mens', label: "Men's" },
    ],
    set: (a, v) => ({ ...a, gender: v as Answers['gender'] }),
  },
};

/** The flow, branched on the answers so far. `takeEmOff` is the checkpoint beat. */
function flowFor(a: Answers): string[] {
  return [
    'use',
    ...(a.use === 'trail' ? ['trailType'] : []),
    'race',
    'mileage',
    'feel',
    'takeEmOff',
    'balance',
    'gender',
  ];
}

/* --------------------------------------------------------------- scoring --- */

const SUPPORT_FOR_BALANCE: Record<string, string[]> = {
  steady: ['neutral', 'flexible_support'],
  slight: ['balanced_support', 'structured_support'],
  wobbly: ['structured_support', 'max_support'],
};

function recommend(a: Answers): { product: Product; reasons: string[]; score: number }[] {
  const shoes = catalog.products.filter(
    (p) =>
      p.productType === 'Shoes' &&
      p.colors.length > 0 &&
      !p.colors.every((c) => c.soldOut) &&
      (!a.gender || p.gender === a.gender || p.gender === 'unisex')
  );

  const scored = shoes.map((p) => {
    let score = 0;
    const reasons: string[] = [];

    // Surface is the hardest gate: trail shoes for trail, road for road.
    const exp = p.experience ?? '';
    if (a.use === 'trail') {
      if (!exp.includes('trail')) score -= 10;
      else {
        score += 4;
        reasons.push('Built for trail — grip and protection off-road');
        if (
          (a.trailType === 'light' && exp === 'light_trail') ||
          (a.trailType === 'mountain' && exp === 'mountain_trail') ||
          (a.trailType === 'speed' && exp === 'speed_trail')
        ) {
          score += 3;
          reasons.push(
            a.trailType === 'light'
              ? 'Happiest on groomed paths and gravel'
              : a.trailType === 'mountain'
                ? 'Made for steep, technical ground'
                : 'A fast shoe for race-day trails'
          );
        }
      }
    } else if (a.use === 'walk') {
      if (exp === 'walking' || p.bestFor.includes('Walking')) {
        score += 4;
        reasons.push('A favorite for all-day walking comfort');
      } else if (exp.includes('trail')) score -= 6;
      else if (p.cushion === 'Plush') score += 1;
    } else {
      // Road
      if (exp.includes('trail')) score -= 10;
      if (a.race === 'marathon' || a.race === 'half') {
        if (exp === 'speed') {
          score += 2;
          reasons.push('Race-ready — light and quick when it counts');
        }
        if (p.bestFor.some((b) => /long run/i.test(b))) {
          score += 2;
          reasons.push('Loved for long runs');
        }
      }
      if (p.bestFor.some((b) => /everyday|daily/i.test(b))) score += 1;
    }

    // Cushion: the quiz's "feel" answer maps 1:1 to Brooks's own vocabulary.
    if (a.feel && p.cushion === a.feel) {
      score += 3;
      reasons.push(
        a.feel === 'Plush'
          ? 'Plush cushion — you wanted soft and protective'
          : a.feel === 'Balanced'
            ? 'Balanced cushion — you wanted soft and smooth'
            : 'Responsive cushion — you wanted spring, not mush'
      );
    }

    // Support from the barefoot test.
    if (a.balance) {
      const wanted = SUPPORT_FOR_BALANCE[a.balance];
      if (p.support && wanted.includes(p.support)) {
        score += 3;
        if (a.balance !== 'steady')
          reasons.push('Support that steadies the wobble you felt');
        else reasons.push('Neutral — your stride doesn’t need correcting');
      }
    }

    // High mileage rewards durable daily trainers.
    if (a.mileage === 'high' && p.bestFor.some((b) => /everyday|daily|long/i.test(b))) score += 1;

    // Crowd wisdom, gently.
    if (p.badge === 'Best Seller') score += 1;
    if ((p.rating ?? 0) >= 4.5) score += 1;

    return { product: p, reasons: reasons.slice(0, 3), score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score || (y.product.rating ?? 0) - (x.product.rating ?? 0))
    .slice(0, 4);
}

/* ------------------------------------------------------------------ view --- */

type Phase = 'intro' | 'quiz' | 'results';

export default function Finder() {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const advancing = useRef(false);

  const flow = useMemo(() => flowFor(answers), [answers]);
  const stepId = flow[stepIndex];
  const results = useMemo(
    () => (phase === 'results' ? recommend(answers) : []),
    [phase, answers]
  );

  const reset = () => {
    setAnswers({});
    setStepIndex(0);
    setPhase('intro');
  };

  const advance = (next: Answers) => {
    // flowFor can grow (trail branch), so recompute against the new answers.
    const newFlow = flowFor(next);
    if (stepIndex + 1 >= newFlow.length) {
      notify(Haptics.NotificationFeedbackType.Success);
      setPhase('results');
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const pick = (step: Step, value: string) => {
    if (advancing.current) return;
    advancing.current = true;
    select();
    const next = step.set(answers, value);
    setAnswers(next);
    // A beat so the selection state is visible before the slide advances.
    setTimeout(() => {
      advancing.current = false;
      advance(next);
    }, 260);
  };

  /* ---------------------------------------------------------------- intro -- */
  if (phase === 'intro') {
    return (
      <View style={[styles.intro, { paddingTop: insets.top + 70, paddingBottom: insets.bottom + 110 }]}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Txt variant="eyebrow" c={color.lime}>
            Shoe Finder
          </Txt>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <Txt variant="hero" c={color.surface} style={{ marginTop: space.md }}>
            {VOICE.finderWelcome}
          </Txt>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <Txt variant="body" c="rgba(255,255,255,0.8)" style={{ marginTop: space.lg }}>
            {VOICE.finderBlurb}
          </Txt>
        </Animated.View>
        <View style={{ flex: 1 }} />
        <Animated.View entering={FadeInDown.duration(400).delay(240)}>
          <Button title={VOICE.finderCta} variant="onDark" onPress={() => setPhase('quiz')} />
        </Animated.View>
      </View>
    );
  }

  /* -------------------------------------------------------------- results -- */
  if (phase === 'results') {
    return (
      <ScrollView
        style={{ backgroundColor: color.surface }}
        contentContainerStyle={{ paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: space.gutter }}>
          <Txt variant="eyebrow" c={color.inkMuted}>
            Your matches
          </Txt>
          <Squiggle />
          <Txt variant="h1">
            {results.length ? 'Found your run.' : 'Hmm — nothing quite fits.'}
          </Txt>
          <Txt variant="body" c={color.inkMuted} style={{ marginTop: space.sm }}>
            {results.length
              ? 'Ranked for how you actually run, from the real Brooks catalog.'
              : 'Try loosening an answer or two.'}
          </Txt>
        </View>

        <View style={{ marginTop: space.xl, gap: space.xxl }}>
          {results.map((r, i) => (
            <Animated.View
              key={r.product.id}
              entering={FadeInUp.delay(i * 90).duration(320)}
              style={styles.resultCard}
            >
              {i === 0 && (
                <View style={styles.topPick}>
                  <Txt variant="eyebrow" c={color.blue} style={{ fontSize: 10 }}>
                    Top pick
                  </Txt>
                </View>
              )}
              <View style={{ flexDirection: 'row', gap: space.lg }}>
                <ProductTile product={r.product} width={TILE_W} index={i} />
                <View style={{ flex: 1, gap: space.sm, paddingTop: space.sm }}>
                  {r.reasons.map((why) => (
                    <View key={why} style={styles.why}>
                      <View style={styles.whyTick} />
                      <Txt variant="bodySmall" c={color.inkSoft} style={{ flex: 1 }}>
                        {why}
                      </Txt>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={{ paddingHorizontal: space.gutter, marginTop: space.xxl, gap: space.md }}>
          <Button
            title="Retake the quiz"
            variant="secondary"
            onPress={() => {
              setAnswers({});
              setStepIndex(0);
              setPhase('quiz');
            }}
          />
          <Press onPress={reset} haptic={false} style={{ alignSelf: 'center', padding: space.sm }}>
            <Txt variant="caption" c={color.inkMuted}>
              Start over
            </Txt>
          </Press>
        </View>
      </ScrollView>
    );
  }

  /* ------------------------------------------------------------ checkpoint -- */
  if (stepId === 'takeEmOff') {
    return (
      <View style={[styles.checkpoint, { paddingTop: insets.top + 70, paddingBottom: insets.bottom + 110 }]}>
        <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut}>
          <Txt variant="eyebrow" c={color.blue}>
            Quick checkpoint
          </Txt>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(420).delay(90)}>
          <Txt variant="hero" style={{ marginTop: space.md }}>
            Take 'em off.
          </Txt>
          <Txt variant="script" c={color.inkMuted} style={{ marginTop: space.sm }}>
            Your shoes, that is.
          </Txt>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(420).delay(180)}>
          <Txt variant="body" c={color.inkSoft} style={{ marginTop: space.xl }}>
            The next question works best barefoot. Stand up, find your balance on one
            foot, and hold it for ten seconds. We'll wait.
          </Txt>
        </Animated.View>
        <View style={{ flex: 1 }} />
        <Progress flow={flow} index={stepIndex} />
        <Animated.View entering={FadeInDown.duration(400).delay(260)} style={{ marginTop: space.lg }}>
          <Button title="Done — one foot survived" onPress={() => advance(answers)} />
        </Animated.View>
      </View>
    );
  }

  /* ----------------------------------------------------------------- quiz -- */
  const step = STEPS[stepId];
  const selected = (answers as Record<string, unknown>)[step.id];

  return (
    <View style={[styles.quiz, { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + 110 }]}>
      <View style={styles.quizHead}>
        <Press
          haptic={false}
          hitSlop={10}
          onPress={() => (stepIndex === 0 ? reset() : setStepIndex(stepIndex - 1))}
        >
          <Txt variant="h3" c={color.inkMuted}>
            ‹
          </Txt>
        </Press>
        <Txt variant="tiny" c={color.inkMuted}>
          {stepIndex + 1} of {flow.length}
        </Txt>
      </View>

      <Animated.View key={step.id} entering={FadeInDown.duration(300)} style={{ flex: 1 }}>
        <Txt variant="eyebrow" c={color.inkMuted} style={{ marginTop: space.xl }}>
          {step.eyebrow}
        </Txt>
        <Txt variant="h1" style={{ marginTop: space.sm }}>
          {step.question}
        </Txt>
        {step.hint ? (
          <Txt variant="body" c={color.inkMuted} style={{ marginTop: space.sm }}>
            {step.hint}
          </Txt>
        ) : null}

        <View style={{ marginTop: space.xl, gap: space.md }}>
          {step.options.map((o, i) => {
            const isOn = selected === o.value;
            return (
              <Animated.View key={o.value} entering={FadeInDown.delay(60 + i * 60).duration(280)}>
                <Press
                  haptic={false}
                  scaleTo={0.98}
                  onPress={() => pick(step, o.value)}
                  style={[styles.option, isOn && styles.optionOn]}
                >
                  <View style={{ flex: 1 }}>
                    <Txt variant="h3" c={isOn ? color.surface : color.ink}>
                      {o.label}
                    </Txt>
                    {o.caption ? (
                      <Txt
                        variant="bodySmall"
                        c={isOn ? 'rgba(255,255,255,0.7)' : color.inkMuted}
                        style={{ marginTop: 2 }}
                      >
                        {o.caption}
                      </Txt>
                    ) : null}
                  </View>
                  <View style={[styles.optionTick, isOn && styles.optionTickOn]} />
                </Press>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>

      <Progress flow={flow} index={stepIndex} />
    </View>
  );
}

/** Segmented lime progress on an ink track — the site's own quiz meter. */
function Progress({ flow, index }: { flow: string[]; index: number }) {
  return (
    <View style={styles.progress}>
      {flow.map((id, i) => (
        <View key={id} style={[styles.progressSeg, i <= index && styles.progressSegOn]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    flex: 1,
    backgroundColor: color.navy,
    paddingHorizontal: space.gutter,
  },
  quiz: { flex: 1, backgroundColor: color.surface, paddingHorizontal: space.gutter },
  quizHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderWidth: 2,
    borderColor: color.hairline,
    backgroundColor: color.surface,
  },
  optionOn: { backgroundColor: color.ink, borderColor: color.ink },
  optionTick: { width: 14, height: 14, borderWidth: 2, borderColor: color.hairline },
  optionTickOn: { backgroundColor: color.lime, borderColor: color.lime },

  // Lime is a spark, never a surface (LLP 0003) — the checkpoint gets the
  // product-photography field instead, with lime reserved for the accents.
  checkpoint: {
    flex: 1,
    backgroundColor: color.surfaceAlt,
    paddingHorizontal: space.gutter,
  },

  progress: { flexDirection: 'row', gap: 4, marginTop: space.lg },
  progressSeg: { flex: 1, height: 5, backgroundColor: color.surfaceSunken },
  progressSegOn: { backgroundColor: color.blue },

  resultCard: { paddingHorizontal: space.gutter },
  topPick: {
    alignSelf: 'flex-start',
    backgroundColor: color.lime,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    marginBottom: space.sm,
  },
  why: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  whyTick: { width: 7, height: 7, backgroundColor: color.lime, marginTop: 6 },
});
