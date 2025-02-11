import { z } from 'zod';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
  chartData?: ChartData;
  chatTitle?: string;
  // New property to hold suggestions per model when comparing
  compareSuggestions?: Record<string, string[]>;
}

export interface ChartData {
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
}

export const ChatTopicSchema = z.object({
  topic: z.string()
});

export const ChartTypeSchema = z.object({
  chartType: z.string()
});

export const ChartDataSchema = z.object({
  labels: z.array(z.string()).describe('array of brand names that corresponds to the data points'),
  title: z.string().describe('descriptive chart title'),
  dateRange: z.string().describe('time period of the data'),
  demographic: z.string().describe('target population'),
  datasets: z.array(z.object({
    label: z.string().describe('description of what the values represent'),
    data: z.array(z.number()).describe('array of numeric values (percentages 0-100) corresponding to each label'),
    backgroundColor: z.array(z.string()).describe('array of colors for all bars'),
    borderColor: z.array(z.string()).describe('array of colors for all borders'),
    borderWidth: z.number().describe('number for border width')
  }))
});

export const TimeSeriesDataSchema = z.object({
  labels: z.array(z.string()).describe('array of dates or time periods'),
  title: z.string().describe('descriptive chart title'),
  dateRange: z.string().describe('human-readable time period covered by the data'),
  demographic: z.string().describe('target population description'),
  datasets: z.array(z.object({
    label: z.string().describe('brand name'),
    data: z.array(z.number()).describe('array of numeric values (percentages 0-100) corresponding to each time period'),
    backgroundColor: z.string().describe('single color string in rgba format for the area under the line'),
    borderColor: z.string().describe('single color string in rgba format for the line itself'),
    borderWidth: z.number().describe('number for line width')
  })).describe('array of objects, each representing a brands data series')
});

export const SuggestionsSchema = z.object({
  suggestions: z.array(z.string())
});

export const BarChartResponseSchema = z.object({
  content: z.string(),
  chartData: ChartDataSchema
});

export const TimeSeriesResponseSchema = z.object({
  content: z.string(),
  chartData: TimeSeriesDataSchema
});

export type Industry = 'automobiles' | 'airlines' | 'beverage' | 'retail' | 'banks' | 'phones' | 'food' | 'cosmetics' | 'apparel' | 'electronics' | 'media' | 'social-media-apps' | 'health-pharma' | 'sports' | 'appliances';
