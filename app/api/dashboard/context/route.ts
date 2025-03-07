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

// Main system prompt for dashboard context building
const dashboardContextPrompt = `You are a strategic brand insights consultant helping users build effective dashboards.
Your goal is to ask essential clarifying questions about what the user wants to visualize in their dashboard.
The user has stated a high-level objective, but you need more specific information to create an effective dashboard.

Ask UP TO 5 questions, ONE AT A TIME, to gather necessary context for creating effective dashboard visualizations.
Focus on: time periods, geographic scope, specific metrics, demographic breakdowns, and any specific comparisons needed.

Examples of good clarifying questions:
- What specific time period would you like to analyze for brand awareness?
- Would you prefer to see global data or focus on specific regions?
- Which demographic segments are most important for your analysis?
- Are there specific competitors you'd like to compare against?
- What key metrics would best represent brand awareness for your company?

IMPORTANT INSTRUCTIONS:
1. Ask ONE question at a time and wait for the user's response.
2. Keep your questions concise and directly related to creating dashboard visualizations.
3. After the user has answered AT LEAST 3 questions, or if you believe you have enough information to create 
   an effective dashboard with 3-6 visualizations, indicate completion by responding with:
   "Thank you for providing this information. I now have enough context to create your dashboard."
4. Track what information you've already gathered - don't ask for the same information twice.
5. If the user's initial prompt already contains specific details, don't ask for that information again.`;

export async function POST(request: NextRequest) {
  try {
    const { userPrompt, previousMessages, context } = await request.json();
    const { industry, companyName, country, userPersona, modelName } = context;
    
    // Format context information
    const formattedInfo = buildContextText(industry || '', companyName || '', country || '', userPersona || '');
    const conversationHistory = formatConversationHistory(previousMessages);
    
    // Check if we've asked and received answers to enough questions (at least 3)
    // Count the back-and-forth exchanges (excluding the initial prompt)
    const questionResponsePairs = Math.floor((previousMessages.length - 1) / 2);
    
    let isContextComplete = false;
    let aiResponse = '';
    
    // If we've had at least 3 question-answer pairs, check if we have enough context
    // or generate the next question
    try {
      if (modelName === "Llama 3.1") {
        // Using Ollama with Llama 3.1
        const response = await ollama.chat({
          model: 'llama3.1',
          messages: [
            {
              role: 'system',
              content: dashboardContextPrompt
            },
            {
              role: 'user',
              content: `${formattedInfo}
              
              User's dashboard request: "${userPrompt}"
              
              Current conversation history:
              ${conversationHistory}
              
              Number of questions asked so far: ${questionResponsePairs}
              
              Based on the conversation so far, either:
              1. Ask ONE more clarifying question to gather additional context for the dashboard, OR
              2. If you have enough information (${questionResponsePairs >= 3 ? 'you have asked at least 3 questions' : 'the user has provided very detailed information'}), reply with "Thank you for providing this information. I now have enough context to create your dashboard."
              
              Your response:`
            }
          ]
        });
        
        aiResponse = response.message.content.trim();
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
            content: dashboardContextPrompt
          },
          {
            role: 'user' as const,
            content: `${formattedInfo}
            
            User's dashboard request: "${userPrompt}"
            
            Current conversation history:
            ${conversationHistory}
            
            Number of questions asked so far: ${questionResponsePairs}
            
            Based on the conversation so far, either:
            1. Ask ONE more clarifying question to gather additional context for the dashboard, OR
            2. If you have enough information (${questionResponsePairs >= 3 ? 'you have asked at least 3 questions' : 'the user has provided very detailed information'}), reply with "Thank you for providing this information. I now have enough context to create your dashboard."
            
            Your response:`
          }
        ];
        
        const completion = await openai.chat.completions.create({
          model: actualModel,
          messages,
          temperature: 0.7,
          max_tokens: 300
        });
        
        aiResponse = completion.choices[0].message.content?.trim() || '';
      }
      
      // Check if the response indicates we have enough context
      isContextComplete = aiResponse.includes("Thank you for providing this information") ||
                         aiResponse.includes("I now have enough context") ||
                         aiResponse.includes("sufficient information") ||
                         aiResponse.includes("enough information");
      
    } catch (error) {
      console.error('Error generating dashboard context question:', error);
      aiResponse = "I'm having trouble processing your request. Could you provide more details about what you'd like to see in your dashboard?";
    }
    
    return NextResponse.json({
      message: aiResponse,
      isContextComplete
    });
    
  } catch (error: any) {
    console.error('Error processing dashboard context request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process dashboard context request', 
        details: error.message,
        message: "I'm sorry, there was an error processing your request. Please try again.",
        isContextComplete: false
      },
      { status: 500 }
    );
  }
}