import type { ComponentType, ReactNode } from "react";
import { COMMON_STYLES } from "../constants";

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
  const baseStyles = COMMON_STYLES.button[variant];
  const combinedClassName = `${baseStyles} ${className}`.trim();

  const content = (
    <>
      {children}
      {Icon && <Icon className="ml-2 h-4 w-4" />}
    </>
  );

  if (href) {
    return (
      <a href={href} className={combinedClassName}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={combinedClassName}>
      {content}
    </button>
  );
}