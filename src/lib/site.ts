const stripTrailing = (s: string): string => s.replace(/\/+$/, "");

const fromEnv = (): string => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return stripTrailing(explicit);
  // Vercel sets this automatically on every deployment
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${stripTrailing(vercel)}`;
  return "http://localhost:3000";
};

export const SITE_URL = fromEnv();
