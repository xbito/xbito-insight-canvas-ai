export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
  chartData?: ChartData;
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