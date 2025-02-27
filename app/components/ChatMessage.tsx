import { Message, ChartData, TimeSeriesData } from '../lib/types';
import { DataVisualization } from './DataVisualization';

interface ChatMessageProps {
  message: Message;
  onSuggestionClick: (suggestion: string) => void;
  chartData?: ChartData | TimeSeriesData;
}

export function ChatMessage({ message, onSuggestionClick, chartData }: ChatMessageProps) {
  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-3xl rounded-lg p-4 ${
        message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white'
      }`}>
        <p className="mb-2">{message.content}</p>
        
        {/* Chart Visualization */}
        {message.chartData && (
          <div className="my-4">
            <DataVisualization data={message.chartData} />
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