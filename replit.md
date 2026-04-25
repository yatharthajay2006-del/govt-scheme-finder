# AI Benefit Finder

A full-stack web app that helps Indian students and low-income families discover government schemes (scholarships, healthcare, ration, pensions, employment, women welfare). Users answer a short questionnaire — or speak naturally in Hindi or English — and get a ranked list of schemes they qualify for, with step-by-step apply guides.

## Architecture

This is a pnpm monorepo with three artifacts and several shared workspace libraries.

### Artifacts
- **`artifacts/benefit-finder`** — React + Vite + Tailwind frontend (port 18299, route `/`).
- **`artifacts/api-server`** — Express API server (port 8080, all routes under `/api`).
- **`artifacts/mockup-sandbox`** — design preview server used during development.

### Shared libraries
- **`lib/api-spec`** — OpenAPI 3.0 spec at `openapi.yaml`. Source of truth for all API contracts.
- **`lib/api-client-react`** — auto-generated TanStack Query hooks (`useListSchemes`, `useCheckEligibility`, etc.) and TypeScript types. Regenerate with `pnpm --filter @workspace/api-spec run codegen`.
- **`lib/api-zod`** — auto-generated Zod schemas used by the API server for request validation.
- **`lib/db`** — Drizzle ORM schema and Postgres client. Tables: `schemesTable`, `eligibilityChecksTable`.
- **`scripts`** — Node scripts; run `pnpm --filter @workspace/scripts run seed-schemes` to (re)seed the 12 starter schemes.

## Data model
- `schemes` — id, slug, name, nameHindi, category enum (scholarship, healthcare, ration, agriculture, housing, pension, employment, women, disability, other), ministry, descriptions, benefits[], requiredDocuments[], applySteps[], officialLink, applicableStates[] (empty = all-India), tags[], **eligibilityRules** (JSONB array of `{field, operator, value, label}` rules), eligibilitySummary, popularity.
- `eligibility_checks` — anonymous log of every check (profile JSON + matched count) for analytics.

## Eligibility engine
`artifacts/api-server/src/lib/eligibility.ts` evaluates a user's `EligibilityProfile` against each scheme's rules using the operators `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `in`, `nin`, `true`, `false`. A scheme qualifies when **all** rules pass; the score is the percentage of rules with non-trivial matches, used to rank results.

## Voice input
The frontend uses the Web Speech API (`webkitSpeechRecognition`) with `lang="hi-IN"` or `lang="en-IN"`. The transcript is sent to `POST /api/eligibility/parse-voice`, which uses regex extractors in `artifacts/api-server/src/lib/voice-parser.ts` to pull age, income, gender, student status, farmer status, disability, ration-card and senior-citizen flags from natural speech in either language. Extracted fields auto-fill the multi-step form.

## Internationalisation
`src/lib/i18n.tsx` provides a tiny `I18nProvider` with `useI18n()` returning `{ language, setLanguage, t }`. Translations live in the same file. Switch via the `EN / हिंदी` toggle in the header. Scheme names also use `nameHindi` when language is `hi`.

## Pages (wouter routes)
- `/` Home — hero, animated stats, popular schemes, categories, testimonials, FAQ, CTAs.
- `/check` — 4-step eligibility wizard with voice input on every step.
- `/results` — ranked matches, expandable apply guides, print-ready report (uses `window.print()` + a `@media print` stylesheet — no jsPDF).
- `/schemes` — browseable scheme catalog with search and category tabs.
- `/schemes/:id` — full scheme detail with About / Benefits / Eligibility / Documents / Apply tabs.
- `/saved` — locally bookmarked schemes (localStorage).
- `/admin` — full CRUD over schemes plus stats. **No authentication** (hackathon prototype).

## Design
- Saffron primary (`hsl(25 95% 53%)`), indigo secondary (`hsl(226 58% 39%)`), warm cream background. Defined in `src/index.css`.
- shadcn/ui + lucide-react icons (no emojis anywhere).
- Framer Motion for tasteful scroll-reveal and staggered card entrances.
- Hero illustration generated to depict an Indian student and elderly woman together — warm, trustworthy, accessible.

## How to run locally
Three workflows are configured and start automatically:
- `artifacts/api-server: API Server` — `pnpm --filter @workspace/api-server run dev`
- `artifacts/benefit-finder: web` — `pnpm --filter @workspace/benefit-finder run dev`
- `artifacts/mockup-sandbox: Component Preview Server` — `pnpm --filter @workspace/mockup-sandbox run dev`

After changing `lib/db/src/schema/`, run `pnpm --filter @workspace/db run db:push`. After changing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`. To re-seed the schemes, run `pnpm --filter @workspace/scripts run seed-schemes`.

## Notes
- Free tier — no third-party auth, no Firebase, no external SMS/email. Admin panel is intentionally open.
- The disclaimer in the footer makes clear this is an unofficial discovery tool; official portals are linked from every scheme.
