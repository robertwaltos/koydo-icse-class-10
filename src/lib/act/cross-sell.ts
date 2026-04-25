export interface CrossSellApp {
  slug: string;
  name: string;
  reason: string;
  url?: string;
}

const ADMISSIONS_APPS: CrossSellApp[] = [
  { slug: "sat", name: "Koydo SAT", reason: "Similar test structure and shared prep strategies" },
  { slug: "gre-verbal", name: "Koydo GRE Verbal", reason: "Stretch your verbal reasoning after exam practice" },
  { slug: "vocab", name: "Koydo Vocab", reason: "Build the academic vocabulary behind every section" },
];

const K12_APPS: CrossSellApp[] = [
  { slug: "math-junior", name: "Koydo Math", reason: "Reinforce core maths skills between study sessions" },
  { slug: "lingua-en", name: "Koydo English", reason: "Boost reading and writing fundamentals" },
  { slug: "science-learn", name: "Koydo Science", reason: "Stay sharp on STEM concepts and recall" },
];

const PRODUCTIVITY_APPS: CrossSellApp[] = [
  { slug: "planner", name: "Koydo Planner", reason: "Turn goals into a realistic daily study schedule" },
  { slug: "distill", name: "Koydo Distill", reason: "Summarise notes and readings into bite-size reviews" },
  { slug: "scribe", name: "Koydo Scribe", reason: "Polish essays, reflections, and written assignments faster" },
];

const LANGUAGE_APPS: CrossSellApp[] = [
  { slug: "speak", name: "Koydo Speak", reason: "Practice pronunciation and spoken confidence" },
  { slug: "vocab", name: "Koydo Vocab", reason: "Grow high-frequency vocabulary with spaced repetition" },
  { slug: "news", name: "Koydo News", reason: "Learn through current events and short reading drills" },
];

const PROFESSIONAL_APPS: CrossSellApp[] = [
  { slug: "math-learn", name: "Koydo Math", reason: "Keep quantitative skills sharp for technical paths" },
  { slug: "certify", name: "Koydo Certify", reason: "Explore more certification and career prep tracks" },
  { slug: "planner", name: "Koydo Planner", reason: "Manage deadlines, revision blocks, and practice cycles" },
];

const CATEGORY_MAP: Record<string, CrossSellApp[]> = {
  admissions: ADMISSIONS_APPS,
  k12: K12_APPS,
  k12_national: K12_APPS,
  kids: K12_APPS,
  productivity: PRODUCTIVITY_APPS,
  creative: PRODUCTIVITY_APPS,
  language_cert: LANGUAGE_APPS,
  language_learning: LANGUAGE_APPS,
  language_skills: LANGUAGE_APPS,
  professional: PROFESSIONAL_APPS,
  trade: PROFESSIONAL_APPS,
};

export function getCrossSellApps(category: string): CrossSellApp[] {
  return CATEGORY_MAP[category] ?? ADMISSIONS_APPS;
}
