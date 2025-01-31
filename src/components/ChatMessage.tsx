import React from 'react';
import { Message } from '../types';
import { UserCircle, Bot, ArrowRight } from 'lucide-react';
import { DataVisualization } from './DataVisualization';

interface ChatMessageProps {
  message: Message;
  onSuggestionClick: (suggestion: string) => void;
  chartData?: any; // add chartData prop
}

function SuggestionButtons({
  suggestions,
  onSuggestionClick,
}: {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
        >
          <span>{suggestion}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSuggestionClick, chartData }) => {
  const isAI = message.sender === 'ai';
  
  return (
    <div className={`flex gap-3 ${isAI ? 'bg-gray-50' : ''} p-4`}>
      {isAI ? (
        <Bot className="w-8 h-8 text-blue-600" />
      ) : (
        <UserCircle className="w-8 h-8 text-gray-600" />
      )}
      <div className="flex-1">
        <div className="font-medium text-sm text-gray-900">
          {isAI ? 'AI Assistant' : 'You'}
        </div>
        <div className="mt-1 text-gray-700">
          {message.content}
        </div>
        {isAI && message.suggestions && message.suggestions.length > 0 && message.id == '1' && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-gray-500">Suggested follow-up questions:</div>
            <SuggestionButtons
              suggestions={message.suggestions}
              onSuggestionClick={onSuggestionClick}
            />
          </div>
        )}
        {isAI && message.id !== '1' && chartData && (
          <div className="mt-4">
            <DataVisualization
              data={chartData}
              suggestions={message.suggestions}
              onSuggestionClick={onSuggestionClick}
            />
          </div>
        )}


        {isAI && message.id !== '1' && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-gray-500">Suggested follow-up questions:</div>
            <SuggestionButtons
              suggestions={message.suggestions}
              onSuggestionClick={onSuggestionClick}
            />
          </div>
        )}
        {isAI && message.id !== '1' && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
            <span className="mr-2">Was this helpful?</span>
            <button
              className="inline-flex items-center gap-1 px-2 py-1 text-green-600 bg-green-50 hover:bg-green-100 rounded-full transition-colors"
            >
              👍
            </button>
            <button
              className="inline-flex items-center gap-1 px-2 py-1 text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors ml-2"
            >
              👎
            </button>
          </div>
        )}
      </div>
    </div>
  );
};