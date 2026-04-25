import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  FileText,
  Home,
  GraduationCap,
  Landmark,
  HeartPulse,
  ImageIcon,
  Tractor,
  Folder,
  type LucideIcon,
  CheckCircle2,
  Circle,
  Printer,
} from "lucide-react";
import type { EligibilityMatch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

type Group = {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  matchers: RegExp[];
};

const GROUPS: Group[] = [
  {
    key: "identity",
    title: "Identity Proof",
    description: "Get from UIDAI, NSDL or Election Commission.",
    icon: CreditCard,
    matchers: [
      /aadhaar/i,
      /\bpan\b/i,
      /voter/i,
      /passport/i,
      /driving licen[cs]e/i,
      /citizenship/i,
      /identity proof/i,
    ],
  },
  {
    key: "family",
    title: "Family & Income",
    description: "Issued by your Tehsildar, Block office or municipality.",
    icon: Folder,
    matchers: [
      /income/i,
      /caste/i,
      /\bobc\b/i,
      /\bsc\b/i,
      /\bst\b/i,
      /\bebc\b/i,
      /\bdnt\b/i,
      /ration/i,
      /bpl/i,
      /family/i,
      /single girl child/i,
      /husband/i,
    ],
  },
  {
    key: "bank",
    title: "Bank & Financial",
    description: "From your bank or post office.",
    icon: Landmark,
    matchers: [
      /bank/i,
      /passbook/i,
      /account/i,
      /post office/i,
      /nominee/i,
      /financial/i,
      /bank statement/i,
    ],
  },
  {
    key: "education",
    title: "Education & Admission",
    description: "From your school, college or board.",
    icon: GraduationCap,
    matchers: [
      /mark ?sheet/i,
      /bonafide/i,
      /admission/i,
      /class \d/i,
      /cbse/i,
      /course/i,
      /institution/i,
      /institute/i,
      /selection letter/i,
      /\b10th\b/i,
      /\b12th\b/i,
    ],
  },
  {
    key: "land",
    title: "Land & Agriculture",
    description: "From your Patwari, Tehsildar or revenue office.",
    icon: Tractor,
    matchers: [
      /land/i,
      /khasra/i,
      /khata/i,
      /khatauni/i,
      /sowing/i,
      /crop/i,
      /cultivation/i,
    ],
  },
  {
    key: "property",
    title: "Property & Address",
    description: "Property document or any utility bill in your name.",
    icon: Home,
    matchers: [
      /address/i,
      /residence/i,
      /property/i,
      /utility bill/i,
      /electricity bill/i,
      /shop/i,
      /vendor/i,
      /letter of recommendation/i,
      /lor/i,
    ],
  },
  {
    key: "health",
    title: "Health & Disability",
    description: "From a government doctor or designated medical board.",
    icon: HeartPulse,
    matchers: [
      /disability/i,
      /medical/i,
      /mcp/i,
      /jsy/i,
      /discharge/i,
      /age proof/i,
      /death certificate/i,
      /birth certificate/i,
      /good health/i,
    ],
  },
  {
    key: "business",
    title: "Business & Project",
    description: "If you are applying for a loan or self-employment scheme.",
    icon: FileText,
    matchers: [
      /business/i,
      /project/i,
      /quotation/i,
      /machinery/i,
      /pitch/i,
      /dpiit/i,
      /incorporation/i,
      /gst/i,
      /registration/i,
    ],
  },
  {
    key: "photos",
    title: "Photographs",
    description: "Recent passport-size colour photos.",
    icon: ImageIcon,
    matchers: [/photograph/i, /\bphoto\b/i],
  },
];

type ChecklistItem = {
  label: string;
  schemes: string[];
};

function classify(label: string): string {
  for (const g of GROUPS) {
    if (g.matchers.some((m) => m.test(label))) return g.key;
  }
  return "other";
}

function normalize(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

export function DocumentChecklist({ matches }: { matches: EligibilityMatch[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("doc-checklist-state");
    if (saved) {
      try {
        setChecked(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("doc-checklist-state", JSON.stringify(checked));
  }, [checked]);

  const grouped = useMemo(() => {
    const dedup = new Map<string, ChecklistItem>();
    for (const m of matches) {
      for (const doc of m.scheme.requiredDocuments) {
        const key = normalize(doc);
        if (!key) continue;
        if (!dedup.has(key)) {
          dedup.set(key, { label: doc.trim(), schemes: [] });
        }
        const item = dedup.get(key)!;
        if (!item.schemes.includes(m.scheme.name)) {
          item.schemes.push(m.scheme.name);
        }
      }
    }

    const buckets: Record<string, ChecklistItem[]> = {};
    for (const item of dedup.values()) {
      const g = classify(item.label);
      if (!buckets[g]) buckets[g] = [];
      buckets[g].push(item);
    }
    for (const k of Object.keys(buckets)) {
      buckets[k].sort((a, b) => b.schemes.length - a.schemes.length);
    }
    return buckets;
  }, [matches]);

  const totalDocs = useMemo(
    () => Object.values(grouped).reduce((acc, arr) => acc + arr.length, 0),
    [grouped],
  );
  const collected = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked],
  );

  const visibleGroups = GROUPS.filter((g) => grouped[g.key]?.length).concat(
    grouped.other?.length
      ? [
          {
            key: "other",
            title: "Other Documents",
            description: "Other supporting items mentioned by these schemes.",
            icon: FileText,
            matchers: [],
          },
        ]
      : [],
  );

  if (totalDocs === 0) return null;

  const toggle = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const handlePrint = () => window.print();

  return (
    <section
      id="documents-checklist"
      className="mb-12 bg-card border rounded-2xl shadow-sm overflow-hidden print:break-before-page"
    >
      <div className="p-6 md:p-8 border-b bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <FileText size={14} /> Personalised Checklist
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Documents you'll need
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              We've combined the document lists across all {matches.length}{" "}
              matched schemes and removed duplicates. Tick each one off as you
              collect it — your progress is saved in this browser.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 print:hidden">
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Progress
              </div>
              <div className="font-bold text-lg">
                {collected} / {totalDocs}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-full"
            >
              <Printer size={14} className="mr-2" /> Print checklist
            </Button>
          </div>
        </div>

        <div className="mt-5 h-2 bg-muted rounded-full overflow-hidden print:hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{
              width: totalDocs ? `${(collected / totalDocs) * 100}%` : "0%",
            }}
          />
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {visibleGroups.map((g) => {
          const items = grouped[g.key];
          if (!items?.length) return null;
          const Icon = g.icon;
          return (
            <div key={g.key} className="print:break-inside-avoid">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg leading-tight">
                    {g.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {g.description}
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {items.map((item) => {
                  const key = `${g.key}::${normalize(item.label)}`;
                  const isChecked = !!checked[key];
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          isChecked
                            ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                            : "bg-background border-border hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        {isChecked ? (
                          <CheckCircle2
                            size={20}
                            className="text-green-600 dark:text-green-400 shrink-0 mt-0.5"
                          />
                        ) : (
                          <Circle
                            size={20}
                            className="text-muted-foreground shrink-0 mt-0.5"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium text-sm ${
                              isChecked
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {item.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Needed for {item.schemes.length}{" "}
                            {item.schemes.length === 1 ? "scheme" : "schemes"}:{" "}
                            <span className="text-foreground/70">
                              {item.schemes.slice(0, 2).join(", ")}
                              {item.schemes.length > 2
                                ? ` +${item.schemes.length - 2} more`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
