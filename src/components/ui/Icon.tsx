import type { ReactNode } from "react";

interface IconProps {
  /** Square size in px. Default 18. */
  size?: number;
  children: ReactNode;
}

/**
 * Shared inline-SVG wrapper — consistent stroke/cap/join across the app's line
 * icons. Pass raw <path>/<circle>/<rect> children; color follows `currentColor`.
 */
export function Icon({ size = 18, children }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
