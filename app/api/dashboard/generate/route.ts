import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import OpenAI from 'openai';
import ollama from 'ollama';
import { env } from '../../../config/env';
import { personaDefinitions } from '../../../lib/personaDefinitions';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
});

interface ContextBuildingMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface DashboardVisualization {
  type: 'bar' | 'line' | 'pie';
  title: string;
  description: string;
  data?: any;
}

interface DashboardGeneration {
  insights: string;
  visualizations: DashboardVisualization[];
}

// Build context text from user info, similar to the chat implementation
function buildContextText(industry: string, companyName: string, country: string, userPersona?: string) {
  let text = '';
  if (industry) {
    text += `Industry: "${industry}". `;
  }
  if (companyName) {
    text += `Company name: "${companyName}". `;
  }
  if (country) {
    text += `Country: "${country}". `;
  }
  
  // Add detailed persona information if available
  if (userPersona && personaDefinitions[userPersona]) {
    const persona = personaDefinitions[userPersona];
    text += `\n\nUSER PERSONA: ${persona.displayName}\n`;
    
    text += "\nRole & Goals:\n";
    persona.description.roleGoals.forEach(goal => {
      text += `- ${goal}\n`;
    });
    
    text += "\nMotivation:\n";
    persona.description.motivation.forEach(motivation => {
      text += `- ${motivation}\n`;
    });
    
    text += "\nChallenges:\n";
    persona.description.challenges.forEach(challenge => {
      text += `- ${challenge}\n`;
    });
    
    text += "\nKey Needs:\n";
    persona.description.keyNeeds.forEach(need => {
      text += `- ${need}\n`;
    });
  }
  return text.trim();
}

// Format conversation history for the AI context
function formatConversationHistory(messages: ContextBuildingMessage[]): string {
  return messages
    .map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.content}`)
    .join('\n\n');
}

// Main system prompt for dashboard generation
const dashboardGenerationPrompt = `You are a strategic brand insights consultant specializing in creating data visualizations for brand awareness and sentiment analysis.

Your task is to generate 3-6 visualizations for a dashboard based on the user's requirements. The visualizations should provide meaningful insights about brand awareness, sentiment, or other metrics requested by the user.

For each visualization, you should specify:
1. The visualization type (bar, line, or pie)
2. A clear, concise title
3. A brief description explaining what insight this visualization provides
4. Placeholder data structure that would be needed for this visualization

The user has already provided context through a series of questions and answers. Use this context to create a cohesive dashboard that addresses their specific needs.

Your response should be in valid JSON format with the following structure:
{
  "insights": "Brief executive summary of what the dashboard shows",
  "visualizations": [
    {
      "type": "bar|line|pie",
      "title": "Visualization title",
      "description": "Brief description of what this visualization shows",
      "data": {
        // Sample data structure appropriate for the visualization type
      }
    },
    // Additional visualizations...
  ]
}

Ensure your response contains at least 3 visualizations and at most 6 visualizations.`;

export async function POST(request: NextRequest) {
  try {
    const { userPrompt, contextMessages, context } = await request.json();
    const { industry, companyName, country, userPersona, modelName } = context;
    
    // Format context information
    const formattedInfo = buildContextText(industry || '', companyName || '', country || '', userPersona || '');
    const conversationHistory = formatConversationHistory(contextMessages);
    
    let dashboardData: DashboardGeneration = {
      insights: '',
      visualizations: []
    };
    
    try {
      if (modelName === "Llama 3.1") {
        // Using Ollama with Llama 3.1
        const response = await ollama.chat({
          model: 'llama3.1',
          format: 'json',
          messages: [
            {
              role: 'system',
              content: dashboardGenerationPrompt
            },
            {
              role: 'user',
              content: `${formattedInfo}
              
              User's dashboard request: "${userPrompt}"
              
              Context conversation history:
              ${conversationHistory}
              
              Generate a dashboard with 3-6 visualizations based on the context above.
              Response must be in proper JSON format with "insights" and "visualizations" properties.`
            }
          ]
        });
        
        try {
          dashboardData = JSON.parse(response.message.content);
        } catch (parseError) {
          console.error('Error parsing Llama JSON response:', parseError);
          // Fallback to default values if JSON parsing fails
          dashboardData = {
            insights: "Error generating insights. Here are some sample visualizations based on your request.",
            visualizations: [
              {
                type: "bar",
                title: "Brand Awareness by Demographic",
                description: "Shows how different demographics are aware of the brand",
                data: { /* Sample data structure */ }
              },
              {
                type: "line",
                title: "Brand Awareness Trend",
                description: "Shows brand awareness over time",
                data: { /* Sample data structure */ }
              },
              {
                type: "pie",
                title: "Brand Awareness by Region",
                description: "Shows regional distribution of brand awareness",
                data: { /* Sample data structure */ }
              }
            ]
          };
        }
      } else {
        // Using OpenAI models
        const actualModel = modelName === "GPT 4o" ? "gpt-4o-2024-08-06" : 
                           modelName === "o1-mini" ? "o1-mini-2024-09-12" :
                           modelName === "gpt-4o-mini" ? "gpt-4o-mini-2024-07-18" :
                           modelName === "o1-preview" ? "o1-preview-2024-09-12" :
                           modelName === "gpt-4-turbo" ? "gpt-4-turbo-2024-04-09" :
                           modelName === "gpt-3.5-turbo" ? "gpt-3.5-turbo-0125" :
                           modelName === "gpt-4.5-preview" ? "gpt-4.5-preview" :
                           modelName === "o3-mini" ? "o3-mini-2025-1-31" :
                           "gpt-4o-2024-08-06"; // Default to GPT 4o
        
        const messages = [
          {
            role: 'system' as const,
            content: dashboardGenerationPrompt
          },
          {
            role: 'user' as const,
            content: `${formattedInfo}
            
            User's dashboard request: "${userPrompt}"
            
            Context conversation history:
            ${conversationHistory}
            
            Generate a dashboard with 3-6 visualizations based on the context above.
            Response must be in proper JSON format with "insights" and "visualizations" properties.`
          }
        ];
        
        const completion = await openai.chat.completions.create({
          model: actualModel,
          messages,
          response_format: { type: "json_object" },
          temperature: 0.7,
        });
        
        try {
          dashboardData = JSON.parse(completion.choices[0].message.content || '{}');
        } catch (parseError) {
          console.error('Error parsing OpenAI JSON response:', parseError);
          // Use default values if parsing fails
          dashboardData = {
            insights: "Error generating insights. Here are some visualizations based on your request.",
            visualizations: [
              {
                type: "bar",
                title: "Brand Awareness by Demographic",
                description: "Shows how different demographics are aware of the brand",
                data: { /* Sample data structure */ }
              },
              {
                type: "line",
                title: "Brand Awareness Trend",
                description: "Shows brand awareness over time",
                data: { /* Sample data structure */ }
              },
              {
                type: "pie",
                title: "Brand Awareness by Region",
                description: "Shows regional distribution of brand awareness",
                data: { /* Sample data structure */ }
              }
            ]
          };
        }
      }
      
      // Ensure we have at least 3 visualizations and at most 6
      if (!dashboardData.visualizations || !Array.isArray(dashboardData.visualizations)) {
        dashboardData.visualizations = [];
      }
      
      if (dashboardData.visualizations.length < 3) {
        // Add default visualizations if needed
        const defaultVisualizations = [
          {
            type: "bar" as const,
            title: "Brand Awareness by Age Group",
            description: "Shows brand awareness across different age demographics",
            data: { /* Sample data structure */ }
          },
          {
            type: "line" as const,
            title: "Brand Awareness Trend (Last 12 Months)",
            description: "Shows how brand awareness has changed over time",
            data: { /* Sample data structure */ }
          },
          {
            type: "pie" as const,
            title: "Brand Awareness by Region",
            description: "Shows regional distribution of brand awareness",
            data: { /* Sample data structure */ }
          }
        ];
        
        while (dashboardData.visualizations.length < 3) {
          dashboardData.visualizations.push(defaultVisualizations[dashboardData.visualizations.length % defaultVisualizations.length]);
        }
      }
      
      // Limit to maximum 6 visualizations
      if (dashboardData.visualizations.length > 6) {
        dashboardData.visualizations = dashboardData.visualizations.slice(0, 6);
      }
      
      // Ensure all visualizations have the correct types
      dashboardData.visualizations = dashboardData.visualizations.map(viz => {
        // Ensure type is one of the allowed values
        if (!['bar', 'line', 'pie'].includes(viz.type)) {
          viz.type = 'bar'; // Default to bar if invalid type
        }
        return viz;
      });
      
    } catch (error) {
      console.error('Error generating dashboard:', error);
      // Provide fallback data
      dashboardData = {
        insights: "Unable to generate custom insights for your request. Here are some general visualizations for brand awareness tracking.",
        visualizations: [
          {
            type: "bar",
            title: "Brand Awareness by Demographic",
            description: "Shows how different demographics are aware of your brand",
            data: { /* Sample data structure */ }
          },
          {
            type: "line",
            title: "Brand Awareness Trend",
            description: "Shows brand awareness over time",
            data: { /* Sample data structure */ }
          },
          {
            type: "pie",
            title: "Brand Awareness by Region",
            description: "Shows regional distribution of brand awareness",
            data: { /* Sample data structure */ }
          }
        ]
      };
    }
    
    return NextResponse.json(dashboardData);
    
  } catch (error: any) {
    console.error('Error processing dashboard generation request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate dashboard',
        details: error.message,
        insights: "An error occurred while generating your dashboard.",
        visualizations: []
      },
      { status: 500 }
    );
  }
}