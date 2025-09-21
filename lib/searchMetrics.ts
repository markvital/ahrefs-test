import seedrandom from 'seedrandom';

export interface SearchTrendPoint {
  month: string;
  value: number;
}

export interface SearchMetrics {
  totalMonthlySearches: number;
  averageMonthlySearches: number;
  rank: number;
  trend: SearchTrendPoint[];
}

function buildMonthLabels(): string[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toLocaleString('en', { month: 'short', year: 'numeric' }));
  }
  return months;
}

const MONTH_LABELS = buildMonthLabels();

export function generateSearchTrend(slug: string): SearchTrendPoint[] {
  const rng = seedrandom(slug);
  return MONTH_LABELS.map((month, index) => {
    const base = 250 + rng.quick() * 500;
    const seasonal = Math.sin((index / 12) * Math.PI * 2) * (40 + rng.quick() * 30);
    const trendSignal = Math.max(30, Math.round(base + seasonal + rng.quick() * 120));
    return { month, value: trendSignal };
  });
}

export function buildMetricsFromTrend(trend: SearchTrendPoint[], rank: number): SearchMetrics {
  const totalMonthlySearches = trend.reduce((sum, point) => sum + point.value, 0);
  const averageMonthlySearches = Math.round(totalMonthlySearches / trend.length);
  return {
    totalMonthlySearches,
    averageMonthlySearches,
    rank,
    trend,
  };
}
