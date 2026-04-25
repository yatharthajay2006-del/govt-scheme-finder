import type { EligibilityRule, SchemeRow } from "@workspace/db";

export type Profile = {
  name?: string | null;
  age?: number | null;
  gender?: string | null;
  state?: string | null;
  isStudent?: boolean | null;
  educationLevel?: string | null;
  annualIncome?: number | null;
  casteCategory?: string | null;
  hasDisability?: boolean | null;
  isFarmer?: boolean | null;
  employmentStatus?: string | null;
  hasRationCard?: boolean | null;
  isSeniorCitizen?: boolean | null;
};

function valueOf(profile: Profile, field: string): unknown {
  return (profile as Record<string, unknown>)[field];
}

function ruleMatches(rule: EligibilityRule, profile: Profile): boolean {
  const v = valueOf(profile, rule.field);
  switch (rule.operator) {
    case "true":
      return v === true;
    case "false":
      return v === false;
    case "eq":
      return v === rule.value;
    case "neq":
      return v !== rule.value;
    case "lt":
      return typeof v === "number" && typeof rule.value === "number" && v < rule.value;
    case "lte":
      return typeof v === "number" && typeof rule.value === "number" && v <= rule.value;
    case "gt":
      return typeof v === "number" && typeof rule.value === "number" && v > rule.value;
    case "gte":
      return typeof v === "number" && typeof rule.value === "number" && v >= rule.value;
    case "in":
      return Array.isArray(rule.value) && (rule.value as unknown[]).includes(v);
    case "nin":
      return Array.isArray(rule.value) && !(rule.value as unknown[]).includes(v);
    default:
      return false;
  }
}

function ruleAnswerable(rule: EligibilityRule, profile: Profile): boolean {
  const v = valueOf(profile, rule.field);
  if (rule.operator === "true" || rule.operator === "false") {
    return typeof v === "boolean";
  }
  return v !== undefined && v !== null;
}

export function evaluateScheme(
  scheme: SchemeRow,
  profile: Profile,
): { qualifies: boolean; reasons: string[]; score: number } {
  const rules = scheme.eligibilityRules ?? [];
  if (rules.length === 0) {
    return { qualifies: false, reasons: [], score: 0 };
  }

  // Filter to rules the user has supplied data for
  const answerable = rules.filter((r) => ruleAnswerable(r, profile));

  if (answerable.length === 0) {
    return { qualifies: false, reasons: [], score: 0 };
  }

  const matched: EligibilityRule[] = [];
  for (const rule of answerable) {
    if (!ruleMatches(rule, profile)) {
      return { qualifies: false, reasons: [], score: 0 };
    }
    matched.push(rule);
  }

  // Require at least one rule answered AND every answerable rule matched.
  // If some rules are unanswered, lower the score (less confident).
  const coverage = answerable.length / rules.length;
  const score = Math.round(60 + coverage * 40);

  // State filter: if scheme is state-specific and profile.state is set, the state must match
  const states = scheme.applicableStates ?? [];
  if (states.length > 0 && profile.state) {
    const ok = states.some(
      (s) => s.toLowerCase() === String(profile.state).toLowerCase(),
    );
    if (!ok) {
      return { qualifies: false, reasons: [], score: 0 };
    }
  }

  return {
    qualifies: true,
    reasons: matched.map((r) => r.label),
    score,
  };
}

export function serializeScheme(s: SchemeRow) {
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    nameHindi: s.nameHindi ?? null,
    category: s.category,
    ministry: s.ministry ?? null,
    shortDescription: s.shortDescription,
    description: s.description,
    benefits: s.benefits ?? [],
    requiredDocuments: s.requiredDocuments ?? [],
    applySteps: s.applySteps ?? [],
    officialLink: s.officialLink,
    applicableStates: s.applicableStates ?? [],
    tags: s.tags ?? [],
    eligibilityRules: s.eligibilityRules ?? [],
    eligibilitySummary: s.eligibilitySummary,
    popularity: s.popularity,
    createdAt: s.createdAt.toISOString(),
  };
}
