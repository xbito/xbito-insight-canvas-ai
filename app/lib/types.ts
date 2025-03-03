import { z } from 'zod';

export type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
  chartData?: ChartData | TimeSeriesData;
  compareSuggestions?: Record<string, string[]>;
};

export type ChartData = {
  labels: string[];
  title: string;
  dateRange: string;
  demographic: string;
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
};

export type TimeSeriesData = {
  labels: string[];
  title: string;
  dateRange: string;
  demographic: string;
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
};

export type Industry =
  | 'automobiles'
  | 'airlines'
  | 'beverage'
  | 'retail'
  | 'banks'
  | 'phones'
  | 'food'
  | 'cosmetics'
  | 'apparel'
  | 'electronics'
  | 'media'
  | 'social-media-apps'
  | 'health-pharma'
  | 'sports'
  | 'appliances';

export type UserPersona =
  | 'research-analyst'
  | 'marketing-brand-manager'
  | 'senior-executive'
  | 'communications-pr'
  | 'product-manager'
  | 'market-intelligence'
  | 'customer-insights'
  | 'sales-representative'
  | 'strategy-operations'
  | 'agency-consultant';

export const SuggestionsSchema = z.object({
  suggestions: z.array(z.string()),
});

export const ChartTypeSchema = z.object({
  chartType: z.enum(['Bar chart', 'Time series chart']),
});

export const ChatTopicSchema = z.object({
  topic: z.string(),
});

export const BarChartResponseSchema = z.object({
  content: z.string(),
  chartData: z.object({
    labels: z.array(z.string()),
    title: z.string(),
    dateRange: z.string(),
    demographic: z.string(),
    datasets: z.array(z.object({
      label: z.string(),
      data: z.array(z.number()),
      backgroundColor: z.array(z.string()),
      borderColor: z.array(z.string()),
      borderWidth: z.number(),
    })),
  }),
});

export const TimeSeriesResponseSchema = z.object({
  content: z.string(),
  chartData: z.object({
    labels: z.array(z.string()),
    title: z.string(),
    dateRange: z.string(),
    demographic: z.string(),
    datasets: z.array(z.object({
      label: z.string(),
      data: z.array(z.number()),
      backgroundColor: z.string(),
      borderColor: z.string(),
      borderWidth: z.number(),
    })),
  }),
});