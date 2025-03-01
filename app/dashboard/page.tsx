'use client';

import { useState } from 'react';
import { Plus, BarChart, LineChart, PieChart, Sparkles } from 'lucide-react';
import { Message } from '../lib/types';

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
  const [isCreating, setIsCreating] = useState(false);

  const handleStartCreation = () => {
    setIsCreating(true);
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

    // TODO: Send prompt to AI service and get visualization suggestions
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {!isCreating ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your Dashboard</h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Tell me what insights you're looking for, and I'll help you create a personalized dashboard with relevant visualizations.
            </p>
            <button
              onClick={handleStartCreation}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Start Creating
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex">
          {/* Prompts and Configuration Panel */}
          <div className="w-96 border-r border-gray-200 bg-white p-4 flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dashboard Builder</h3>
            
            {/* Prompt Input */}
            <form onSubmit={handlePromptSubmit} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to visualize?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentPrompt}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  placeholder="e.g., Show me brand sentiment trends over time"
                  className="flex-1 rounded-md border-gray-300 shadow-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>

            {/* Prompt History */}
            <div className="flex-1 overflow-y-auto">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="mb-4 p-4 bg-gray-50 rounded-lg"
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

          {/* Visualization Preview Area */}
          <div className="flex-1 p-6">
            {prompts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Add prompts to start creating your dashboard</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {/* Placeholder for visualizations */}
                <div className="aspect-[4/3] bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>Visualization will appear here</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}