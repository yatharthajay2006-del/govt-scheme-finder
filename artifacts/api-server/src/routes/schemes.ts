import { Router, type IRouter, type Request, type Response } from "express";
import { db, schemesTable } from "@workspace/db";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  ListSchemesQueryParams,
  CreateSchemeBody,
  UpdateSchemeParams,
  UpdateSchemeBody,
  DeleteSchemeParams,
  GetSchemeParams,
} from "@workspace/api-zod";
import { serializeScheme } from "../lib/eligibility";

const router: IRouter = Router();

router.get("/schemes", async (req: Request, res: Response) => {
  const parsed = ListSchemesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  const { category, search } = parsed.data;
  const conds = [];
  if (category) conds.push(eq(schemesTable.category, category));
  if (search) {
    const like = `%${search}%`;
    conds.push(
      or(
        ilike(schemesTable.name, like),
        ilike(schemesTable.shortDescription, like),
        ilike(schemesTable.description, like),
        sql`${schemesTable.tags}::text ILIKE ${like}`,
      )!,
    );
  }

  const rows = conds.length
    ? await db
        .select()
        .from(schemesTable)
        .where(and(...conds))
        .orderBy(desc(schemesTable.popularity), schemesTable.name)
    : await db
        .select()
        .from(schemesTable)
        .orderBy(desc(schemesTable.popularity), schemesTable.name);

  res.json(rows.map(serializeScheme));
});

router.get("/schemes/popular", async (_req, res) => {
  const rows = await db
    .select()
    .from(schemesTable)
    .orderBy(desc(schemesTable.popularity), schemesTable.name)
    .limit(6);
  res.json(rows.map(serializeScheme));
});

router.get("/schemes/:id", async (req, res) => {
  const parsed = GetSchemeParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const row = await db
    .select()
    .from(schemesTable)
    .where(eq(schemesTable.id, parsed.data.id))
    .limit(1);
  if (row.length === 0) {
    return res.status(404).json({ error: "Scheme not found" });
  }
  res.json(serializeScheme(row[0]));
});

router.post("/schemes", async (req, res) => {
  const parsed = CreateSchemeBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid scheme data" });
  }
  const data = parsed.data;
  const inserted = await db
    .insert(schemesTable)
    .values({
      slug: data.slug,
      name: data.name,
      nameHindi: data.nameHindi ?? null,
      category: data.category,
      ministry: data.ministry ?? null,
      shortDescription: data.shortDescription,
      description: data.description,
      benefits: data.benefits,
      requiredDocuments: data.requiredDocuments,
      applySteps: data.applySteps,
      officialLink: data.officialLink,
      applicableStates: data.applicableStates,
      tags: data.tags,
      eligibilityRules: data.eligibilityRules.map((r) => ({
        field: r.field,
        operator: r.operator,
        value: r.value,
        label: r.label,
      })) as never,
      eligibilitySummary: data.eligibilitySummary,
      popularity: data.popularity ?? 0,
      isCentralScheme:
        data.isCentralScheme === undefined || data.isCentralScheme === null
          ? data.applicableStates.length === 0
            ? 1
            : 0
          : data.isCentralScheme
            ? 1
            : 0,
      lastUpdated: data.lastUpdated ?? new Date().toISOString().slice(0, 10),
    })
    .returning();
  res.json(serializeScheme(inserted[0]));
});

router.patch("/schemes/:id", async (req, res) => {
  const params = UpdateSchemeParams.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  const body = UpdateSchemeBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid scheme data" });

  const data = body.data;
  const updated = await db
    .update(schemesTable)
    .set({
      slug: data.slug,
      name: data.name,
      nameHindi: data.nameHindi ?? null,
      category: data.category,
      ministry: data.ministry ?? null,
      shortDescription: data.shortDescription,
      description: data.description,
      benefits: data.benefits,
      requiredDocuments: data.requiredDocuments,
      applySteps: data.applySteps,
      officialLink: data.officialLink,
      applicableStates: data.applicableStates,
      tags: data.tags,
      eligibilityRules: data.eligibilityRules.map((r) => ({
        field: r.field,
        operator: r.operator,
        value: r.value,
        label: r.label,
      })) as never,
      eligibilitySummary: data.eligibilitySummary,
      popularity: data.popularity ?? 0,
      isCentralScheme:
        data.isCentralScheme === undefined || data.isCentralScheme === null
          ? data.applicableStates.length === 0
            ? 1
            : 0
          : data.isCentralScheme
            ? 1
            : 0,
      lastUpdated: data.lastUpdated ?? new Date().toISOString().slice(0, 10),
    })
    .where(eq(schemesTable.id, params.data.id))
    .returning();

  if (updated.length === 0) {
    return res.status(404).json({ error: "Scheme not found" });
  }
  res.json(serializeScheme(updated[0]));
});

router.delete("/schemes/:id", async (req, res) => {
  const parsed = DeleteSchemeParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
  const deleted = await db
    .delete(schemesTable)
    .where(eq(schemesTable.id, parsed.data.id))
    .returning({ id: schemesTable.id });
  if (deleted.length === 0) {
    return res.status(404).json({ error: "Scheme not found" });
  }
  res.json({ success: true, id: deleted[0].id });
});

export default router;
