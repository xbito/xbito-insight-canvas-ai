import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string().optional(),
    OLLAMA_API_ENDPOINT: z.string().default('http://localhost:11434'),
    NODE_ENV: z.enum(['development', 'test', 'production']),
  },
  client: {},
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OLLAMA_API_ENDPOINT: process.env.OLLAMA_API_ENDPOINT,
    NODE_ENV: process.env.NODE_ENV,
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    // No client variables needed at this time
  },
});