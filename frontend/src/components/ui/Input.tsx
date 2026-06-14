import { cx } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const fieldBase =
  "w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-ink placeholder:text-ink-soft/50 " +
  "transition focus:outline-none focus:border-cobalt-400 focus:ring-2 focus:ring-cobalt-100";

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const fieldId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-semibold text-cobalt-700">
          {label}
        </label>
      )}
      <input id={fieldId} className={cx(fieldBase, error && "border-[var(--color-danger)]", className)} {...props} />
      {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const fieldId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-semibold text-cobalt-700">
          {label}
        </label>
      )}
      <textarea id={fieldId} className={cx(fieldBase, "min-h-[90px] resize-y", error && "border-[var(--color-danger)]", className)} {...props} />
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const fieldId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-semibold text-cobalt-700">
          {label}
        </label>
      )}
      <select id={fieldId} className={cx(fieldBase, "cursor-pointer appearance-none bg-[length:14px] bg-[right_1rem_center] bg-no-repeat", error && "border-[var(--color-danger)]", className)}
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b574e' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")" }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
