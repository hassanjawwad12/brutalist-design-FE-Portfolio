import type { HTMLAttributes, ReactNode, Ref } from "react";

type Elevation = "low" | "raised" | "floating";
type Tone = "regular" | "strong";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Drop-shadow depth. Default "raised". */
  elevation?: Elevation;
  /** "strong" = more opaque, for text-heavy content that needs AA contrast. */
  tone?: Tone;
  /** Adds the designed hover lift + specular sheen. */
  interactive?: boolean;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Reusable Liquid Glass surface. All visual treatment (blur, rim, shadow, hover
 * sheen) lives in the `.glass` class; this component just maps props to the
 * data-attributes that class keys off. React 19 ref-as-prop — no forwardRef.
 */
export function GlassPanel({
  elevation = "raised",
  tone = "regular",
  interactive = false,
  className = "",
  children,
  ref,
  ...rest
}: GlassPanelProps) {
  return (
    <div
      ref={ref}
      className={`glass ${className}`.trim()}
      data-elevation={elevation}
      data-tone={tone}
      data-interactive={interactive || undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
