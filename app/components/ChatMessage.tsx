import { Message, ChartData, TimeSeriesData } from '../lib/types';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ChatMessageProps {
  message: Message;
  onSuggestionClick: (suggestion: string) => void;
  chartData?: ChartData | TimeSeriesData;
}

export function ChatMessage({ message, onSuggestionClick, chartData }: ChatMessageProps) {
  const isBar = chartData && 'backgroundColor' in chartData.datasets[0] && Array.isArray(chartData.datasets[0].backgroundColor);

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-3xl rounded-lg p-4 ${
        message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white'
      }`}>
        <p className="mb-2">{message.content}</p>
        
        {/* Chart Visualization */}
        {chartData && (
          <div className="w-full h-64 bg-white rounded-lg p-4 mb-4">
            {isBar ? (
              <Bar
                data={{
                  labels: chartData.labels,
                  datasets: chartData.datasets as ChartData['datasets'],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: chartData.title,
                    },
                    legend: {
                      position: 'top' as const,
                    },
                  },
                }}
              />
            ) : (
              <Line
                data={{
                  labels: chartData.labels,
                  datasets: chartData.datasets as TimeSeriesData['datasets'],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: chartData.title,
                    },
                    legend: {
                      position: 'top' as const,
                    },
                  },
                }}
              />
            )}
          </div>
        )}

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            {message.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="block w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Comparison Suggestions */}
        {message.compareSuggestions && (
          <div className="mt-4 space-y-4">
            {Object.entries(message.compareSuggestions).map(([model, suggestions]) => (
              <div key={model} className="space-y-2">
                <h3 className="font-semibold text-gray-700">{model}</h3>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="block w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}