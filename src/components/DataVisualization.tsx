import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChartData } from '../types';
import { ArrowRight } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DataVisualizationProps {
  data: ChartData;
  title?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ 
  data,
  onSuggestionClick
}) => {
  const options = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{data.title}</h2>
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">DATE RANGE</span>
            <div className="mt-1">{data.dateRange}</div>
          </div>
          <div>
            <span className="font-medium">DEMOGRAPHIC</span>
            <div className="mt-1">{data.demographic}</div>
          </div>
        </div>
      </div>
      <Bar options={options} data={data} className="max-h-[500px]" />
      
    </div>
  );
};