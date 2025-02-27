import { NextResponse } from 'next/server';
import { env } from '../../config/env';

export async function GET() {
  try {
    // Check OpenAI API key
    const hasOpenAI = Boolean(env.OPENAI_API_KEY);
    
    // Check Ollama endpoint
    let ollamaAvailable = false;
    try {
      const response = await fetch(env.OLLAMA_API_ENDPOINT);
      ollamaAvailable = response.ok;
    } catch (error) {
      console.error('Ollama check failed:', error);
    }

    return NextResponse.json({
      status: 'ok',
      config: {
        hasOpenAI,
        ollamaAvailable,
        ollamaEndpoint: env.OLLAMA_API_ENDPOINT,
        nodeEnv: env.NODE_ENV,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}