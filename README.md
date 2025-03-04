# Insight Canvas AI

A powerful platform for Conversational Analytics for Brand Intelligence, enabling detailed brand sentiment analysis through intuitive visualization and AI-guided insights.

## Disclaimer

This project is a playground for me. While in my job hunt a company that is in the market research space released
some new features which inspired me to think about extending what they have released. We then discussed broader
strategy and as part of my suggestions I proposed some of the features that now this project exposes.

But, it's not an actual project, it's more an experiment to test the limits of different AI models in two specific
tasks, first the exploration / discovery of a brand sentiment and audience demographics dataset, and second
the automatic creation of full dashboards out of an objective statement. Both features look to expand the user
base of the theoretical platform functionality like this would live on.

To run this project you will need an access key from an OpenAI account with credits, and a locally running Ollama with Llama 3.1 running.

*None of the data this application may show is usable, it is all fake. There is no dataset behind it.*


## Features

- AI-powered conversational interface for brand sentiment analysis
- Dynamic data visualizations with Chart.js
- Multiple AI model support (Llama 3.1, GPT 4o, etc.)
- Industry-specific brand sentiment analysis
- Full-stack application with Next.js API routes for backend functionality

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- NPM or Yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mc-interview-ai-demo
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Copy `.env.local.example` to `.env.local`
   - Add your API keys (OpenAI, etc.) to `.env.local`

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js App Router pages and layouts
  - `/api` - API routes (backend code)
  - `/components` - React components
  - `/config` - Configuration files
  - `/lib` - Utility files and services

## Development

### Adding New API Routes

To add a new API endpoint, create a new folder in `/app/api/` and add a `route.ts` file with the appropriate HTTP method handlers:

```typescript
// Example: /app/api/example/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Example API is working!',
    timestamp: new Date().toISOString(),
  });
}
```

## Deployment

This Next.js application can be deployed to various platforms like Vercel, Netlify, or any hosting service that supports Node.js applications.

### Deploying to Vercel

```bash
npm install -g vercel
vercel
```

## License

This project is licensed under the MIT License.