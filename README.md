# Insight Canvas AI

A powerful platform for Conversational Analytics for Brand Intelligence, enabling detailed brand sentiment analysis through intuitive visualization and AI-guided insights.

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