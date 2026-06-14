import { cx } from "../../lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("card", className)} {...props}>
      {children}
    </div>
  );
}

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "gold";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-cream-200 text-ink-soft",
  success: "bg-green-100 text-[var(--color-success)]",
  warning: "bg-gold-100 text-gold-700",
  danger: "bg-terracotta-100 text-terracotta-600",
  info: "bg-cobalt-100 text-cobalt-600",
  gold: "bg-gold-400 text-cobalt-800",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-cream-300 border-t-terracotta-500",
        className
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-10 w-10" />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-cream-400 bg-cream-50 px-6 py-14 text-center">
      <p className="font-display text-lg text-cobalt-700">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}
