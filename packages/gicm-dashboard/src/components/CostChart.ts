import type { CostDataPoint, DashboardTheme } from "../types.js";
import { formatPrice } from "../formatters.js";

export interface CostChartProps {
  data: CostDataPoint[];
  theme?: DashboardTheme;
}

export interface CostChartRender {
  points: Array<{
    label: string;
    cost: string;
    budget: string | null;
    savings: string | null;
    overBudget: boolean;
  }>;
  summary: {
    totalCost: string;
    totalBudget: string | null;
    totalSavings: string;
    avgDaily: string;
  };
}

/**
 * Render cost visualization data from cost data points.
 */
export function renderCostChart(props: CostChartProps): CostChartRender {
  const { data, theme: _theme } = props;

  let totalCost = 0;
  let totalBudget = 0;
  let totalSavings = 0;
  let hasBudget = false;

  const points = data.map((point) => {
    totalCost += point.cost;

    if (point.budget !== undefined) {
      hasBudget = true;
      totalBudget += point.budget;
    }

    if (point.savings !== undefined) {
      totalSavings += point.savings;
    }

    const overBudget =
      point.budget !== undefined ? point.cost > point.budget : false;

    return {
      label: point.date,
      cost: formatPrice(point.cost),
      budget: point.budget !== undefined ? formatPrice(point.budget) : null,
      savings: point.savings !== undefined ? formatPrice(point.savings) : null,
      overBudget,
    };
  });

  const avgDaily = data.length > 0 ? totalCost / data.length : 0;

  return {
    points,
    summary: {
      totalCost: formatPrice(totalCost),
      totalBudget: hasBudget ? formatPrice(totalBudget) : null,
      totalSavings: formatPrice(totalSavings),
      avgDaily: formatPrice(avgDaily),
    },
  };
}
