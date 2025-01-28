# Brand Sentiment Chat AI Demo

## Overview
This project provides a React-based chat interface that leverages AI to analyze brand sentiment and generate interactive charts. It includes:
• AI-driven brand sentiment analysis  
• Dynamic bar and time series visualizations using Chart.js  
• Flexible integration with OpenAI or local Llama-based APIs

## Requirements
• Node.js 16+  
• Yarn or npm

## Installation
1. Clone this repository.  
2. Run npm install or yarn install to install dependencies.

## Configuration
• Copy your OpenAI or local Llama API credentials into the appropriate .env or config files.  
• Toggle "Use OpenAI" or "Use o1 for suggestions" within the app’s UI.

## Usage
1. Start the development server with npm start or yarn start.  
2. Navigate to http://localhost:3000 in your browser.  
3. Ask questions about brand sentiment, and view the generated charts.

## Architecture
• Frontend: TypeScript + React, with a chat interface.  
• Charting: Bar and Line charts via Chart.js.  
• API Interaction: Switchable between OpenAI or local Llama-based endpoints.

## Troubleshooting
• Check Node.js version (16+).  
• Verify that all dependencies (React, Chart.js, etc.) are installed properly.  
• Ensure valid API credentials for OpenAI or Llama.  

## Future Plans
• Further customization of prompts.  
• Expanded data modeling and visualizations.

## Contributing
1. Fork the repository.  
2. Create a feature branch.  
3. Submit a pull request for review.

## License
MIT