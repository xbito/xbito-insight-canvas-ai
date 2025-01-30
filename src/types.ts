import { z } from 'zod';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
  chartData?: ChartData;
  chatTitle?: string;
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

export const ContentSuggestions = z.object({
  content: z.string(),
  suggestions: z.array(z.string())
});

export const ChatTopicSchema = z.object({
  topic: z.string()
});

export const ChartTypeSchema = z.object({
  chartType: z.string()
});

export const ChartDataSchema = z.object({
  labels: z.array(z.string()),
  title: z.string(),
  dateRange: z.string(),
  demographic: z.string(),
  datasets: z.array(z.object({
    label: z.string(),
    data: z.array(z.number()),
    backgroundColor: z.array(z.string()),
    borderColor: z.array(z.string()),
    borderWidth: z.number()
  }))
});

export const TimeSeriesDataSchema = z.object({
  labels: z.array(z.string()),
  title: z.string(),
  dateRange: z.string(),
  demographic: z.string(),
  datasets: z.array(z.object({
    label: z.string(),
    data: z.array(z.number()),
    backgroundColor: z.string(),
    borderColor: z.string(),
    borderWidth: z.number()
  }))
});
