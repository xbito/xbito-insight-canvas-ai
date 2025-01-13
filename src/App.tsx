import React, { useState } from 'react';
import { Message, ChartData } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { DataVisualization } from './components/DataVisualization';
import { BarChart } from 'lucide-react';
import ollama from 'ollama';

// Sample data with real bank awareness data
const sampleChartData: ChartData = {
  labels: [
    'Wells Fargo',
    'Chase',
    'Bank of America',
    'J.P. Morgan',
    'JPMorgan Chase',
    'Capital One',
    'U.S. Bank',
    'Citi',
    'Chime',
    'Citizens Bank'
  ],
  datasets: [
    {
      label: 'Brand Awareness',
      data: [95, 93, 89, 89, 87, 87, 85, 84, 83, 79],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',   // Wells Fargo
        'rgba(251, 191, 36, 0.8)',   // Chase
        'rgba(99, 102, 241, 0.8)',   // Bank of America
        'rgba(99, 102, 241, 0.8)',   // J.P. Morgan
        'rgba(6, 95, 70, 0.8)',      // JPMorgan Chase
        'rgba(14, 165, 233, 0.8)',   // Capital One
        'rgba(14, 165, 233, 0.8)',   // U.S. Bank
        'rgba(22, 163, 74, 0.8)',    // Citi
        'rgba(136, 19, 55, 0.8)',    // Chime
        'rgba(220, 38, 38, 0.8)'     // Citizens Bank
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(251, 191, 36, 1)',
        'rgba(99, 102, 241, 1)',
        'rgba(99, 102, 241, 1)',
        'rgba(6, 95, 70, 1)',
        'rgba(14, 165, 233, 1)',
        'rgba(14, 165, 233, 1)',
        'rgba(22, 163, 74, 1)',
        'rgba(136, 19, 55, 1)',
        'rgba(220, 38, 38, 1)'
      ],
      borderWidth: 1,
    },
  ],
};

// Simulated AI response generator
const generateAIResponse = async (userQuery: string) => {
  // Example call to local Llama API
  const example_suggestions = [
    "Show me the top car brands by awareness.",
    "Which coffee shops are most popular with millennials?",
    "How often do college-educated millenials hear about Nike?",
    "What is the income distribution of people who know about Tesla?",
    "Among those who shop at Walmart, how much do they consider buying from Amazon?",
  ]
  const response = await ollama.chat({
    model: 'llama3.1',
    format: 'json',
    messages :[
      {
        role: 'user',
        content: `Please return a JSON object with "content" introducing the chart and "suggestions" as an array of single-sentence suggestions. The suggestions should be phrased as if the user was the one that is going to send that message. Don't instruct the user on what to think about next, rather exactly suggest what phrase he may use as a response/follow up. The suggestions should aim to generate more graphs to analyze brand sentiment and audience data and create visualizations. Here general example suggestions: ${example_suggestions.join(', ')}. User query: "${userQuery}"`
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
        "How often do college-educated millenials hear about Nike?",
        "What is the income distribution of people who know about Tesla?",
        "Among those who shop at Walmart, how much do they consider buying from Amazon?",
      ]
    },
  ]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    const data = await generateAIResponse(content);
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: data.content,
      sender: 'ai',
      timestamp: new Date(),
      suggestions: data.suggestions
    };
    setMessages(prev => [...prev, aiMessage]);
  };

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
            New Chat
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <React.Fragment key={message.id}>
                <ChatMessage 
                  message={message}
                  onSuggestionClick={handleSendMessage}
                />
                {message.sender === 'ai' && message.id !== '1' && message.content && index === messages.length - 1 && (
                  <div className="p-4">
                    <DataVisualization 
                      data={sampleChartData} 
                      suggestions={message.suggestions}
                      onSuggestionClick={handleSendMessage}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
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