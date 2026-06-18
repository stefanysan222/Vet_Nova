import type { ComponentType } from "react";

// Shared types for the VetNova application
export interface Service {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
}

export interface Stat {
  amount: string;
  label: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  icon: ComponentType<{ className?: string }>;
  href: string;
  label: string;
}
