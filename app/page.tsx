'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, Industry } from './lib/types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { BarChart } from 'lucide-react';
import { getInitialSuggestions } from './lib/initialSuggestions';

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

async function testApiEndpoint(): Promise<{ message: string; timestamp: string }> {
  const response = await fetch('/api/hello');
  if (!response.ok) {
    throw new Error('API endpoint not ready');
  }
  return response.json();
}

const defaultSuggestions = [
  "Show me the top car brands by awareness.",
  "Which coffee shops are most popular with millennials?"
];

export default function Home() {
  // State declarations for context and configuration
  const [industry, setIndustry] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState("United States"); // Country selector state
  // availableModels drives the model select options and suggestions comparison
  const availableModels = ["Llama 3.1", "GPT 4o", "o1-mini", "gpt-4o-mini", "o1-preview", "gpt-4-turbo", "gpt-3.5-turbo"];
  const [modelName, setModelName] = useState(availableModels[0]);
  // New state for comparing suggestions
  const [compareSuggestions, setCompareSuggestions] = useState(false);
  
  // Create the initial message (welcome message with suggestions)
  const createInitialMessage = (ind?: string, comp?: string): Message => ({
    id: '1',
    content: 'Hello! I can help you analyze brand sentiment and audience data and create visualizations. What would you like to know?',
    sender: 'ai',
    timestamp: new Date(),
    suggestions: (ind || comp)
      ? getInitialSuggestions(ind as Industry, comp || '')
      : defaultSuggestions,
  });

  // Messages state holds the conversation history
  const [messages, setMessages] = useState<Message[]>([createInitialMessage()]);

  const [chatTitle, setChatTitle] = useState<string>('New Chat');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for API status checking
  const [apiReady, setApiReady] = useState<boolean | null>(null);

  // Check if API is ready on mount
  useEffect(() => {
    async function checkApiStatus() {
      try {
        await testApiEndpoint();
        setApiReady(true);
      } catch (error) {
        console.error("API not ready:", error);
        setApiReady(false);
      }
    }
    
    checkApiStatus();
  }, []);

  // Function to handle sending messages from the user
  const handleSendMessage = async (content: string) => {
    // Create and add the user's message to conversation history
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Begin loading - AI response is being fetched
    setLoading(true);

    try {
      // Use our new API client to send the message to our backend
      const response = await sendChatMessage(content, {
        industry,
        companyName,
        country,
        modelName,
        previousMessages: messages,
        compareSuggestions: compareSuggestions
      });
      
      // Add the AI response to the conversation
      setMessages(prev => [...prev, response.aiResponse]);
      setChatTitle(response.topic);
    } catch (error) {
      console.error('Error sending chat message:', error);
      // Add error message to conversation
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
    // Update only the first AI message suggestions if industry or company name changed
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
    <div className="flex h-screen bg-gray-100">
      {/* API Status Indicator */}
      {apiReady !== null && (
        <div className={`fixed top-2 right-2 z-50 px-3 py-1 rounded text-white text-sm ${
          apiReady ? 'bg-green-500' : 'bg-red-500'
        }`}>
          API: {apiReady ? 'Connected' : 'Disconnected'}
        </div>
      )}
      
      {/* Sidebar: Contains chat title, context selectors (Country, Industry, Company, Model) */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BarChart className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Data Chat AI</h1>
          </div>
        </div>
        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-4">
          <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100">
            {chatTitle}
          </button>
        </div>
        {/* Context Selectors */}
        <div className="mt-auto p-4 border-t border-gray-200">
          {/* Country Selector */}
          <label className="block text-sm font-medium text-gray-700 mt-4" htmlFor="countrySelect">Country</label>
          <select
            id="countrySelect"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
          >
            <option value="United States">United States</option>
            <option value="Peru">Peru</option>
            <option value="Canada">Canada</option>
            <option value="Mexico">Mexico</option>
            <option value="United Kingdom">United Kingdom</option>
          </select>
          {/* Industry Selector */}
          <label className="block text-sm font-medium text-gray-700" htmlFor="industrySelect">Industry</label>
          <select
            id="industrySelect"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
          >
            <option value="">Select Industry</option>
            <option value="automobiles">Automobiles</option>
            <option value="airlines">Airlines</option>
            <option value="beverage">Beverage</option>
            <option value="retail">Retail</option>
            <option value="banks">Banks</option>
            <option value="phones">Phones</option>
            <option value="food">Food</option>
            <option value="cosmetics">Cosmetics</option>
            <option value="apparel">Apparel</option>
            <option value="electronics">Electronics</option>
            <option value="media">Media</option>
            <option value="social-media-apps">Social Media apps</option>
            <option value="health-pharma">Health/Pharma</option>
            <option value="sports">Sports</option>
            <option value="appliances">Appliances</option>
          </select>

          {/* Company Name Input */}
          <label className="block text-sm font-medium text-gray-700 mt-4" htmlFor="companyName">Company Name</label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
          />

          {/* Model Selector driven by availableModels */}
          <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Model</label>
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="block w-full border-gray-300 rounded-md"
          >
            {availableModels.map(model => (
              <option key={model} value={model}>{model}{model === availableModels[0] ? ' (default)' : ''}</option>
            ))}
          </select>
          {/* New Compare Suggestions Checkbox */}
          <div className="mt-4 flex items-center">
            <input
              id="compareSuggestions"
              type="checkbox"
              checked={compareSuggestions}
              onChange={(e) => setCompareSuggestions(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="compareSuggestions" className="ml-2 block text-sm text-gray-700">
              Compare suggestions
            </label>
          </div>
        </div>
      </div>
      {/* Main Content: Chat conversation and user input */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSuggestionClick={handleSendMessage}
                chartData={message.chartData} // pass chart data if available
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

        {/* Chat Input Component */}
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}