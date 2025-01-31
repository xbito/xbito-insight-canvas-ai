import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { BarChart } from 'lucide-react';
import { getInitialSuggestions } from './initialSuggestions';
import {
  generateAISuggestionsResponse,
  determineChartType,
  determineChatTopic,
  generateBarChartData,
  generateTimeSeriesData
} from './aiService';

import {
  Industry
} from './types';

const defaultSuggestions = [
  "Show me the top car brands by awareness.",
  "Which coffee shops are most popular with millennials?"
];

export default function App() {
  const [industry, setIndustry] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [useO1ForSuggestions, setUseO1ForSuggestions] = useState(false); 

  const createInitialMessage = (ind?: string, comp?: string): Message => ({
    id: '1',
    content: 'Hello! I can help you analyze brand sentiment and audience data and create visualizations. What would you like to know?',
    sender: 'ai',
    timestamp: new Date(),
    suggestions: (ind || comp)
      ? getInitialSuggestions(ind as Industry, comp || '')
      : defaultSuggestions,
  });

  const [messages, setMessages] = useState<Message[]>([createInitialMessage()]);

  const [chatTitle, setChatTitle] = useState<string>('New Chat');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    setLoading(true);
    const allUserQueries = messages
      .filter(m => m.sender === 'user')
      .map((m, index) => `Query ${index + 1}: ${m.content}`)
      .join('\n');
    const updatedAllUserQueries = `${allUserQueries}\nQuery ${messages.filter(m => m.sender === 'user').length + 1}: ${content}`;

    const [suggestions, chartType, topic] = await Promise.all([
      generateAISuggestionsResponse(
        content,
        useOpenAI,
        industry,
        companyName,
        useO1ForSuggestions,
        updatedAllUserQueries
      ),
      determineChartType(content, industry, companyName, useOpenAI),
      determineChatTopic(updatedAllUserQueries, industry, companyName, useOpenAI)
    ]);
    let chartResult;
    if (chartType === "Time series chart") {
      chartResult = await generateTimeSeriesData(content, useOpenAI, industry, companyName);
    } else {
      chartResult = await generateBarChartData(content, useOpenAI, industry, companyName);
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: chartResult.content,
      sender: 'ai',
      timestamp: new Date(),
      suggestions,
      chartData: chartResult.chartData
    };
    setMessages(prev => [...prev, aiMessage]);
    setChatTitle(topic);
    setLoading(false);
  };

  useEffect(() => {
    // Update only the first AI message suggestions if industry or company name changed
    setMessages((prev) => {
      const updatedAIMessage = createInitialMessage(industry, companyName);
      return [updatedAIMessage, ...prev.slice(1)];
    });
  }, [industry, companyName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BarChart className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Data Chat AI</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100">
            {chatTitle}
          </button>
        </div>
        <div className="mt-auto p-4 border-t border-gray-200">
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

          <label className="block text-sm font-medium text-gray-700 mt-4" htmlFor="companyName">Company Name</label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
          />

          <div className="mt-4 flex items-center">
            <label className="block text-sm font-medium text-gray-700 mr-2">Use OpenAI</label>
            <input
              type="checkbox"
              checked={useOpenAI}
              onChange={(e) => setUseOpenAI(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="mt-4 flex items-center">
            <label className="block text-sm font-medium text-gray-700 mr-2">Use o1 for suggestions</label>
            <input
              type="checkbox"
              checked={useO1ForSuggestions}
              onChange={(e) => setUseO1ForSuggestions(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />  
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSuggestionClick={handleSendMessage}
                chartData={message.chartData} // pass chart data
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

        {/* Input */}
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}
