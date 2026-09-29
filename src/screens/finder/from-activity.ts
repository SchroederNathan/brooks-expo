import { type ActivityProfile, formatMiles, formatSteps } from '@/data/activity';

import type { Answers } from './index';

/** Why each pre-filled answer was chosen, in words the shopper can check. */
export type Evidence = Partial<Record<keyof Answers, string>>;

/** One run every two weeks: fewer than this and we do not call someone a runner. */
const MIN_RUNS = 4;
/** Steps a day at which someone walks enough to shop for walking shoes. [inferred] */
const WALKER_STEPS = 7500;

/**
 * Turns an activity profile into the Finder answers it can support.
 *
 * @ref LLP 0005#answer-only-what-the-data-shows — An answer is filled only when
 * the data points at one option clearly. Anything the data cannot see (how the
 * ground should feel, the balance test, fit) stays a question, and so does a
 * race goal for someone whose runs are all short: a 4-mile runner may be
 * training for a 5K or running for fun, and Health cannot tell which.
 */
export function answersFromActivity(p: ActivityProfile): { answers: Partial<Answers>; evidence: Evidence } {
  const answers: Partial<Answers> = {};
  const evidence: Evidence = {};
  const weeks = Math.round(p.days / 7);

  if (p.runs >= MIN_RUNS) {
    if (p.trailRuns / p.runs >= 0.5) {
      answers.use = 'trail';
      evidence.use = `${p.trailRuns} of your ${p.runs} runs climbed like trail runs`;
      answers.trailType = p.mountainShare >= 0.5 ? 'mountain' : 'light';
      evidence.trailType =
        answers.trailType === 'mountain'
          ? 'Most of them climbed steeply'
          : 'Most of them stayed on rolling ground';
    } else {
      answers.use = 'road';
      evidence.use =
        p.treadmillShare >= 0.5
          ? `Most of your ${p.runs} runs were on a treadmill`
          : `${p.runs} runs in ${weeks} weeks, mostly on the road`;
    }

    answers.mileage = p.weeklyRunMiles < 10 ? 'low' : p.weeklyRunMiles < 25 ? 'mid' : 'high';
    evidence.mileage = `About ${formatMiles(p.weeklyRunMiles)} miles a week`;

    if (p.longestRunMiles >= 16) answers.race = 'marathon';
    else if (p.longestRunMiles >= 9) answers.race = 'half';
    if (answers.race) evidence.race = `Your longest run was ${formatMiles(p.longestRunMiles, 1)} miles`;
  } else if (p.walks >= MIN_RUNS || (p.avgDailySteps ?? 0) >= WALKER_STEPS) {
    answers.use = 'walk';
    evidence.use =
      p.avgDailySteps != null
        ? `About ${formatSteps(p.avgDailySteps)} steps a day`
        : `${p.walks} walks in ${weeks} weeks`;
  }

  return { answers, evidence };
}
