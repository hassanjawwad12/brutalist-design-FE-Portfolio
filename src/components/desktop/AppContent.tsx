import { getApp, type AppId } from "./apps";

/**
 * Resolves a window's body by app id. Phase 3 renders a placeholder; Phase 5
 * swaps in the real app components (About, Projects, GitHub, …).
 */
export function AppContent({ id }: { id: AppId }) {
  const app = getApp(id);
  return (
    <div className="app-stub">
      <span className="app-stub__icon">{app.icon}</span>
      <h3 className="app-stub__title">{app.title}</h3>
      <p className="app-stub__note">This window&rsquo;s content arrives in Phase 5.</p>
    </div>
  );
}
