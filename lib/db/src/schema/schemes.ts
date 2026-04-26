import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export type EligibilityRule = {
  field: string;
  operator:
    | "eq"
    | "neq"
    | "lt"
    | "lte"
    | "gt"
    | "gte"
    | "in"
    | "nin"
    | "true"
    | "false";
  value?: unknown;
  label: string;
};

export const schemesTable = pgTable("schemes", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  nameHindi: text("name_hindi"),
  category: text("category").notNull(),
  ministry: text("ministry"),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  benefits: jsonb("benefits").$type<string[]>().notNull().default([]),
  requiredDocuments: jsonb("required_documents")
    .$type<string[]>()
    .notNull()
    .default([]),
  applySteps: jsonb("apply_steps").$type<string[]>().notNull().default([]),
  officialLink: text("official_link").notNull(),
  applicableStates: jsonb("applicable_states")
    .$type<string[]>()
    .notNull()
    .default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  eligibilityRules: jsonb("eligibility_rules")
    .$type<EligibilityRule[]>()
    .notNull()
    .default([]),
  eligibilitySummary: text("eligibility_summary").notNull(),
  popularity: integer("popularity").notNull().default(0),
  isCentralScheme: integer("is_central_scheme").notNull().default(1),
  lastUpdated: text("last_updated"),
  applicationStartDate: text("application_start_date"),
  applicationEndDate: text("application_end_date"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SchemeRow = typeof schemesTable.$inferSelect;
export type InsertSchemeRow = typeof schemesTable.$inferInsert;

export const eligibilityChecksTable = pgTable("eligibility_checks", {
  id: serial("id").primaryKey(),
  profile: jsonb("profile").$type<Record<string, unknown>>().notNull(),
  matchedCount: integer("matched_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type EligibilityCheckRow = typeof eligibilityChecksTable.$inferSelect;
