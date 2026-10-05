/**
 * The Brooks Shoe Finder quiz, as brooksrunning.com runs it.
 *
 * @ref LLP 0005#the-sites-own-questions — Every question, answer, score, branch
 * and "Behind the Science" line below is copied verbatim from the quiz config
 * that brooksrunning.com/en_us/shoefinder/ embeds in its `data-quiz` attribute
 * ("Shoe Finder S26 US", version 24, read 2026-10-05). The videos are the
 * site's own clips from finders.brooksrunning.com, bundled in `assets/finder`.
 * Only the email page is left out: the app has nowhere to send results.
 */

export type QuestionCode =
  | 'use'
  | 'trailtype'
  | 'training'
  | 'traininguse'
  | 'trainingexperience'
  | 'rundistance'
  | 'injury'
  | 'balance'
  | 'knee'
  | 'flexibility'
  | 'shoefeel'
  | 'features'
  | 'gender';

export type PageCode = QuestionCode | 'checkpoint_bio';

/** Chosen answer codes per question. A single-select question holds one code. */
export type Answers = Partial<Record<QuestionCode, string[]>> & {
  /** US size from the gender page's optional size grid. */
  size?: string;
};

export interface Answer {
  code: string;
  label: string;
  /** The site's score for this answer. Higher means more support. */
  score: number;
  /** The site's branch: the page this answer jumps to instead of `next`. */
  jumpTo?: PageCode;
  /** The site's demonstration clip for this answer (video answers only). */
  video?: number;
  /** "What does this mean?" — the site's text for this answer. */
  why?: string;
  /** The site's short version of `why`, used on its results page. */
  whyShort?: string;
}

export interface Question {
  kind: 'question';
  code: QuestionCode;
  /** The site's progress bar label for this page. */
  progress: string;
  question: string;
  multi: boolean;
  optional: boolean;
  /** `video` answers are clips to choose between; `text` answers are rows. */
  layout: 'text' | 'video';
  /** A clip that demonstrates the question itself (the knee test). */
  video?: number;
  behindScience?: string;
  answers: Answer[];
  next: PageCode | 'end';
}

export interface Checkpoint {
  kind: 'checkpoint';
  code: 'checkpoint_bio';
  title: string;
  description: string;
  button: string;
  next: PageCode;
}

export type Page = Question | Checkpoint;

export const FIRST_PAGE: PageCode = 'use';

/** The site's button labels. */
export const QUIZ_UI = {
  continue: 'Continue',
  noneOfThese: 'None of these',
  behindScience: 'Behind the Science',
  whatDoesThisMean: 'What does this mean?',
  selectSize: 'Select Size (Optional)',
  showResults: 'Show me the results',
  resultsTitle: 'The results are in.',
  resultsLead: 'We suggest:',
} as const;

export const PAGES: Record<PageCode, Page> = {
  use: {
    kind: 'question',
    code: 'use',
    progress: 'Use',
    question: 'Where will you use these shoes?',
    multi: false,
    optional: false,
    layout: 'text',
    answers: [
      { code: 'useroadtread', label: 'Run or Treadmill', score: 0, jumpTo: 'training' },
      { code: 'usetrail', label: 'Trail Run or Hike', score: 0, jumpTo: 'trailtype' },
      { code: 'usegym', label: 'Workout Class or Gym', score: 0, jumpTo: 'training' },
      { code: 'usewalk', label: 'Walk or Everyday Wear', score: 0, jumpTo: 'injury' },
    ],
    next: 'trailtype',
  },
  trailtype: {
    kind: 'question',
    code: 'trailtype',
    progress: 'Trail Type',
    question: 'What type of trail do you want to run on?',
    multi: false,
    optional: false,
    layout: 'text',
    answers: [
      { code: 'smooth', label: 'Smooth', score: 0 },
      { code: 'rugged', label: 'Rocky and Rugged', score: 0 },
    ],
    next: 'training',
  },
  training: {
    kind: 'question',
    code: 'training',
    progress: 'Training',
    question: 'What are you training for?',
    multi: false,
    optional: false,
    layout: 'text',
    behindScience:
      'Comparing your running habits with what you plan to achieve allows us to better prepare you for success in reaching your goals.\n\nFor example, someone who is currently running 0-10 miles a week and plans to train for a marathon will be ramping up their mileage, therefore benefiting from a little more support.\n\nLikewise, someone who runs two miles a week, but does it to stay healthy is not likely to dramatically ramp up their miles.\n\nWith this information, we can better recommend a shoe that will help you along your journey.',
    answers: [
      { code: 'traininghealth', label: 'Health', score: 0, jumpTo: 'trainingexperience' },
      { code: 'training5k10k', label: '5k or 10k', score: 0, jumpTo: 'traininguse' },
      { code: 'traininghalfmarathon', label: 'Half Marathon', score: 5, jumpTo: 'traininguse' },
      { code: 'trainingmarathon', label: 'Marathon', score: 10, jumpTo: 'traininguse' },
      { code: 'trainingultra', label: 'Ultra Marathon (50k+)', score: 10, jumpTo: 'traininguse' },
    ],
    next: 'traininguse',
  },
  traininguse: {
    kind: 'question',
    code: 'traininguse',
    progress: 'Training Use',
    question: 'When do you plan to use this shoe most of the time?',
    multi: false,
    optional: false,
    layout: 'text',
    answers: [
      { code: 'userace', label: 'Race days', score: 0 },
      { code: 'usetraining', label: 'Training days', score: 0 },
    ],
    next: 'trainingexperience',
  },
  trainingexperience: {
    kind: 'question',
    code: 'trainingexperience',
    progress: 'Training Experience',
    question: 'How long have you been running consistently?',
    multi: false,
    optional: false,
    layout: 'text',
    answers: [
      { code: 'experience1', label: '0-2 years', score: 5 },
      { code: 'experience2', label: '3-9 years', score: 0 },
      { code: 'experience3', label: '10+ years', score: 0 },
    ],
    next: 'rundistance',
  },
  rundistance: {
    kind: 'question',
    code: 'rundistance',
    progress: 'Mileage',
    question: 'In the past six months, about how much did you run each week?',
    multi: false,
    optional: false,
    layout: 'text',
    answers: [
      { code: 'rundistance1', label: '0-10 Miles', score: 0 },
      { code: 'rundistance2', label: '11-30 Miles', score: 5 },
      { code: 'rundistance3', label: '31+ Miles', score: 5 },
    ],
    next: 'injury',
  },
  injury: {
    kind: 'question',
    code: 'injury',
    progress: 'Recent Injuries',
    question: 'In the past six months, have you had any pain or injuries in these areas?',
    multi: true,
    optional: true,
    layout: 'text',
    behindScience:
      'Injuries tell us a lot about the kind of support you need. Since some injuries have to do with improper biomechanics, telling us the challenges you are dealing with, or have dealt with, will help us guide you to a shoe.',
    answers: [
      { code: 'knees', label: 'Knees', score: 10 },
      { code: 'leg', label: 'Lower Leg', score: 15 },
      { code: 'foot', label: 'Foot or Arch', score: 10 },
      { code: 'hiporback', label: 'Hip or Low Back', score: 5 },
    ],
    next: 'checkpoint_bio',
  },
  checkpoint_bio: {
    kind: 'checkpoint',
    code: 'checkpoint_bio',
    title: "Take 'em off",
    description:
      'Your shoes, that is. Doing the following exercises barefoot will help us more accurately determine whether you need a Neutral or Support shoe.',
    button: "Okay, they're off",
    next: 'balance',
  },
  balance: {
    kind: 'question',
    code: 'balance',
    progress: 'Balance',
    question: 'Stand on your non-dominant leg. How balanced do you feel?',
    multi: false,
    optional: false,
    layout: 'video',
    behindScience:
      'Every time you land when running, a force 3.5 times your bodyweight is applied to your foot and leg. Soft tissues work to try to stabilize your joints under this greater load.\n\nIf you wobble while standing, imagine the movement your foot will undergo when running.\n\nIf you feel more stable while standing, this indicates your body is able to guide and control the motions of your foot.\n\nThis test helps us understand what shoe will help stabilize your foot while running.',
    answers: [
      {
        code: 'stable',
        label: 'I feel stable',
        score: 0,
        video: require('../../../assets/finder/balance-stable.mp4'),
        why: 'Your forefoot, ankle ligaments and soft tissue are strong and don’t need much additional support.',
        whyShort: 'Your ankles are stable',
      },
      {
        code: 'unstable',
        label: 'I feel a bit unstable',
        score: 20,
        video: require('../../../assets/finder/balance-unstable.mp4'),
        why: 'Your forefoot, ankle ligaments and soft tissue could use some extra help supporting you.',
        whyShort: 'Your ankles could use some support',
      },
    ],
    next: 'knee',
  },
  knee: {
    kind: 'question',
    code: 'knee',
    progress: 'Knee Bend',
    question:
      'Stand with your feet touching each other. Put your hand between your knees and do a few shallow squats. How does the pressure on your hand change?',
    multi: false,
    optional: false,
    layout: 'text',
    video: require('../../../assets/finder/knee-squat.mp4'),
    behindScience:
      'This exercise helps us understand how your knees may perform while running.\n\nIf you feel increased pressure on your hands, your knees are moving in (we call this adduction).\n\nIf you feel decreased pressure on your hands, your knees are moving out (we call this abduction).\n\nIf you feel no added pressure to your hands, your knees are staying straight.\n\nKnees moving in or out during a shallow squat likely results in a higher deviation while running. This deviation could cause the impact above and below your knee to increase.\n\nSome shoes will work better for your unique movement pattern than others. And by the end of these questions, we’ll find some just for you.',
    answers: [
      {
        code: 'increase',
        label: 'The pressure increases',
        score: 15,
        why: 'Your knees are moving in, which is usually linked to a flatter arch.',
        whyShort: 'Your knees and hips are not aligned',
      },
      {
        code: 'decrease',
        label: 'The pressure decreases',
        score: 10,
        why: 'Your knees are moving out, which means you may experience side-to-side motion in your legs while you run or walk.',
        whyShort: 'Your knees and hips are not aligned',
      },
      {
        code: 'nochange',
        label: "The pressure doesn't change",
        score: 0,
        why: 'Your knees stay straight, which means there will be less side-to-side motion in your legs while you run or walk.',
        whyShort: 'Your knees and hips are aligned',
      },
    ],
    next: 'flexibility',
  },
  flexibility: {
    kind: 'question',
    code: 'flexibility',
    progress: 'Flexibility',
    question: 'Stand and bend from the waist. Can you touch your toes without bending your knees?',
    multi: false,
    optional: false,
    layout: 'video',
    behindScience:
      'The flexibility in your legs is correlated to the flexibility of your other joints and ligaments.\n\nIf you have inflexible ligaments (if you’re less bendy), motions at the foot will move through the joint causing movements that affect the knee.\n\nIf you have flexible ligaments (if you’re bendy), the motion of the foot doesn’t necessarily translate to the knee, so the knee moves more independently then what the foot is doing.\n\nKnowing this helps us find the shoe that will best support your knee in motion.',
    answers: [
      {
        code: 'kneesbend',
        label: 'My knees bend',
        score: 20,
        video: require('../../../assets/finder/flexibility-knees-bend.mp4'),
        why: 'You have decreased flexibility. The flexibility in your legs is correlated to the flexibility of your other joints and ligaments.',
        whyShort: 'You have decreased flexibility',
      },
      {
        code: 'kneesdontbend',
        label: "My knees don't bend",
        score: 0,
        video: require('../../../assets/finder/flexibility-knees-straight.mp4'),
        why: 'You have good flexibility. The flexibility in your legs is correlated to the flexibility of your other joints and ligaments.',
        whyShort: 'You have good flexibility',
      },
    ],
    next: 'shoefeel',
  },
  shoefeel: {
    kind: 'question',
    code: 'shoefeel',
    progress: 'Shoe Feel',
    question: 'I want each step to feel:',
    multi: false,
    optional: false,
    layout: 'text',
    answers: [
      { code: 'plush', label: 'Plush and bouncy', score: 0 },
      { code: 'balanced', label: 'Soft and smooth', score: 0 },
      { code: 'responsive', label: 'Light and responsive', score: 0 },
    ],
    next: 'features',
  },
  features: {
    kind: 'question',
    code: 'features',
    progress: 'Features',
    question: 'Are you interested in any of these features?',
    multi: true,
    optional: true,
    layout: 'text',
    answers: [
      { code: 'maxcushion', label: 'Maximum Cushion', score: 0 },
      { code: 'extrasupport', label: 'Extra Support', score: 0 },
      { code: 'flexiblemidsole', label: 'Flexible Midsole', score: 0 },
    ],
    next: 'gender',
  },
  gender: {
    kind: 'question',
    code: 'gender',
    progress: 'Shoe Preference',
    question: 'Which type of shoes do you prefer to run in?',
    multi: false,
    optional: false,
    layout: 'text',
    answers: [
      { code: 'womens', label: "Women's", score: 0 },
      { code: 'mens', label: "Men's", score: 0 },
    ],
    next: 'end',
  },
};

/** The site's US size charts for the gender page's optional size grid. */
export const SIZES: Record<'womens' | 'mens', string[]> = {
  womens: ['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0', '9.5', '10.0', '10.5', '11.0', '11.5', '12.0', '12.5', '13.0'],
  mens: ['7.0', '7.5', '8.0', '8.5', '9.0', '9.5', '10.0', '10.5', '11.0', '11.5', '12.0', '12.5', '13.0', '14.0', '15.0', '16.0'],
};

/** Every page in the site's page order, so summaries list answers the same way. */
export const PAGE_ORDER = Object.keys(PAGES) as PageCode[];

export function question(code: QuestionCode): Question {
  return PAGES[code] as Question;
}

/** The first chosen answer of a single-select question. */
export function chosen(a: Answers, code: QuestionCode): string | undefined {
  return a[code]?.[0];
}

export function answerLabel(code: QuestionCode, value: string | undefined): string {
  return question(code).answers.find((x) => x.code === value)?.label ?? '';
}

/**
 * The pages this shopper sees, in order, following the site's branches.
 *
 * A single-select answer with a `jumpTo` sends the shopper there; otherwise the
 * page's `next` applies. An unanswered page uses `next`, so the path ahead is a
 * projection until the shopper answers. Pages in `skip` were answered from Apple
 * Health and are not asked again, but their answers still decide the branches.
 */
export function flowFor(a: Answers, skip: ReadonlySet<string> = NO_SKIP): PageCode[] {
  const path: PageCode[] = [];
  let code: PageCode | 'end' = FIRST_PAGE;
  while (code !== 'end' && !path.includes(code)) {
    path.push(code);
    const page: Page = PAGES[code];
    if (page.kind === 'checkpoint') {
      code = page.next;
      continue;
    }
    const pick: string | undefined = page.multi ? undefined : a[page.code]?.[0];
    code = page.answers.find((x) => x.code === pick)?.jumpTo ?? page.next;
  }
  return path.filter((id) => !skip.has(id));
}

const NO_SKIP: ReadonlySet<string> = new Set();

/** Only the answers on the shopper's current path: a changed branch drops the rest. */
export function answersOnPath(a: Answers): Answers {
  const onPath = new Set(flowFor(a));
  const out: Answers = { size: a.size };
  for (const code of Object.keys(a) as (keyof Answers)[]) {
    if (code !== 'size' && onPath.has(code)) out[code] = a[code];
  }
  return out;
}

/** The sum of the site's scores for the chosen answers. */
export function supportScore(a: Answers): number {
  let total = 0;
  for (const code of Object.keys(a) as (keyof Answers)[]) {
    if (code === 'size') continue;
    const q = question(code);
    for (const pick of a[code] ?? []) total += q.answers.find((x) => x.code === pick)?.score ?? 0;
  }
  return total;
}
