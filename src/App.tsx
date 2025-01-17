import React, { useState, useRef, useEffect } from 'react';
import { Message, ChartData } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { BarChart } from 'lucide-react';
import ollama from 'ollama';

// Simulated AI response generator
const generateAIResponse = async (userQuery: string) => {
  // Example call to local Llama API
  const example_suggestions = [
    "Show me the top car brands by awareness.",
    "Which coffee shops are most popular with millennials?",
    "What are the most trusted smartphone brands globally?",
    "Which fitness app is preferred by Gen Z users?",
  ]
  const response = await ollama.chat({
    model: 'llama3.1',
    format: 'json',
    messages :[
      {
        role: 'user',
        content: `Please return a JSON object with "content" introducing the chart and "suggestions" as an array of single-sentence suggestions as simple strings. The suggestions should be phrased as if the user was the one that is going to send that message. Don't instruct the user on what to think about next, rather exactly suggest what phrase he may use as a response/follow up. The suggestions should aim to generate more graphs to analyze brand sentiment and audience data and create visualizations. Here general example suggestions: ${example_suggestions.join(', ')}. User query: "${userQuery}"`
      }
    ]
  });
  const data = await response;
  console.log(data.message.content, typeof(data.message.content));
  const json_data = JSON.parse(data.message.content);
  // If the response came with suggestions in an unexpected format, like a list of objects rather than a list of phrases, try to extract the phrases:
  if (json_data.suggestions && json_data.suggestions.length > 0 && typeof(json_data.suggestions[0]) === 'object') {
    json_data.suggestions = json_data.suggestions.map((suggestion: any) => suggestion.phrase);
  }
  return json_data;
};

const generateChartData = async (userQuery: string) => {
  const resp = await ollama.chat({
    model: 'llama3.1',
    format: 'json',
    messages: [
      {
        role: 'user',
        content: `We have a TypeScript interface ChartData with this shape:
{
  labels: string[];
  title: string;
  dateRange: string;
  demographic: string;
  datasets: [{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }]
}.
Please produce "chartData" strictly matching that shape for a bar chart with up to 10 labels each corresponding to a brand
Each label will have a matching record in the datasets data array with each being a percentage (0-100). 
Include title, dateRange, demographic. Generate fictional but believable data. 
User query: "${userQuery}"`
      }
    ]
  });
  const parsed = JSON.parse(resp.message.content);
  console.log(parsed);
  return parsed;
};

const determineChatTopic = async (userQuery: string) => {
  const response = await ollama.chat({
    model: 'llama3.1',
    format: 'json',
    messages: [
      {
        role: 'user',
        content: `Please determine the topic of the conversation based on the user query: "${userQuery}". Return a JSON object with a single property "topic" that contains the topic as a string.`
      }
    ]
  });
  const data = await response;
  const json_data = JSON.parse(data.message.content);
  return json_data.topic;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I can help you analyze brand sentiment and audience data and create visualizations. What would you like to know?',
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        "Show me the top car brands by awareness.",
        "Which coffee shops are most popular with millennials?",
        "What are the most trusted smartphone brands globally?",
        "Which fitness app is preferred by Gen Z users?",
      ]
    },
  ]);
  const [chatTitle, setChatTitle] = useState<string>('New Chat');
  const [loading, setLoading] = useState(false);
  const [industry, setIndustry] = useState('');
  const [companyName, setCompanyName] = useState('');
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
    const data = await generateAIResponse(content);
    const chartResult = await generateChartData(content);
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: data.content,
      sender: 'ai',
      timestamp: new Date(),
      suggestions: data.suggestions,
      chartData: chartResult
    };
    setMessages(prev => [...prev, aiMessage]);

    const topic = await determineChatTopic(content);
    setChatTitle(topic);
    setLoading(false);
  };

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
