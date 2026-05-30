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
