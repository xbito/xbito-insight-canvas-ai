import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string().min(1),
    OLLAMA_API_ENDPOINT: z.string().default('http://localhost:11434'),
    NODE_ENV: z.enum(['development', 'test', 'production']),
  },
  client: {},
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OLLAMA_API_ENDPOINT: process.env.OLLAMA_API_ENDPOINT,
    NODE_ENV: process.env.NODE_ENV,
  },
});