'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, Industry } from '../lib/types';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { getInitialSuggestions } from '../lib/initialSuggestions';
import { useAppContext } from '../lib/ContextProvider';

interface APIChatResponse {
  aiResponse: Message;
  topic: string;
}

// API client for making requests to our Next.js API endpoints
async function sendChatMessage(message: string, context: {
  industry?: string;
  companyName?: string;
  country?: string;
  modelName: string;
  previousMessages: Message[];
  compareSuggestions?: boolean;
}): Promise<APIChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, context }),
  });

  if (!response.ok) {
    throw new Error('Failed to send chat message');
  }

  return response.json();
}

const defaultSuggestions = [
  "Show me the top car brands by awareness.",
  "Which coffee shops are most popular with millennials?"
];

export default function ChatPage() {
  const { industry, companyName, country } = useAppContext();
  
  // Model-related state
  const availableModels = ["Llama 3.1", "GPT 4o", "o1-mini", "gpt-4o-mini", "o1-preview", "gpt-4-turbo", "gpt-3.5-turbo"];
  const [modelName, setModelName] = useState(availableModels[0]);
  const [compareSuggestions, setCompareSuggestions] = useState(false);
  
  const createInitialMessage = (ind?: string, comp?: string): Message => ({
    id: '1',
    content: 'Hello! I can help you analyze brand sentiment and audience data and create visualizations. What would you like to know?',
    sender: 'ai',
    timestamp: new Date(),
    suggestions: (ind || comp)
      ? getInitialSuggestions(ind as Industry, comp || '')
      : defaultSuggestions,
  });

  // Chat-related state
  const [messages, setMessages] = useState<Message[]>([createInitialMessage(industry, companyName)]);
  const [chatTitle, setChatTitle] = useState<string>('New Chat');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle sending messages from the user
  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await sendChatMessage(content, {
        industry,
        companyName,
        country,
        modelName,
        previousMessages: messages,
        compareSuggestions: compareSuggestions
      });
      
      setMessages(prev => [...prev, response.aiResponse]);
      setChatTitle(response.topic);
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Effect: Update initial AI message suggestions when industry or company name change
  useEffect(() => {
    setMessages((prev) => {
      const updatedAIMessage = createInitialMessage(industry, companyName);
      return [updatedAIMessage, ...prev.slice(1)];
    });
  }, [industry, companyName]);

  // Effect: Auto-scroll to the bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Model Selection Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="mt-1 block w-56 border-gray-300 rounded-md shadow-sm"
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}{model === availableModels[0] ? ' (default)' : ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center">
            <input
              id="compareSuggestions"
              type="checkbox"
              checked={compareSuggestions}
              onChange={(e) => setCompareSuggestions(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="compareSuggestions" className="ml-2 text-sm text-gray-700">
              Compare model suggestions
            </label>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onSuggestionClick={handleSendMessage}
              chartData={message.chartData}
            />
          ))}
          {loading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-400"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto p-4">
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}