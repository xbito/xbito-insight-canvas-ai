'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, BarChart, LineChart, PieChart, Sparkles, Bot, UserCircle, Send, ArrowRight } from 'lucide-react';
import { Message } from '../lib/types';
import { getInitialSuggestions } from '../lib/initialSuggestions';
import { useAppContext } from '../lib/ContextProvider';
import { DataVisualization } from '../components/DataVisualization';

interface DashboardVisualization {
  type: 'bar' | 'line' | 'pie';
  title: string;
  description: string;
  data?: any;
}

interface DashboardPrompt {
  id: string;
  prompt: string;
  response?: string;
  insights?: string;
  visualizations?: DashboardVisualization[];
  isLoading?: boolean;
}

interface ContextBuildingMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// API client for context building questions
async function getContextBuildingQuestions(
  userPrompt: string,
  previousMessages: ContextBuildingMessage[],
  context: {
    industry?: string;
    companyName?: string;
    country?: string;
    userPersona?: string;
    modelName: string;
  }
): Promise<{ message: string, isContextComplete: boolean }> {
  const response = await fetch('/api/dashboard/context', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      userPrompt, 
      previousMessages,
      context
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get context building questions');
  }

  return response.json();
}

// API client for dashboard generation
async function generateDashboard(
  userPrompt: string,
  contextMessages: ContextBuildingMessage[],
  context: {
    industry?: string;
    companyName?: string;
    country?: string;
    userPersona?: string;
    modelName: string;
  }
): Promise<{ insights: string, visualizations: DashboardVisualization[] }> {
  const response = await fetch('/api/dashboard/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userPrompt,
      contextMessages,
      context
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate dashboard');
  }

  return response.json();
}

export default function DashboardPage() {
  const { industry, companyName, country, userPersona } = useAppContext();
  
  // Model-related state - same as chat experience
  const availableModels = ["Llama 3.1", "GPT 4o", "o1-mini", "gpt-4o-mini", "o1-preview", "gpt-4-turbo", "gpt-3.5-turbo", "gpt-4.5-preview"];
  const [modelName, setModelName] = useState(availableModels[0]);
  
  const [prompts, setPrompts] = useState<DashboardPrompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  
  // Context building state
  const [isContextBuilding, setIsContextBuilding] = useState(false);
  const [contextMessages, setContextMessages] = useState<ContextBuildingMessage[]>([]);
  const [contextInput, setContextInput] = useState('');
  const [isContextComplete, setIsContextComplete] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get some default suggestions
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

    // Start the context building process
    setIsContextBuilding(true);
    
    const userMessage: ContextBuildingMessage = {
      id: Date.now().toString(),
      content: currentPrompt,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setContextMessages([userMessage]);
    
    // Trigger the first AI clarifying question
    try {
      setIsLoadingContext(true);
      const response = await getContextBuildingQuestions(
        currentPrompt,
        [userMessage],
        {
          industry,
          companyName,
          country,
          userPersona,
          modelName
        }
      );
      
      const aiMessage: ContextBuildingMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setContextMessages(prev => [...prev, aiMessage]);
      setIsContextComplete(response.isContextComplete);
    } catch (error) {
      console.error('Error getting clarifying questions:', error);
      // Add error message
      const errorMessage: ContextBuildingMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setContextMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingContext(false);
    }
  };
  
  // Handle sending context responses
  const handleContextResponse = async () => {
    if (!contextInput.trim()) return;
    
    const userMessage: ContextBuildingMessage = {
      id: Date.now().toString(),
      content: contextInput,
      sender: 'user', 
      timestamp: new Date(),
    };
    
    setContextMessages(prev => [...prev, userMessage]);
    setContextInput('');
    
    try {
      setIsLoadingContext(true);
      const response = await getContextBuildingQuestions(
        currentPrompt,
        [...contextMessages, userMessage],
        {
          industry,
          companyName,
          country,
          userPersona,
          modelName
        }
      );
      
      const aiMessage: ContextBuildingMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setContextMessages(prev => [...prev, aiMessage]);
      setIsContextComplete(response.isContextComplete);
      
      // If context is complete, create the dashboard prompt
      if (response.isContextComplete) {
        // Create placeholder prompt while generating
        const newPrompt: DashboardPrompt = {
          id: Date.now().toString(),
          prompt: currentPrompt,
          response: "AI is generating visualizations based on your requirements...",
          isLoading: true
        };
        
        setPrompts(prev => [...prev, newPrompt]);
        
        try {
          // Generate dashboard based on the collected context
          const dashboardData = await generateDashboard(
            currentPrompt,
            [...contextMessages, userMessage, aiMessage],
            {
              industry,
              companyName,
              country,
              userPersona,
              modelName
            }
          );
          
          // Update the prompt with actual dashboard data
          setPrompts(prev => prev.map(p => {
            if (p.id === newPrompt.id) {
              return {
                ...p,
                response: undefined,
                insights: dashboardData.insights,
                visualizations: dashboardData.visualizations,
                isLoading: false
              };
            }
            return p;
          }));
        } catch (error) {
          console.error('Error generating dashboard:', error);
          // Update the prompt with error information
          setPrompts(prev => prev.map(p => {
            if (p.id === newPrompt.id) {
              return {
                ...p,
                response: "Sorry, there was an error generating the dashboard visualizations.",
                isLoading: false
              };
            }
            return p;
          }));
        }
        
        // Reset everything after dashboard generation completes
        setIsContextBuilding(false);
        setContextMessages([]);
        setCurrentPrompt('');
        setSelectedSuggestion(null);
        setIsContextComplete(false);
      }
    } catch (error) {
      console.error('Error processing context response:', error);
      const errorMessage: ContextBuildingMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your response. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setContextMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingContext(false);
    }
  };
  
  // Auto-scroll to the bottom when context messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [contextMessages]);
  
  // Cancel context building mode
  const cancelContextBuilding = () => {
    setIsContextBuilding(false);
    setContextMessages([]);
    setIsContextComplete(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Model Selection Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="mt-1 block w-56 border-gray-300 rounded-md shadow-sm"
                disabled={isContextBuilding}
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}{model === availableModels[0] ? ' (default)' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {!isContextBuilding ? (
        // Split layout - top section for dashboard builder
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
                    {prompt.insights && !prompt.isLoading && (
                      <p className="mt-2 text-sm text-gray-600">{prompt.insights}</p>
                    )}
                    {prompt.visualizations && prompt.visualizations.length > 0 && (
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
                    {prompt.isLoading && (
                      <div className="flex items-center mt-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-gray-400 mr-2"></div>
                        <span className="text-sm text-gray-500">Generating dashboard...</span>
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
                  {/* Get the latest prompt with visualizations */}
                  {prompts.length > 0 && prompts[prompts.length - 1].visualizations ? (
                    <>
                      {/* Dashboard insights */}
                      {prompts[prompts.length - 1].insights && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <h4 className="text-md font-medium text-blue-800 mb-2">Dashboard Insights</h4>
                          <p className="text-sm text-blue-700">{prompts[prompts.length - 1].insights}</p>
                        </div>
                      )}
                      
                      {/* Grid of visualizations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {prompts[prompts.length - 1].visualizations?.map((viz, index) => (
                          <div key={index} className="flex flex-col">
                            <h4 className="text-md font-medium text-gray-800 mb-2">{viz.title}</h4>
                            <div className="aspect-[4/3] bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 flex-1">
                              {viz.data ? (
                                <div className="h-full">
                                  <DataVisualization data={viz.data} />
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                  <p>Visualization data loading...</p>
                                </div>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">{viz.description}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Placeholder for visualizations */}
                      <div className="aspect-[4/3] bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="h-full flex items-center justify-center text-gray-400">
                          {prompts[prompts.length - 1].isLoading ? (
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-400 mb-2"></div>
                              <p>Generating visualizations...</p>
                            </div>
                          ) : (
                            <p>Visualization will appear here</p>
                          )}
                        </div>
                      </div>
                      <div className="aspect-[4/3] bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="h-full flex items-center justify-center text-gray-400">
                          {prompts[prompts.length - 1].isLoading ? (
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-400 mb-2"></div>
                              <p>Generating visualizations...</p>
                            </div>
                          ) : (
                            <p>Visualization will appear here</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Context Building Chat Interface 
        <div className="flex-1 flex flex-col h-full">
          <div className="border-b border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Building Dashboard Context</h3>
                <button 
                  onClick={cancelContextBuilding}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Let's build a dashboard for: <span className="font-medium">{currentPrompt}</span>
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-4xl mx-auto">
              {contextMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex gap-3 ${message.sender === 'ai' ? 'bg-gray-50' : 'bg-white'} p-4 mb-4`}
                >
                  {message.sender === 'ai' ? (
                    <Bot className="w-8 h-8 text-blue-600" />
                  ) : (
                    <UserCircle className="w-8 h-8 text-gray-600" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      {message.sender === 'ai' ? 'AI Assistant' : 'You'}
                    </div>
                    <div className="mt-1 text-gray-700">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoadingContext && (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-400"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Context Input */}
          <div className="border-t border-gray-200 bg-white">
            <div className="max-w-4xl mx-auto p-4">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleContextResponse();
                }} 
                className="flex gap-4"
              >
                <input
                  type="text"
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="Answer the question..."
                  disabled={isContextComplete || isLoadingContext}
                  className="flex-1 min-w-0 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isContextComplete || isLoadingContext || !contextInput.trim()}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}