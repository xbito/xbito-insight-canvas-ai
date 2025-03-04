import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  generateAISuggestionsResponse,
  determineChartType,
  determineChatTopic,
  generateBarChartData,
  generateTimeSeriesData
} from '../../lib/aiService';
import { Message } from '../../lib/types';

// Available models list for comparison (using the same list as in the frontend)
const availableModels = ["Llama 3.1", "GPT 4o", "o1-mini", "gpt-4o-mini", "o1-preview", "gpt-4-turbo", "gpt-3.5-turbo", "gpt-4.5-preview"];

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    const { industry, companyName, country, userPersona, modelName, previousMessages } = context;
    
    // Extract previous user messages for context
    const allUserQueries = previousMessages
      .filter((m: Message) => m.sender === 'user')
      .map((m: Message, index: number) => `Query ${index + 1}: ${m.content}`)
      .join('\n');
    
    const updatedAllUserQueries = allUserQueries ? 
      `${allUserQueries}\nQuery ${previousMessages.filter((m: Message) => m.sender === 'user').length + 1}: ${message}` : 
      `Query 1: ${message}`;

    // Check if comparison feature is enabled
    const compareSuggestions = context.compareSuggestions;
    
    let suggestions: string[] = [];
    let compareSuggestionsObj: Record<string, string[]> | undefined;
    let chartType: string;
    let topic: string;

    try {
      if (compareSuggestions) {
        // Get other available models excluding the currently selected one
        const otherModels = availableModels.filter(m => m !== modelName);
        // Randomly select 2 additional models
        const randomModels = otherModels
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);
        
        // Get suggestions only for the selected model and the 2 random models
        const modelsToUse = [modelName, ...randomModels];
        
        // Get suggestions for only the models we'll display
        const responses = await Promise.all(
          modelsToUse.map(m =>
            generateAISuggestionsResponse(
              message,
              m,
              industry || '',
              companyName || '',
              country || 'United States',
              updatedAllUserQueries,
              userPersona || ''
            )
          )
        );
        
        // Map responses to models
        compareSuggestionsObj = modelsToUse.reduce((acc, m, idx) => {
          acc[m] = responses[idx];
          return acc;
        }, {} as Record<string, string[]>);

        // Use the currently selected model for the remaining calls
        [chartType, topic] = await Promise.all([
          determineChartType(message, industry || '', companyName || '', country || 'United States', modelName, userPersona || ''),
          determineChatTopic(updatedAllUserQueries, industry || '', companyName || '', country || 'United States', modelName, userPersona || '')
        ]);
      } else {
        // Standard behavior with a single-model suggestion call
        [suggestions, chartType, topic] = await Promise.all([
          generateAISuggestionsResponse(
            message,
            modelName,
            industry || '',
            companyName || '',
            country || 'United States',
            updatedAllUserQueries,
            userPersona || ''
          ),
          determineChartType(message, industry || '', companyName || '', country || 'United States', modelName, userPersona || ''), 
          determineChatTopic(updatedAllUserQueries, industry || '', companyName || '', country || 'United States', modelName, userPersona || '')
        ]);
      }

      // Default values if AI services fail to return expected data
      chartType = chartType || 'Bar chart';
      topic = topic || 'Data Analysis';
      suggestions = suggestions || [];
      
      // Generate chart data based on determined chart type
      let chartResult;
      if (chartType === "Time series chart") {
        chartResult = await generateTimeSeriesData(
          message,
          modelName === "Llama 3.1" ? modelName : "GPT 4o",
          industry || '',
          companyName || '',
          country || 'United States',
          userPersona || ''
        );
      } else {
        chartResult = await generateBarChartData(
          message,
          modelName === "Llama 3.1" ? modelName : "GPT 4o",
          industry || '',
          companyName || '',
          country || 'United States',
          userPersona || ''
        );
      }

      // Ensure chartResult has required properties
      if (!chartResult || !chartResult.content || !chartResult.chartData) {
        throw new Error('Invalid chart data received from AI service');
      }
      
      // Create the AI response message
      const aiResponse: Message = {
        id: Date.now().toString(),
        content: chartResult.content,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: compareSuggestions ? [] : suggestions,
        chartData: chartResult.chartData,
        compareSuggestions: compareSuggestions ? compareSuggestionsObj : undefined
      };
      
      return NextResponse.json({
        aiResponse,
        topic
      });
    } catch (aiError) {
      console.error('AI service error:', aiError);
      // Return a more user-friendly error response
      const errorResponse: Message = {
        id: Date.now().toString(),
        content: 'I apologize, but I encountered an issue processing your request. Please try again or try a different query.',
        sender: 'ai',
        timestamp: new Date(),
        suggestions: ['Show me the top car brands by awareness.', 'Which retailers have the highest customer satisfaction?']
      };
      
      return NextResponse.json({
        aiResponse: errorResponse,
        topic: 'Error Processing Request'
      });
    }
  } catch (error: any) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat request', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}