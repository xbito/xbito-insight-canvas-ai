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
  title = "Top 10 Banks by Total Awareness",
  suggestions,
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
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">DATE RANGE</span>
            <div className="mt-1">Jan 8, 2024 - Jan 8, 2025</div>
          </div>
          <div>
            <span className="font-medium">INTERVAL</span>
            <div className="mt-1">All</div>
          </div>
          <div>
            <span className="font-medium">DEMOGRAPHIC</span>
            <div className="mt-1">General Population</div>
          </div>
        </div>
      </div>
      <Bar options={options} data={data} className="max-h-[500px]" />
      
      {suggestions && suggestions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-3">Suggested follow-up questions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
              >
                <span>{suggestion}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};