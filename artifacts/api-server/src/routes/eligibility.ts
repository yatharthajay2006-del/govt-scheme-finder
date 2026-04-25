import { Router, type IRouter } from "express";
import { db, schemesTable, eligibilityChecksTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { CheckEligibilityBody, ParseVoiceInputBody } from "@workspace/api-zod";
import { evaluateScheme, serializeScheme, type Profile } from "../lib/eligibility";
import { parseVoiceInput } from "../lib/voice-parser";

const router: IRouter = Router();

router.post("/eligibility/check", async (req, res) => {
  const parsed = CheckEligibilityBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid profile" });
  }
  const profile = parsed.data as Profile;

  const rows = await db
    .select()
    .from(schemesTable)
    .orderBy(desc(schemesTable.popularity));

  const matches = rows
    .map((scheme) => {
      const r = evaluateScheme(scheme, profile);
      return r.qualifies
        ? {
            scheme: serializeScheme(scheme),
            matchedReasons: r.reasons,
            matchScore: r.score,
          }
        : null;
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort((a, b) => b.matchScore - a.matchScore);

  // Log the check (don't fail the request if logging fails)
  try {
    await db.insert(eligibilityChecksTable).values({
      profile: profile as Record<string, unknown>,
      matchedCount: matches.length,
    });
  } catch {
    // ignore
  }

  res.json({
    profile: parsed.data,
    totalMatched: matches.length,
    matches,
  });
});

router.post("/eligibility/parse-voice", async (req, res) => {
  const parsed = ParseVoiceInputBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { profile, extractedFields } = parseVoiceInput(
    parsed.data.text,
    parsed.data.language ?? null,
  );
  res.json({ profile, extractedFields });
});

export default router;
