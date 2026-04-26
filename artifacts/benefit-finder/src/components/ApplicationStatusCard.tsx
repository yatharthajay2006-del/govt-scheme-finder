import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  CalendarDays,
  Infinity as InfinityIcon,
} from "lucide-react";

type StatusKind =
  | "always_open"
  | "open_now"
  | "last_date_today"
  | "starting_soon"
  | "closed";

interface Props {
  applicationStartDate: string | null;
  applicationEndDate: string | null;
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
  applicationStartDate,
  applicationEndDate,
}: Props) {
  const [today, setToday] = useState<Date>(() => new Date());

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
        </div>
      </div>
    </div>
  );
}
