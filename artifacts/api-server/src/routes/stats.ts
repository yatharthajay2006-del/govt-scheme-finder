import { Router, type IRouter } from "express";
import { db, schemesTable, eligibilityChecksTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats/overview", async (_req, res) => {
  const [{ count: totalSchemes }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schemesTable);

  const [{ count: totalChecks }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(eligibilityChecksTable);

  const byCategoryRows = await db
    .select({
      category: schemesTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(schemesTable)
    .groupBy(schemesTable.category);

  const stateRows = await db.select().from(schemesTable);
  const stateSet = new Set<string>();
  for (const r of stateRows) {
    if (r.applicableStates.length === 0) {
      // counts as covering all-India — add a sentinel
      stateSet.add("__ALL_INDIA__");
    } else {
      for (const s of r.applicableStates) stateSet.add(s);
    }
  }
  // If any all-India scheme exists, treat coverage as 36 (states + UTs).
  // Otherwise count distinct states from state-specific schemes.
  const totalStatesCovered = stateSet.has("__ALL_INDIA__")
    ? 36
    : stateSet.size;

  res.json({
    totalSchemes,
    totalChecks,
    totalStatesCovered,
    byCategory: byCategoryRows.map((r) => ({
      category: r.category,
      count: r.count,
    })),
  });
});

export default router;
