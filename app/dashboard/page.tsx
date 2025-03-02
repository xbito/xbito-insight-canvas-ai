'use client';

import { useState } from 'react';
import { Plus, BarChart, LineChart, PieChart, Sparkles } from 'lucide-react';
import { Message } from '../lib/types';
import { getInitialSuggestions } from '../lib/initialSuggestions';

interface DashboardPrompt {
  id: string;
  prompt: string;
  response?: string;
  visualizations?: Array<{
    type: 'bar' | 'line' | 'pie';
    title: string;
    description: string;
    data?: any;
  }>;
}

export default function DashboardPage() {
  const [prompts, setPrompts] = useState<DashboardPrompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  
  // Get some default suggestions - we'll use general ones for now
  const dashboardSuggestions = [
    "I want to track my company's brand awareness",
    "I need to monitor our brand sentiment over time",
    "Help me compare my brand against competitors",
    "I want to visualize customer satisfaction trends",
    "I need to track our social media performance"
  ];

  const handleSuggestionSelect = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setCurrentPrompt(suggestion);
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt.trim()) return;

    const newPrompt: DashboardPrompt = {
      id: Date.now().toString(),
      prompt: currentPrompt,
    };

    setPrompts(prev => [...prev, newPrompt]);
    setCurrentPrompt('');
    setSelectedSuggestion(null);

    // TODO: Send prompt to AI service and get visualization suggestions
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Split layout - top section for dashboard builder */}
      <div className="flex-1 flex flex-col h-full">
        {/* Dashboard Builder Section - Top */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Dashboard Builder</h3>
            
            {/* Welcome message and guided experience */}
            {prompts.length === 0 ? (
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-800">Welcome! What do you want to accomplish today?</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                  {dashboardSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={`text-left p-4 rounded-md transition-colors ${
                        selectedSuggestion === suggestion
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            
            {/* Prompt Input */}
            <form onSubmit={handlePromptSubmit} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {prompts.length === 0 ? "Or describe in detail what you'd like to visualize:" : "What would you like to visualize?"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentPrompt}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  placeholder="e.g., Show me brand sentiment trends over time, broken down by demographic and region"
                  className="flex-1 rounded-md border-gray-300 shadow-sm py-2 px-4"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>

            {/* Prompt History */}
            <div className="space-y-4">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <p className="text-sm text-gray-900 font-medium">{prompt.prompt}</p>
                  {prompt.response && (
                    <p className="mt-2 text-sm text-gray-600">{prompt.response}</p>
                  )}
                  {prompt.visualizations && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {prompt.visualizations.map((viz, i) => {
                        const Icon = viz.type === 'bar' ? BarChart :
                                   viz.type === 'line' ? LineChart : PieChart;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-1 text-xs text-gray-500"
                          >
                            <Icon className="w-4 h-4" />
                            <span>{viz.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visualization Preview Area - Bottom */}
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dashboard Preview</h3>
            
            {prompts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 min-h-[400px] flex items-center justify-center flex-col text-gray-500">
                <img 
                  src="/dashboard-placeholder.svg" 
                  alt="Dashboard placeholder" 
                  className="w-32 h-32 mb-4 opacity-25"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p className="text-center max-w-md">
                  Select a suggestion or enter your own prompt above to create your dashboard. 
                  We'll generate visualizations based on your needs.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Placeholder for visualizations */}
                  <div className="aspect-[4/3] bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <p>Visualization will appear here</p>
                    </div>
                  </div>
                  <div className="aspect-[4/3] bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <p>Visualization will appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}