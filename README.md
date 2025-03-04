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

## Key Features

- **AI-powered Conversational Interface**: Interact with your brand data through natural language queries
- **Dynamic Data Visualizations**: Real-time chart generation using Chart.js
- **Multiple AI Model Support**: Includes support for Llama 3.1 and GPT-4o
- **Industry-specific Analysis**: Tailored insights for various market sectors
- **Automated Dashboard Creation**: Generate complete dashboards from simple objective statements
- **Full-stack Architecture**: Built on Next.js with robust API functionality

## Screenshots

### Conversational Analytics Interface

![Conversational Analytics Interface](./docs/images/conversation-interface.png)

*The AI-powered conversational interface allows users to get suggestions to further their exploration of the dataset.*

![Conversational Analytics Interface](./docs/images/suggestions-compare.png)

*The app also supports using multiple models to compare the suggestions.*

### Auto-generated Dashboard

![Auto-generated Dashboard](./docs/images/dashboard-example.png)

*Example of a dashboard automatically generated from a business objective statement.*

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- NPM
- OpenAI API key
- Ollama with Llama 3.1 model installed locally

### Installation

1. Clone the repository
```bash
git clone https://github.com/xbito/xbito-insight-canvas-ai.git
cd xbito-insight-canvas-ai
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Copy `.env.local.example` to `.env.local`
   - Add your API keys and configuration:
   ```
   OPENAI_API_KEY=your_openai_key_here
   OLLAMA_BASE_URL=http://localhost:11434
   ```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Supported AI Models

This application currently supports the following AI models:

- **GPT-4o** - OpenAI's latest multimodal model for advanced natural language processing and reasoning
- **Llama 3.1 (8B)** - Meta's open-source language model running locally through Ollama
- **Llama 3.1 (70B)** - The larger version of Meta's language model for more complex tasks


### Environment Variables

Make sure to configure the following environment variables in your production environment:

- `OPENAI_API_KEY`
- `OLLAMA_BASE_URL` (if using Ollama in production)
- `NODE_ENV=production`

## Troubleshooting

### Common Issues

- **API Connection Errors**: Ensure your API keys are correctly set in `.env.local`
- **Ollama Connection Issues**: Check that Ollama is running locally on port 11434
- **Model Loading Problems**: Verify that you've downloaded the required models in Ollama

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.