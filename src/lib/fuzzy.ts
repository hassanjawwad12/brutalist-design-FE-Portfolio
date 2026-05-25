export interface FuzzyMatch<T> {
  item: T;
  score: number;
}

const scoreOne = (text: string, query: string): number => {
  if (!query) return 0;
  const t = text.toLowerCase();
  const q = query.toLowerCase();

  if (t === q) return 1000;
  if (t.startsWith(q)) return 800 - (t.length - q.length);

  let score = 0;
  let lastIndex = -1;
  let streak = 0;
  for (const ch of q) {
    const idx = t.indexOf(ch, lastIndex + 1);
    if (idx === -1) return -1;
    if (idx === lastIndex + 1) {
      streak += 1;
      score += 10 + streak * 4;
    } else {
      streak = 0;
      score += 2;
    }
    if (idx === 0 || /[\/_\.-]/.test(t[idx - 1] ?? "")) {
      score += 8;
    }
    lastIndex = idx;
  }
  return score;
};

export const fuzzyRank = <T>(
  items: T[],
  query: string,
  getText: (item: T) => string,
): FuzzyMatch<T>[] => {
  if (!query) return items.map((item) => ({ item, score: 0 }));
  const out: FuzzyMatch<T>[] = [];
  for (const item of items) {
    const score = scoreOne(getText(item), query);
    if (score < 0) continue;
    out.push({ item, score });
  }
  out.sort((a, b) => b.score - a.score);
  return out;
};

export const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1).fill(0);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prevDiag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        prevDiag + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prevDiag = cur;
    }
  }
  return prev[b.length];
};

export const suggestSimilar = (
  input: string,
  candidates: string[],
): string | null => {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = levenshtein(input, c);
    if (d < bestDist && d <= Math.max(2, Math.floor(c.length / 2))) {
      bestDist = d;
      best = c;
    }
  }
  return best;
};
