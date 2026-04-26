import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  CalendarDays,
  Infinity as InfinityIcon,
  CalendarPlus,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type StatusKind =
  | "always_open"
  | "open_now"
  | "last_date_today"
  | "starting_soon"
  | "closed";

interface Props {
  schemeName: string;
  schemeUrl?: string | null;
  applicationStartDate: string | null;
  applicationEndDate: string | null;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toIcsDate(iso: string): string {
  // All-day events use YYYYMMDD format
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function buildIcs(opts: {
  uid: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  url?: string | null;
}): string {
  const dtStamp =
    new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const dtStart = toIcsDate(opts.startDate);
  // For all-day events, DTEND is exclusive (next day)
  const dtEnd = opts.endDate
    ? toIcsDate(addDays(opts.endDate, 1))
    : toIcsDate(addDays(opts.startDate, 1));

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Benefit Finder//Application Reminder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@benefit-finder`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escapeIcs(opts.title)}`,
    `DESCRIPTION:${escapeIcs(opts.description)}`,
    opts.url ? `URL:${escapeIcs(opts.url)}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(opts.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

function downloadIcs(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function computeStatus(
  start: Date | null,
  end: Date | null,
  today: Date,
): { kind: StatusKind; daysLeft: number | null; daysToStart: number | null } {
  if (!start && !end) {
    return { kind: "always_open", daysLeft: null, daysToStart: null };
  }
  // If only one is provided, treat that as a window with the other open-ended
  if (start && !end) {
    if (today < start) {
      return {
        kind: "starting_soon",
        daysLeft: null,
        daysToStart: daysBetween(today, start),
      };
    }
    return { kind: "open_now", daysLeft: null, daysToStart: null };
  }
  if (!start && end) {
    if (today > end) {
      return { kind: "closed", daysLeft: null, daysToStart: null };
    }
    const diff = daysBetween(today, end);
    if (diff === 0) {
      return { kind: "last_date_today", daysLeft: 0, daysToStart: null };
    }
    return { kind: "open_now", daysLeft: diff, daysToStart: null };
  }
  // Both provided
  if (today < start!) {
    return {
      kind: "starting_soon",
      daysLeft: null,
      daysToStart: daysBetween(today, start!),
    };
  }
  if (today > end!) {
    return { kind: "closed", daysLeft: null, daysToStart: null };
  }
  const diff = daysBetween(today, end!);
  if (diff === 0) {
    return { kind: "last_date_today", daysLeft: 0, daysToStart: null };
  }
  return { kind: "open_now", daysLeft: diff, daysToStart: null };
}

const STYLE: Record<
  StatusKind,
  {
    label: string;
    badge: string;
    cardBg: string;
    cardBorder: string;
    icon: typeof CheckCircle2;
    iconColor: string;
    headline: string;
  }
> = {
  always_open: {
    label: "Always Open",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    cardBg: "bg-emerald-50/60 dark:bg-emerald-950/20",
    cardBorder: "border-emerald-200 dark:border-emerald-900/40",
    icon: InfinityIcon,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    headline: "Apply any time — this scheme accepts applications throughout the year.",
  },
  open_now: {
    label: "Open Now",
    badge:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-300 dark:border-green-800",
    cardBg: "bg-green-50/60 dark:bg-green-950/20",
    cardBorder: "border-green-200 dark:border-green-900/40",
    icon: CheckCircle2,
    iconColor: "text-green-600 dark:text-green-400",
    headline: "You can apply right now.",
  },
  last_date_today: {
    label: "Last Date Today",
    badge:
      "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-800",
    cardBg: "bg-red-50/60 dark:bg-red-950/20",
    cardBorder: "border-red-200 dark:border-red-900/40",
    icon: AlertTriangle,
    iconColor: "text-red-600 dark:text-red-400",
    headline: "Apply today — the application window closes at the end of the day.",
  },
  starting_soon: {
    label: "Starting Soon",
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    cardBg: "bg-amber-50/60 dark:bg-amber-950/20",
    cardBorder: "border-amber-200 dark:border-amber-900/40",
    icon: Clock,
    iconColor: "text-amber-600 dark:text-amber-400",
    headline: "Application window has not opened yet.",
  },
  closed: {
    label: "Closed",
    badge:
      "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    cardBg: "bg-slate-100/60 dark:bg-slate-900/30",
    cardBorder: "border-slate-200 dark:border-slate-800",
    icon: XCircle,
    iconColor: "text-slate-500 dark:text-slate-400",
    headline: "Applications are currently closed. Watch for the next cycle.",
  },
};

export function ApplicationStatusCard({
  schemeName,
  schemeUrl,
  applicationStartDate,
  applicationEndDate,
}: Props) {
  const [today, setToday] = useState<Date>(() => new Date());
  const { toast } = useToast();

  useEffect(() => {
    // Refresh roughly once per minute so the countdown stays current
    const id = window.setInterval(() => setToday(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const start = applicationStartDate ? new Date(applicationStartDate) : null;
  const end = applicationEndDate ? new Date(applicationEndDate) : null;
  const { kind, daysLeft, daysToStart } = computeStatus(start, end, today);
  const style = STYLE[kind];
  const Icon = style.icon;

  const handleAddReminder = (mode: "start" | "end") => {
    const isStart = mode === "start";
    const dateIso = isStart ? applicationStartDate : applicationEndDate;
    if (!dateIso) return;
    const title = isStart
      ? `${schemeName} — Application Opens`
      : `${schemeName} — Last Date to Apply`;
    const description = isStart
      ? `Application window for "${schemeName}" opens today. Visit the official portal to apply.${schemeUrl ? `\\n\\nOfficial link: ${schemeUrl}` : ""}`
      : `Last date to apply for "${schemeName}". Submit your application before end of day.${schemeUrl ? `\\n\\nOfficial link: ${schemeUrl}` : ""}`;
    const ics = buildIcs({
      uid: `${slugify(schemeName)}-${mode}-${dateIso}`,
      title,
      description,
      startDate: dateIso,
      url: schemeUrl ?? null,
    });
    const filename = `${slugify(schemeName)}-${mode === "start" ? "opens" : "deadline"}.ics`;
    downloadIcs(filename, ics);
    toast({
      title: "Reminder downloaded",
      description: isStart
        ? `Open the .ics file to add the start date to your calendar. You'll get a notification 1 day before ${fmt(dateIso)}.`
        : `Open the .ics file to add the deadline to your calendar. You'll get a notification 1 day before ${fmt(dateIso)}.`,
    });
  };

  const showStartReminder =
    !!applicationStartDate && (kind === "starting_soon" || kind === "open_now");
  const showEndReminder =
    !!applicationEndDate && (kind === "open_now" || kind === "starting_soon");

  return (
    <div
      className={`rounded-2xl border ${style.cardBorder} ${style.cardBg} p-5 md:p-6 shadow-sm print:shadow-none print:border-2`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-black/30 flex items-center justify-center border ${style.cardBorder}`}
        >
          <Icon className={`w-6 h-6 ${style.iconColor}`} aria-hidden />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${style.badge}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {style.label}
            </span>
            {kind === "open_now" && daysLeft !== null && (
              <span className="text-xs font-semibold text-foreground/70">
                · {daysLeft} {daysLeft === 1 ? "day" : "days"} left to apply
              </span>
            )}
            {kind === "starting_soon" && daysToStart !== null && (
              <span className="text-xs font-semibold text-foreground/70">
                · opens in {daysToStart} {daysToStart === 1 ? "day" : "days"}
              </span>
            )}
          </div>

          <p className="text-sm md:text-base text-foreground/90 font-medium leading-snug mb-4">
            {style.headline}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/60 dark:bg-black/20 border border-border/40 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                <CalendarDays className="w-3.5 h-3.5" />
                Application Start Date
              </div>
              <div className="text-sm font-bold text-foreground">
                {applicationStartDate ? fmt(applicationStartDate) : "Open all year"}
              </div>
            </div>
            <div className="rounded-lg bg-white/60 dark:bg-black/20 border border-border/40 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                <CalendarDays className="w-3.5 h-3.5" />
                Application Last Date
              </div>
              <div className="text-sm font-bold text-foreground">
                {applicationEndDate ? fmt(applicationEndDate) : "No fixed deadline"}
              </div>
            </div>
          </div>

          {kind === "open_now" && daysLeft !== null && daysLeft > 0 && (
            <div className="mt-4">
              <div className="h-1.5 w-full bg-white/70 dark:bg-black/30 rounded-full overflow-hidden border border-border/30">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                  style={{
                    width: `${Math.max(5, Math.min(100, (daysLeft / 30) * 100))}%`,
                  }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground mt-1.5">
                Status auto-refreshes every minute based on your current date and time.
              </div>
            </div>
          )}
          {kind !== "open_now" && (
            <div className="mt-3 text-[11px] text-muted-foreground">
              Status auto-refreshes based on your current date.
            </div>
          )}

          {(showStartReminder || showEndReminder) && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                <BellRing className="w-3.5 h-3.5" />
                Notify me when this opens / closes
              </div>
              <div className="flex flex-wrap gap-2">
                {showStartReminder && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-white/70 dark:bg-black/20"
                    onClick={() => handleAddReminder("start")}
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Remind me when it opens
                  </Button>
                )}
                {showEndReminder && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-white/70 dark:bg-black/20"
                    onClick={() => handleAddReminder("end")}
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Remind me before deadline
                  </Button>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground mt-2">
                Downloads a calendar file (.ics) — works with Google Calendar, Apple Calendar,
                Outlook, and your phone. You'll get a notification 1 day before.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
