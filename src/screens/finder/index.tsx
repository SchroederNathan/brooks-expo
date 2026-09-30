import { useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { ProductTile } from '@/components/product-tile';
import { BrooksIcon } from '@/components/icons';
import { Button } from '@/components/button';
import { Press } from '@/components/press';
import { Screen, ScreenScrollView, useScreenTopPadding } from '@/components/screen';
import { Squiggle } from '@/components/squiggle';
import { Txt } from '@/components/themed-text';
import {
  ACTIVITY_WINDOW_DAYS,
  type ActivityProfile,
  formatMiles,
  formatSteps,
  isActivityAvailable,
  readActivityProfile,
} from '@/data/activity';
import { catalog } from '@/data/catalog';
import { VOICE } from '@/data/editorial';
import type { Product } from '@/data/types';
import { border, colors, spacing } from '@/theme';
import { useTabBarOverlap } from '@/utils/native-tabs';

import { answersFromActivity, type Evidence } from './from-activity';

const { width: W } = Dimensions.get('window');
const TILE_W = Math.floor((W - spacing.gutter * 2 - spacing.lg) / 2);

/**
 * The Shoe Finder.
 *
 * @ref LLP 0005#health-first — Where Apple Health exists, the Finder starts
 * from it, and the quiz only asks what the data cannot answer. Without Health,
 * the quiz is the whole Finder.
 *
 * @ref LLP 0003#shoe-finder — A condensed but faithful take on Brooks's real
 * 16-step quiz ("Shoe Finder S26 US"): the flow branches on trail, the barefoot
 * "Take 'em off" checkpoint plays as a full-screen beat, and results name
 * *why* — which is what turns a quiz into advice.
 */

export type Answers = {
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

/**
 * The flow, branched on the answers so far. `takeEmOff` is the checkpoint beat.
 * Steps in `skip` were answered from Apple Health and are not asked again.
 */
function flowFor(a: Answers, skip: ReadonlySet<string> = NO_SKIP): string[] {
  return [
    'use',
    ...(a.use === 'trail' ? ['trailType'] : []),
    'race',
    'mileage',
    'feel',
    'takeEmOff',
    'balance',
    'gender',
  ].filter((id) => !skip.has(id));
}

const NO_SKIP: ReadonlySet<string> = new Set();

/** The quiz's own label for a pre-filled answer, so the summary speaks its language. */
function optionLabel(stepId: keyof Answers, value: string | undefined): string {
  return STEPS[stepId]?.options.find((o) => o.value === value)?.label ?? '';
}

/* --------------------------------------------------------------- scoring --- */

const SUPPORT_FOR_BALANCE: Record<string, string[]> = {
  steady: ['neutral', 'flexible_support'],
  slight: ['balanced_support', 'structured_support'],
  wobbly: ['structured_support', 'max_support'],
};

function recommend(
  a: Answers,
  activity: ActivityProfile | null
): { product: Product; reasons: string[]; score: number }[] {
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
        reasons.push(
          activity?.avgDailySteps != null
            ? `A favorite for all-day walking, and you average ${formatSteps(activity.avgDailySteps)} steps a day`
            : 'A favorite for all-day walking comfort'
        );
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
          reasons.push(
            activity && activity.longestRunMiles >= 9
              ? `Loved for long runs like your ${formatMiles(activity.longestRunMiles, 1)}-miler`
              : 'Loved for long runs'
          );
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
    if (a.mileage === 'high' && p.bestFor.some((b) => /everyday|daily|long/i.test(b))) {
      score += 1;
      if (activity) reasons.push(`Built to take your ${formatMiles(activity.weeklyRunMiles)} miles a week`);
    }

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

type Phase = 'intro' | 'activity' | 'quiz' | 'results';

/** Read once: availability does not change while the app runs. */
const ACTIVITY_AVAILABLE = isActivityAvailable();

const WEEKS = Math.round(ACTIVITY_WINDOW_DAYS / 7);

const HEALTH_ICON = require('../../../assets/apple-health-icon.png');
const BROOKS_ICON = require('../../../assets/icon.png');

export function Finder() {
  // The Finder never carried the blue header, and still does not: its intro is a
  // full-bleed navy panel. It takes its safe area from the same primitive every
  // other headerless screen does.
  // @ref LLP 0003#the-header-collapses-on-scroll
  const screenTop = useScreenTopPadding();
  const tabBarOverlap = useTabBarOverlap();
  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);

  // Apple Health. `profile` is what was read; `prefill` and `evidence` are the
  // answers it supports and why. All three are screen state only.
  // @ref LLP 0005#nothing-leaves-the-device
  const [reading, setReading] = useState(false);
  const [profile, setProfile] = useState<ActivityProfile | null>(null);
  const [prefill, setPrefill] = useState<Partial<Answers>>({});
  const [evidence, setEvidence] = useState<Evidence>({});
  const skip = useMemo(() => new Set(Object.keys(prefill)), [prefill]);
  // Results quote the shopper's numbers only when those numbers decided something.
  const activity = skip.size > 0 ? profile : null;

  const flow = useMemo(() => flowFor(answers, skip), [answers, skip]);
  const stepId = flow[stepIndex];
  const results = useMemo(
    () => (phase === 'results' ? recommend(answers, activity) : []),
    [phase, answers, activity]
  );

  const forgetActivity = () => {
    setProfile(null);
    setPrefill({});
    setEvidence({});
  };

  const startQuiz = (start: Answers) => {
    setAnswers(start);
    setStepIndex(0);
    setPhase('quiz');
  };

  const reset = () => {
    setAnswers({});
    setStepIndex(0);
    forgetActivity();
    setPhase('intro');
  };

  const startFromActivity = async () => {
    if (reading) return;
    setReading(true);
    let read: ActivityProfile | null = null;
    try {
      read = await readActivityProfile();
    } catch {
      // A failed read is the same as no data: the quiz still works.
    }
    const derived = read ? answersFromActivity(read) : { answers: {}, evidence: {} };
    setProfile(read);
    setPrefill(derived.answers);
    setEvidence(derived.evidence);
    setReading(false);
    setPhase('activity');
  };

  // @ref LLP 0005#the-quiz-waits-for-next — A tap selects; only Next moves on.
  const next = () => {
    // flowFor can grow (trail branch), so it is recomputed from the answers.
    if (stepIndex + 1 >= flow.length) setPhase('results');
    else setStepIndex(stepIndex + 1);
  };

  const back = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
    // The first question goes back to wherever the quiz started from.
    else if (profile) setPhase('activity');
    else reset();
  };

  /* ---------------------------------------------------------------- intro -- */
  // @ref LLP 0005#health-first — With Health on the device, the Finder leads
  // with it and the quiz is the fallback.
  if (phase === 'intro' && ACTIVITY_AVAILABLE) {
    return (
      <Screen style={[styles.intro, { paddingBottom: spacing.xl }]}>
        <View style={{ flex: 2 }} />
        <View style={styles.linkArt}>
          <Image source={HEALTH_ICON} style={styles.appIcon} accessibilityLabel="Apple Health" />
          <Image source={BROOKS_ICON} style={styles.appIcon} accessibilityLabel="Brooks" />
          <View style={styles.linkBadge}>
            <LinkGlyph />
          </View>
        </View>

        <Txt variant="hero" c={colors.surface} style={{ marginTop: spacing.xxl }}>
          Link to{'\n'}
          <Txt variant="hero" c={colors.lime}>
            Apple Health
          </Txt>
        </Txt>
        <Txt variant="body" c="rgba(255,255,255,0.8)" style={{ marginTop: spacing.md }}>
          We read your last {WEEKS} weeks of runs, walks and steps, then ask only what Health
          can't tell us.
        </Txt>
        <View style={styles.introRule} />

        <View style={{ flex: 3 }} />
        <LockGlyph />
        <Txt variant="bodySmall" c="rgba(255,255,255,0.8)" style={styles.privacy}>
          Your Health data stays on this iPhone. Brooks never stores it or sends it anywhere.
        </Txt>
        <Button
          title="Connect Apple Health"
          variant="onDark"
          loading={reading}
          onPress={startFromActivity}
        />
        <Press
          onPress={() => startQuiz({})}
          disabled={reading}
          style={styles.healthLink}
          accessibilityRole="button"
        >
          <Txt variant="bodySmall" c={colors.surface} style={styles.healthLinkText}>
            Answer the questions instead
          </Txt>
        </Press>
      </Screen>
    );
  }

  if (phase === 'intro') {
    return (
      <Screen style={[styles.intro, { paddingBottom: spacing.xl }]}>
        <Txt variant="eyebrow" c={colors.lime}>
          Shoe Finder
        </Txt>
        <Txt variant="hero" c={colors.surface} style={{ marginTop: spacing.md }}>
          {VOICE.finderWelcome}
        </Txt>
        <Txt variant="body" c="rgba(255,255,255,0.8)" style={{ marginTop: spacing.lg }}>
          {VOICE.finderBlurb}
        </Txt>
        <View style={{ flex: 1 }} />
        <Button title={VOICE.finderCta} variant="onDark" onPress={() => startQuiz({})} />
      </Screen>
    );
  }

  /* ------------------------------------------------------------- activity -- */
  if (phase === 'activity') {
    const filled = (Object.keys(prefill) as (keyof Answers)[]).sort(
      (x, y) => STEP_ORDER.indexOf(x) - STEP_ORDER.indexOf(y)
    );
    const found = filled.length > 0;
    // Some activity, but not enough to decide any answer.
    const thin =
      !!profile && (profile.runs > 0 || profile.walks > 0 || profile.avgDailySteps != null);
    const left = flowFor(prefill, skip).filter((id) => id !== 'takeEmOff').length;
    return (
      <Screen style={[styles.intro, { paddingHorizontal: 0, paddingBottom: spacing.xl }]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          <Txt variant="h1" c={colors.surface}>
            {found
              ? `${filled.length === 1 ? 'One answer' : `${filled.length} answers`} down already.`
              : thin
                ? 'Not quite enough to go on.'
                : 'Nothing to go on yet.'}
          </Txt>
          <Txt variant="body" c="rgba(255,255,255,0.8)" style={{ marginTop: spacing.sm }}>
            {found
              ? `From your last ${WEEKS} weeks in Apple Health. The quiz asks the rest.`
              : thin
                ? `We need about four runs or walks in ${WEEKS} weeks to answer for you. The quiz asks everything.`
                : `We found no runs, walks or steps from the last ${WEEKS} weeks. You can check what Brooks can read in the Health app.`}
          </Txt>

          {found ? (
            <View style={{ marginTop: spacing.xl }}>
              {filled.map((key) => (
                <View key={key} style={styles.evidenceRow}>
                  <Txt variant="tiny" c="rgba(255,255,255,0.6)">
                    {STEPS[key].eyebrow}
                  </Txt>
                  <Txt variant="h3" c={colors.surface} style={{ marginTop: 2 }}>
                    {optionLabel(key, prefill[key])}
                  </Txt>
                  <Txt variant="bodySmall" c="rgba(255,255,255,0.7)" style={{ marginTop: 2 }}>
                    {evidence[key]}
                  </Txt>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.gutter }}>
          <Button
            title={found ? 'Continue' : 'Answer the questions'}
            accessory={found ? `${left} left` : undefined}
            variant="onDark"
            onPress={() => startQuiz(prefill)}
          />
          {found ? (
            <Press
              onPress={() => {
                forgetActivity();
                startQuiz({});
              }}
              style={styles.healthLink}
              accessibilityRole="button"
            >
              <Txt variant="bodySmall" c={colors.surface} style={styles.healthLinkText}>
                Answer every question instead
              </Txt>
            </Press>
          ) : null}
        </View>
      </Screen>
    );
  }

  /* -------------------------------------------------------------- results -- */
  if (phase === 'results') {
    return (
      <ScreenScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={{ paddingHorizontal: spacing.gutter }}>
          <Txt variant="eyebrow" c={colors.inkMuted}>
            Your matches
          </Txt>
          <Squiggle />
          <Txt variant="h1">
            {results.length ? 'Found your run.' : 'Hmm — nothing quite fits.'}
          </Txt>
          <Txt variant="body" c={colors.inkMuted} style={{ marginTop: spacing.sm }}>
            {!results.length
              ? 'Try loosening an answer or two.'
              : activity
                ? 'Ranked from your Apple Health activity and your answers, from the real Brooks catalog.'
                : 'Ranked for how you actually run, from the real Brooks catalog.'}
          </Txt>
        </View>

        <View style={{ marginTop: spacing.xl, gap: spacing.xxl }}>
          {results.map((r, i) => (
            <View key={r.product.id} style={styles.resultCard}>
              {i === 0 && (
                <View style={styles.topPick}>
                  <Txt variant="eyebrow" c={colors.blue} style={{ fontSize: 10 }}>
                    Top pick
                  </Txt>
                </View>
              )}
              <View style={{ flexDirection: 'row', gap: spacing.lg }}>
                <ProductTile product={r.product} width={TILE_W} index={i} />
                <View style={{ flex: 1, gap: spacing.sm, paddingTop: spacing.sm }}>
                  {r.reasons.map((why) => (
                    <View key={why} style={styles.why}>
                      <View style={styles.whyTick} />
                      <Txt variant="bodySmall" c={colors.inkSoft} style={{ flex: 1 }}>
                        {why}
                      </Txt>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: spacing.gutter, marginTop: spacing.xxl, gap: spacing.md }}>
          {/* A retake keeps the Health answers: the data has not changed, only
              the shopper's mind about the questions it could not answer. */}
          <Button title="Retake the quiz" variant="secondary" onPress={() => startQuiz(prefill)} />
          <Press onPress={reset} style={{ alignSelf: 'center', padding: spacing.sm }}>
            <Txt variant="caption" c={colors.inkMuted}>
              Start over
            </Txt>
          </Press>
        </View>
      </ScreenScrollView>
    );
  }

  /* ------------------------------------------------------------ checkpoint -- */
  if (stepId === 'takeEmOff') {
    // Extra air above the shared screen top: the checkpoint is a full-screen
    // beat, and its headline wants more room than a normal screen's first line.
    return (
      <View style={[styles.checkpoint, { paddingTop: screenTop + 46, paddingBottom: spacing.xl + tabBarOverlap }]}>
        <Txt variant="eyebrow" c={colors.blue}>
          Quick checkpoint
        </Txt>
        <Txt variant="hero" style={{ marginTop: spacing.md }}>
          Take 'em off.
        </Txt>
        <Txt variant="script" c={colors.inkMuted} style={{ marginTop: spacing.sm }}>
          Your shoes, that is.
        </Txt>
        <Txt variant="body" c={colors.inkSoft} style={{ marginTop: spacing.xl }}>
          The next question works best barefoot. Stand up, find your balance on one
          foot, and hold it for ten seconds. We'll wait.
        </Txt>
        <View style={{ flex: 1 }} />
        <Progress flow={flow} index={stepIndex} />
        <View style={{ marginTop: spacing.lg }}>
          <Button title="Done — one foot survived" onPress={next} />
        </View>
      </View>
    );
  }

  /* ----------------------------------------------------------------- quiz -- */
  const step = STEPS[stepId];
  const selected = (answers as Record<string, unknown>)[step.id];
  const last = stepIndex + 1 >= flow.length;

  return (
    <Screen style={[styles.quiz, { paddingBottom: spacing.xl }]}>
      <View style={styles.quizHead}>
        <Press hitSlop={10} onPress={back} accessibilityRole="button" accessibilityLabel="Back">
          <BrooksIcon name="caretLeft" size={16} color={colors.inkMuted} />
        </Press>
        <Txt variant="tiny" c={colors.inkMuted}>
          {stepIndex + 1} of {flow.length}
        </Txt>
      </View>

      <View key={step.id} style={{ flex: 1 }}>
        <Txt variant="eyebrow" c={colors.inkMuted} style={{ marginTop: spacing.xl }}>
          {step.eyebrow}
        </Txt>
        <Txt variant="h1" style={{ marginTop: spacing.sm }}>
          {step.question}
        </Txt>
        {step.hint ? (
          <Txt variant="body" c={colors.inkMuted} style={{ marginTop: spacing.sm }}>
            {step.hint}
          </Txt>
        ) : null}

        <View style={{ marginTop: spacing.xl, gap: spacing.md }} accessibilityRole="radiogroup">
          {step.options.map((o) => {
            const isOn = selected === o.value;
            return (
              <Press
                key={o.value}
                scaleTo={0.98}
                onPress={() => setAnswers(step.set(answers, o.value))}
                style={[styles.option, isOn && styles.optionOn]}
                accessibilityRole="radio"
                accessibilityState={{ selected: isOn }}
              >
                <View style={{ flex: 1 }}>
                  <Txt variant="h3" c={isOn ? colors.surface : colors.ink}>
                    {o.label}
                  </Txt>
                  {o.caption ? (
                    <Txt
                      variant="bodySmall"
                      c={isOn ? 'rgba(255,255,255,0.7)' : colors.inkMuted}
                      style={{ marginTop: 2 }}
                    >
                      {o.caption}
                    </Txt>
                  ) : null}
                </View>
                <View style={[styles.optionTick, isOn && styles.optionTickOn]} />
              </Press>
            );
          })}
        </View>
      </View>

      <Progress flow={flow} index={stepIndex} />
      <View style={{ marginTop: spacing.lg }}>
        <Button title={last ? 'See my matches' : 'Next'} disabled={selected == null} onPress={next} />
      </View>
    </Screen>
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

/** The chain link between the two app icons. */
function LinkGlyph() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.surface} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  );
}

function LockGlyph() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke={colors.surface} strokeWidth={2.5} />
      <Rect x={4} y={10} width={16} height={12} rx={2.5} fill={colors.surface} />
    </Svg>
  );
}

/** Every answer key in quiz order, so the Health summary lists them the same way. */
const STEP_ORDER: (keyof Answers)[] = ['use', 'trailType', 'race', 'mileage', 'feel', 'balance', 'gender'];

const styles = StyleSheet.create({
  intro: {
    flex: 1,
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.gutter,
  },
  healthLink: { alignSelf: 'center', padding: spacing.md, marginTop: spacing.sm },
  healthLinkText: { textDecorationLine: 'underline' },
  linkArt: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  // App icons keep the iOS icon corner: this row shows two real app icons.
  appIcon: { width: 104, height: 104, borderRadius: 24 },
  linkBadge: {
    position: 'absolute',
    bottom: -20,
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.ink,
    borderWidth: 3,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introRule: {
    marginTop: spacing.xl,
    borderTopWidth: border.rule,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  privacy: { marginTop: spacing.sm, marginBottom: spacing.xl },
  evidenceRow: {
    paddingVertical: spacing.md,
    borderTopWidth: border.rule,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  quiz: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: spacing.gutter },
  quizHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: border.rule,
    borderColor: colors.controlBorder,
    backgroundColor: colors.surface,
  },
  // An answer selects by filling, like the filled chip, so the rule follows the
  // fill instead of doubling — the row would otherwise reflow its label.
  optionOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  // @ref LLP 0003#border-widths — The tick keeps the emphasis weight: at 14pt a
  // single rule disappears, and this is a mark inside the control rather than
  // the control's own edge.
  optionTick: {
    width: 14,
    height: 14,
    borderWidth: border.emphasis,
    borderColor: colors.controlBorder,
  },
  optionTickOn: { backgroundColor: colors.lime, borderColor: colors.lime },

  // Lime is a spark, never a surface (LLP 0003) — the checkpoint gets the
  // product-photography field instead, with lime reserved for the accents.
  checkpoint: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.gutter,
  },

  progress: { flexDirection: 'row', gap: 4, marginTop: spacing.lg },
  progressSeg: { flex: 1, height: 5, backgroundColor: colors.surfaceSunken },
  progressSegOn: { backgroundColor: colors.blue },

  resultCard: { paddingHorizontal: spacing.gutter },
  topPick: {
    alignSelf: 'flex-start',
    backgroundColor: colors.lime,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  why: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  whyTick: { width: 7, height: 7, backgroundColor: colors.lime, marginTop: 6 },
});
