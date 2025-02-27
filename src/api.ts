// API client for making requests to our Next.js API endpoints
import { Message } from './types';

/**
 * Generic API client for making requests to our Next.js API endpoints
 * @param endpoint - The API endpoint URL (relative to /api)
 * @param method - HTTP method
 * @param body - Request body for POST/PUT
 */
async function apiClient<T = any>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const url = `/api/${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }
  
  return response.json();
}

// API functions for chat and other operations
export async function sendChatMessage(message: string, context: {
  industry?: string;
  companyName?: string;
  country?: string;
  modelName: string;
  previousMessages: Message[];
  compareSuggestions?: boolean;
}) {
  return apiClient<{
    aiResponse: Message;
    topic: string;
  }>('chat', 'POST', {
    message,
    context
  });
}

// Sample endpoint using our API
export async function testApiEndpoint() {
  return apiClient<{ message: string; timestamp: string }>('hello');
}