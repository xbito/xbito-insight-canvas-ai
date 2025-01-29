import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { BarChart } from 'lucide-react';
import ollama from 'ollama';
import { getInitialSuggestions } from './initialSuggestions';
import { env } from './config/env';
import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const defaultSuggestions = [
  "Show me the top car brands by awareness.",
  "Which coffee shops are most popular with millennials?"
];

const main_system_prompt = `You are a helpful assistant in market research, an expert in brand sentiment analysis.
Your mission is to: Enable users to uncover non-obvious patterns in sentiment data through AI-guided exploration that adapts based on their context and previous discoveries.

Your Dataset is a collection of brand sentiment and audience data.
Your data ranges from 2010 to January 2025.

You have the following data about respondents:
age
gender
state_province
city
zip_postal_code
country
residence_type (urban/suburban/rural)
education_level
employment_status
occupation
marital_status
household_size
num_children
income_bracket
race_ethnicity
main_language
home_ownership (own/rent)
political_leaning
religion
social_media_use_freq
streaming_services_use_freq
purchase_behavior (online/in-store)
car_ownership
smoking_status
drinking_status
dietary_preference
fitness_activity
news_consumption_pref
tech_adoption_tendency (early/late)
credit_card_usage
payment_method_pref (cash/card/digital)
smartphone_usage_type (Android/iOS/etc.)
brand_preference_history (could store as text or JSON)
travel_frequency
banking_relationship
internet_speed_type
music_preference
pet_ownership
clothing_style_pref
grocery_spend (budget/premium)

You have the following data about brands:
brand_name
industry
country_of_origin

You have the following daily data about brand sentiment:
date (the day of data collection)
respondent_id (FK to Respondent)
brand_id (FK to Brand)
awareness_score (numeric) - have you ever heard of this brand?
buzz_score (numeric) - have you recently heard anything positive/negative about this brand?
current_customer (boolean) - are you currently a customer of this brand?
ever_customer (boolean) - have you ever been a customer of this brand?
consideration_score (numeric) - would you consider this brand for a future purchase?
intent_score (numeric) - do you intend to purchase from this brand in the near future?
word_of_mouth_score (numeric) - have you talked about this brand with friends/family?
advertising_score (numeric) - have you seen any advertising for this brand recently?
quality_score (good/bad/neutral) - how would you rate the quality of this brand's products/services?
value_score (good/bad/neutral) - how would you rate the value for money of this brand's products/services?
satisfaction_score (good/bad/neutral) - how satisfied are you with this brand overall?
recommendation_score (good/bad/neutral) - how likely are you to recommend this brand to others?
reputation_score (numeric) - would you be proud to work for this brand in the future?
impression (positive/negative/neutral) - what is your overall impression of this brand?
trust_score (numeric) - how much do you trust this brand?
loyalty_score (numeric) - how loyal are you to this brand?
engagement_score (numeric) - how engaged are you with this brand?
`

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const ContentSuggestions = z.object({
  content: z.string(),
  suggestions: z.array(z.string())
});

const ChatTopicSchema = z.object({
  topic: z.string()
});

const ChartTypeSchema = z.object({
  chartType: z.string()
});

const ChartDataSchema = z.object({
  labels: z.array(z.string()),
  title: z.string(),
  dateRange: z.string(),
  demographic: z.string(),
  datasets: z.array(z.object({
    label: z.string(),
    data: z.array(z.number()),
    backgroundColor: z.array(z.string()),
    borderColor: z.array(z.string()),
    borderWidth: z.number()
  }))
});

const TimeSeriesDataSchema = z.object({
  labels: z.array(z.string()),
  title: z.string(),
  dateRange: z.string(),
  demographic: z.string(),
  datasets: z.array(z.object({
    label: z.string(),
    data: z.array(z.number()),
    backgroundColor: z.string(),
    borderColor: z.string(),
    borderWidth: z.number()
  }))
});

// Simulated AI response generator
const generateAISuggestionsResponse = async (
  userQuery: string,
  useOpenAI: boolean,
  industry?: string,
  companyName?: string,
  useO1ForSuggestions?: boolean
) => {
  const example_suggestions = [
    "Show me the top car brands by awareness.",
    "Which coffee shops are most popular with millennials?",
    "What are the most trusted smartphone brands globally?",
    "Which fitness app is preferred by Gen Z users?",
  ]
  if (useO1ForSuggestions) {
    console.log("Using o1-mini-2024-09-12 for suggestions");
    const messages = [
      {
        role: 'user' as const,
        content: `Instructions:
        
        ${main_system_prompt}
        You are going to give suggestions for follow up prompts to the user based on the user query, industry, and company name.
        They must be possible to answer with either bar graphs or time series graphs.
        The suggestions you give should be single-sentence strings that generate more graphs to analyze brand sentiment and audience data. 
        Don't instruct the user on what to think, only suggest a short phrase they might say next.

        Examples: ${example_suggestions.join(', ')}.
        
        Industry: "${industry}"${
          companyName ? `, Company name: "${companyName}"` : ''
        }${userQuery ? `, User query: "${userQuery}"` : ''}.`
      }
    ];
    const response = await openai.beta.chat.completions.parse({
      model: "o1-mini-2024-09-12",
      messages,
      response_format: zodResponseFormat(ContentSuggestions, "suggestions"),
    });
    return response.choices[0].message.parsed;
  } else if (useOpenAI) {
    console.log('OpenAI for suggestions');
    const messages = [
      {
        role: 'system' as const,
        content: `${main_system_prompt}
        The suggestions you give should be single-sentence strings that generate more graphs to analyze brand sentiment and audience data. 
        They must be possible to answer with either bar graphs or time series graphs.
        Don't instruct the user on what to think, only suggest a short phrase they might say next.
        Here are some example suggestions: ${example_suggestions.join(', ')}.`
      },
      {
        role: 'user' as const,
        content: `Industry: "${industry}"${
          companyName ? `, company name: "${companyName}"` : ''
        }${userQuery ? `, user query: "${userQuery}"` : ''}.`
      }
    ];
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: messages,
      response_format: zodResponseFormat(ContentSuggestions, "suggestions"),
    });
    const { content, suggestions } = response.choices[0].message.parsed;
    console.log('OpenAI response:', content, suggestions);
    // return in json format
    return { content, suggestions };
  } else {
    console.log("Llama for suggestions");
    // Example call to local Llama API
    const response = await ollama.chat({
      model: 'llama3.1',
      format: 'json',
      messages :[
        {
          role: 'user',
          content: `Please return a JSON object with "content" introducing the chart and "suggestions" as an array of single-sentence suggestions as simple strings. 
          The suggestions should be phrased as if the user was the one that is going to send that message. 
          Don't instruct the user on what to think about next, rather exactly suggest what phrase he may use as a response/follow up. 
          The suggestions should aim to generate more graphs to analyze brand sentiment and audience data and create visualizations.
          They must be possible to answer with either bar graphs or time series graphs.
          Here general example suggestions: ${example_suggestions.join(', ')}. 
          
          Industry: "${industry}"${
            companyName ? `, company: "${companyName}"` : ''
          }${userQuery ? `, user query: "${userQuery}"` : ''}.`
        }
      ]
    });
    const data = await response;
    const json_data = JSON.parse(data.message.content);
    // If the response came with suggestions in an unexpected format, like a list of objects rather than a list of phrases, try to extract the phrases:
    if (json_data.suggestions && json_data.suggestions.length > 0 && typeof(json_data.suggestions[0]) === 'object') {
      json_data.suggestions = json_data.suggestions.map((suggestion: any) => suggestion.phrase);
    }
    return json_data;
  }
};

const generateBarChartData = async (
  userQuery: string,
  useOpenAI: boolean,
  industry?: string,
  companyName?: string
) => {
  if (useOpenAI) {
    console.log('OpenAI for bar chart data');
    const messages = [
      {
        role: 'system' as const,
        content: `${main_system_prompt}
        We have a TypeScript interface ChartData with strict shape requirements. 
        Return a plausible bar-chart dataset with up to 10 labels reflecting the user query. 
        Each label's data field is a percentage (0-100). 
        Strongly prefer real brand names to generic ones.`
      },
      {
        role: 'user' as const,
        content: `Industry: "${industry}"${
          companyName ? `, company name: "${companyName}"` : ''
        }${userQuery ? `, user query: "${userQuery}"` : ''}.`
      }
    ];
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages,
      response_format: zodResponseFormat(ChartDataSchema, "chartData"),
    });
    return response.choices[0].message.parsed;
  } else {
    console.log('Llama for chart data');
    const resp = await ollama.chat({
      model: 'llama3.1',
      format: 'json',
      messages: [
        {
          role: 'user',
          content: `We have a TypeScript interface ChartData with this shape:
{
  labels: string[];
  title: string;
  dateRange: string;
  demographic: string;
  datasets: [{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }]
}.
Please produce "chartData" strictly matching that shape for a bar chart with up to 10 labels each corresponding to a brand
Each label will have a matching record in the datasets data array with each being a percentage (0-100). 
Include title, dateRange, demographic. Generate fictional but believable data. 
Industry: "${industry}"${
  companyName ? `, company name: "${companyName}"` : ''
}${userQuery ? `, user query: "${userQuery}"` : ''}.`
        }
      ]
    });
    const parsed = JSON.parse(resp.message.content);
    return parsed;
  }
};

const generateTimeSeriesData = async (
  userQuery: string,
  useOpenAI: boolean,
  industry?: string,
  companyName?: string
) => {
  if (useOpenAI) {
    console.log('OpenAI for time series data');
    const messages = [
      {
        role: 'system' as const,
        content: `${main_system_prompt}
        We have a TypeScript interface TimeSeriesData with strict shape requirements. 
        Return a plausible time-series dataset. 
        Strongly prefer real brand names to generic ones.`
      },
      {
        role: 'user' as const,
        content: `Industry: "${industry}"${
          companyName ? `, company name: "${companyName}"` : ''
        }${userQuery ? `, user query: "${userQuery}"` : ''}.`
      }
    ];
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages,
      response_format: zodResponseFormat(TimeSeriesDataSchema, "chartData"),
    });
    return response.choices[0].message.parsed;
  } else {
    console.log('Llama for time series data');
    const resp = await ollama.chat({
      model: 'llama3.1',
      format: 'json',
      messages: [
        {
          role: 'user',
          content: `We have a TypeScript interface TimeSeriesData with this shape:
{
  labels: string[];
  title: string;
  dateRange: string;
  demographic: string;
  datasets: [{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }]
}.
Please produce "chartData" strictly matching that shape for a time series chart.
Include title, dateRange, demographic. Generate fictional but believable data.
Industry: "${industry}"${
  companyName ? `, company name: "${companyName}"` : ''
}${userQuery ? `, user query: "${userQuery}"` : ''}.`
        }
      ]
    });
    const parsed = JSON.parse(resp.message.content);
    return parsed;
  }
};

const determineChatTopic = async (
  userQuery: string,
  industry: string,
  companyName: string,
  useOpenAI: boolean
) => {
  if (useOpenAI) {
    console.log('OpenAI for topic');
    // Use OpenAI
    const messages = [
      {
        role: 'system' as const,
        content: `${main_system_prompt}
        You will suggest a short topic that summarizes the conversation based on the user query, industry, and company name.`
      },
      {
        role: 'user' as const,
        content: `Industry: "${industry}", company name: "${companyName}", user query: "${userQuery}".`
      }
    ];
    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: messages,
      response_format: zodResponseFormat(ChatTopicSchema, 'topic'),
    });
    return response.choices[0].message.parsed.topic;
  } else {
    console.log('Llama for topic');
    const response = await ollama.chat({
      model: 'llama3.1',
      format: 'json',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant in market research, an expert in brand sentiment analysis. 
          You are asked to return a JSON object with a single property "topic".`
        },
        {
          role: 'user',
          content: `Please determine the topic of the conversation based on the user query: "${userQuery}", 
          industry: "${industry}", and company name: "${companyName}". 
          Return JSON with the single property "topic".`
        }
      ]
    });
    const data = await response;
    const json_data = JSON.parse(data.message.content);
    return json_data.topic;
  }
};

const determineChartType = async (
  userQuery: string,
  industry: string,
  companyName: string,
  useOpenAI: boolean
) => {
  if (useOpenAI) {
    console.log('OpenAI for chart type');
    // Use OpenAI
    const messages = [
      {
        role: 'system' as const,
        content: `${main_system_prompt}
        You will suggest a chart type based on the user query, industry, and company name.
        The only options you have are "Bar chart" or "Time series chart".`
      },
      {
        role: 'user' as const,
        content: `Industry: "${industry}", company name: "${companyName}", user query: "${userQuery}".`
      }
    ];
    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: messages,
      response_format: zodResponseFormat(ChartTypeSchema, 'chartType'),
    });
    return response.choices[0].message.parsed.chartType;
  } else {
    console.log('Llama for chart type');
    const response = await ollama.chat({
      model: 'llama3.1',
      format: 'json',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant in market research, an expert in brand sentiment analysis. 
          You are asked to return a JSON object with a single property "chartType".
          The only options you have are "Bar chart" or "Time series chart".`
        },
        {
          role: 'user',
          content: `Industry: "${industry}", company name: "${companyName}", user query: "${userQuery}".`
        }
      ]
    });
    const data = await response;
    const json_data = JSON.parse(data.message.content);
    return json_data.chartType;
  }
};


export default function App() {
  const [industry, setIndustry] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [useO1ForSuggestions, setUseO1ForSuggestions] = useState(false); 

  const createInitialMessage = (ind?: string, comp?: string): Message => ({
    id: '1',
    content: 'Hello! I can help you analyze brand sentiment and audience data and create visualizations. What would you like to know?',
    sender: 'ai',
    timestamp: new Date(),
    suggestions: (ind || comp)
      ? getInitialSuggestions(ind || '', comp || '')
      : defaultSuggestions,
  });

  const [messages, setMessages] = useState<Message[]>([createInitialMessage()]);

  const [chatTitle, setChatTitle] = useState<string>('New Chat');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    setLoading(true);
    const data = await generateAISuggestionsResponse(content, useOpenAI, industry, companyName);
    const chartType = await determineChartType(content, industry, companyName, useOpenAI);
    console.log('Chart type:', chartType);

    let chartResult;
    if (chartType === "Time series chart") {
      chartResult = await generateTimeSeriesData(content, useOpenAI, industry, companyName);
    } else {
      chartResult = await generateBarChartData(content, useOpenAI, industry, companyName);
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: data.content,
      sender: 'ai',
      timestamp: new Date(),
      suggestions: data.suggestions,
      chartData: chartResult
    };
    setMessages(prev => [...prev, aiMessage]);

    const topic = await determineChatTopic(content, industry, companyName, useOpenAI);
    setChatTitle(topic);
    setLoading(false);
  };

  useEffect(() => {
    // Update only the first AI message suggestions if industry or company name changed
    setMessages((prev) => {
      const updatedAIMessage = createInitialMessage(industry, companyName);
      return [updatedAIMessage, ...prev.slice(1)];
    });
  }, [industry, companyName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BarChart className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Data Chat AI</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100">
            {chatTitle}
          </button>
        </div>
        <div className="mt-auto p-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700" htmlFor="industrySelect">Industry</label>
          <select
            id="industrySelect"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
          >
            <option value="">Select Industry</option>
            <option value="automobiles">Automobiles</option>
            <option value="airlines">Airlines</option>
            <option value="beverage">Beverage</option>
            <option value="retail">Retail</option>
            <option value="banks">Banks</option>
            <option value="phones">Phones</option>
            <option value="food">Food</option>
            <option value="cosmetics">Cosmetics</option>
            <option value="apparel">Apparel</option>
            <option value="electronics">Electronics</option>
            <option value="media">Media</option>
            <option value="social-media-apps">Social Media apps</option>
            <option value="health-pharma">Health/Pharma</option>
            <option value="sports">Sports</option>
            <option value="appliances">Appliances</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 mt-4" htmlFor="companyName">Company Name</label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
          />

          <div className="mt-4 flex items-center">
            <label className="block text-sm font-medium text-gray-700 mr-2">Use OpenAI</label>
            <input
              type="checkbox"
              checked={useOpenAI}
              onChange={(e) => setUseOpenAI(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="mt-4 flex items-center">
            <label className="block text-sm font-medium text-gray-700 mr-2">Use o1 for suggestions</label>
            <input
              type="checkbox"
              checked={useO1ForSuggestions}
              onChange={(e) => setUseO1ForSuggestions(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />  
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSuggestionClick={handleSendMessage}
                chartData={message.chartData} // pass chart data
              />
            ))}
            {loading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-400"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}
