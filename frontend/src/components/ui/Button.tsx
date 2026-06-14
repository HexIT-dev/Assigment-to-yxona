import { cx } from "../../lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-terracotta-500 text-cream-50 hover:bg-terracotta-600 shadow-[var(--shadow-soft)]",
  secondary:
    "bg-cobalt-500 text-cream-50 hover:bg-cobalt-600 shadow-[var(--shadow-soft)]",
  gold: "bg-gold-400 text-cobalt-800 hover:bg-gold-500 shadow-[var(--shadow-soft)]",
  outline:
    "border border-cobalt-300 text-cobalt-600 hover:bg-cobalt-50 bg-transparent",
  ghost: "text-cobalt-600 hover:bg-cream-200 bg-transparent",
  danger: "bg-[var(--color-danger)] text-white hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[0.95rem] gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2",
        "active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
