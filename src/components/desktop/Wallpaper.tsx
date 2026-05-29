/**
 * Animated gradient-mesh wallpaper. Four blurred color blobs drift slowly behind
 * the glass surfaces. Pure CSS — animation lives in globals.css and runs on
 * `transform` only (compositor-friendly), disabled under prefers-reduced-motion.
 */
export function Wallpaper() {
  return (
    <div className="wallpaper" aria-hidden="true">
      <span className="wallpaper__blob wallpaper__blob--1" />
      <span className="wallpaper__blob wallpaper__blob--2" />
      <span className="wallpaper__blob wallpaper__blob--3" />
      <span className="wallpaper__blob wallpaper__blob--4" />
      <span className="wallpaper__grain" />
    </div>
  );
}
