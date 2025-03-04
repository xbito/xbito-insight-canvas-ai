'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart, 
  LineChart, 
  MessageSquare,
  Plus,
  ChevronRight
} from 'lucide-react';

// API client for testing API endpoint
async function testApiEndpoint(): Promise<{ message: string; timestamp: string }> {
  const response = await fetch('/api/hello');
  if (!response.ok) {
    throw new Error('API endpoint not ready');
  }
  return response.json();
}

export default function Home() {
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  
  // Mock dashboard data for demonstration
  const recentDashboards = [
    { id: 1, title: 'Brand Sentiment Analysis', date: 'Created 2 days ago' },
    { id: 2, title: 'Marketing Campaign Performance', date: 'Created 1 week ago' },
    { id: 3, title: 'Consumer Trend Analysis', date: 'Created 2 weeks ago' }
  ];

  // Check if API is ready on mount
  useState(() => {
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
  });

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* API Status Indicator */}
      {apiReady !== null && (
        <div className={`fixed top-2 right-2 z-50 px-3 py-1 rounded text-white text-sm ${
          apiReady ? 'bg-green-500' : 'bg-red-500'
        }`}>
          API: {apiReady ? 'Connected' : 'Disconnected'}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to Insight Canvas AI</h1>
          <p className="text-gray-600 mt-2">
            Conversational Analytics for Brand Intelligence
          </p>
        </div>
        
        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link href="/chat" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg text-gray-800">Chat Analysis</h3>
                <p className="text-gray-600 mt-1">Ask questions and get AI-powered insights</p>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start">
              <div className="bg-purple-100 p-3 rounded-lg">
                <LineChart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg text-gray-800">Create Dashboard</h3>
                <p className="text-gray-600 mt-1">Build custom visualizations of your data</p>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Recent Dashboards Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Dashboards</h2>
            <button className="flex items-center text-blue-600 hover:text-blue-800">
              <span>View all</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md">
            {recentDashboards.length > 0 ? (
              <div>
                {recentDashboards.map((dashboard) => (
                  <div 
                    key={dashboard.id} 
                    className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <BarChart className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-800">{dashboard.title}</h3>
                        <p className="text-gray-500 text-sm">{dashboard.date}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>No recent dashboards. Create one to get started.</p>
                <button className="mt-4 flex items-center justify-center gap-2 mx-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  <Plus className="h-4 w-4" /> 
                  Create Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}