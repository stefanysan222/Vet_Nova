import type { ComponentType, ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
}

const STYLES = {
  primary:
    "inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center rounded-xl border border-surface-200 bg-white px-6 py-3 text-sm font-semibold text-surface-900 shadow-card transition hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-60",
};

export default function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  disabled = false,
  icon: Icon,
  className = "",
}: ButtonProps) {
  const cls = `${STYLES[variant]} ${className}`.trim();

  const content = (
    <>
      {children}
      {Icon && <Icon className="ml-2 h-4 w-4" />}
    </>
  );

  if (href) {
    return <a href={href} className={cls}>{content}</a>;
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {content}
    </button>
  );
}
