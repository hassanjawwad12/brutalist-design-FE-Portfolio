import type { Profile } from "@/data/profile";

type Availability = Profile["availability"];

const LABELS: Record<Availability, string> = {
  available: "Available for work",
  selective: "Open to select work",
  closed: "Not currently available",
};

interface AvailabilityDotProps {
  status: Availability;
  /** Override the default status label. */
  label?: string;
  /** Hide the text and render only the dot (with an accessible label). */
  showLabel?: boolean;
}

/**
 * Small status indicator: a colored, softly pulsing dot + label. Pulse animation
 * is disabled under prefers-reduced-motion (see globals.css).
 */
export function AvailabilityDot({
  status,
  label,
  showLabel = true,
}: AvailabilityDotProps) {
  const text = label ?? LABELS[status];
  return (
    <span className="avail" data-status={status}>
      <span className="avail__dot" aria-hidden="true" />
      {showLabel ? (
        <span className="avail__label">{text}</span>
      ) : (
        <span className="sr-only">{text}</span>
      )}
    </span>
  );
}
