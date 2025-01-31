import OpenAI from 'openai';
import ollama from 'ollama';
import { zodResponseFormat } from "openai/helpers/zod";
import { env } from './config/env';
import {
  ChatTopicSchema,
  ChartTypeSchema,
  SuggestionsSchema,
  BarChartResponseSchema,
  TimeSeriesResponseSchema
} from './types';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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

function buildIndustryCompanyText(industry: string, companyName: string) {
  let text = '';
  if (industry) {
    text += `Industry: "${industry}". `;
  }
  if (companyName) {
    text += `Company name: "${companyName}". `;
  }
  return text.trim();
}

// Simulated AI response generator
export const generateAISuggestionsResponse = async (
  latestUserQuery: string,
  modelName: string,
  industry?: string,
  companyName?: string,
  allUserQueries?: string
) => {
  const example_suggestions = [
    "Show me the top car brands by awareness.",
    "Which coffee shops are most popular with millennials?",
    "What are the most trusted smartphone brands globally?",
    "Which fitness app is preferred by Gen Z users?",
  ]
  const formattedInfo = buildIndustryCompanyText(industry || '', companyName || '');

  if (modelName === "o1-mini") {
    console.log("Using o1-mini for suggestions, GPT 4o for other calls");
    const messages = [
      {
        role: 'user' as const,
        content: `Instructions:
        ${main_system_prompt}
        You are going to give suggestions for follow up prompts to the user based on the user query, industry, and company name.
        They must be possible to answer with either bar graphs or time series graphs.
        The suggestions you give should be single-sentence strings that generate more graphs to analyze brand sentiment and audience data. 
        Don't instruct the user on what to think, only suggest a short phrase they might say next.
        In the suggestions never make a reference to "these brands", the follow up prompts do not have the necessary context to make that reference.
        Return a JSON object with "suggestions" as an array of single-sentence follow-ups.
        Example suggestions: ${example_suggestions.join(', ')}.
          
        ${formattedInfo}
        The entire user conversation (for context):
        ${allUserQueries}

        The last user query is: "${latestUserQuery}".`
      }
    ];
    const firstResponse = await openai.chat.completions.create({
      model: "o1-mini-2024-09-12",
      messages
    });
    const rawContent = firstResponse.choices[0].message.content;
    const parseMessages = [
      {
        role: 'system' as const,
        content: `You are a helpful assistant. Convert the user message into valid JSON matching:
        { suggestions: string[] }`
      },
      {
        role: 'user' as const,
        content: rawContent || ''
      }
    ];
    const secondResponse = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: parseMessages,
      response_format: zodResponseFormat(SuggestionsSchema, "suggestions"),
    }) as { choices: { message: { parsed: { suggestions: string[] } } }[] };
    return secondResponse.choices[0]?.message?.parsed.suggestions || [];
  } else if (modelName === "GPT 4o") {
    console.log('OpenAI for suggestions - GPT 4o');
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
        content: `${formattedInfo}
        Here is the entire user conversation (for context):
        ${allUserQueries}
       
        The last user query is: "${latestUserQuery}".`
      }
    ];
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: messages,
      response_format: zodResponseFormat(SuggestionsSchema, "suggestions"),
    });
    return response.choices[0]?.message?.parsed?.suggestions || [];
  } else if (modelName === "o3-mini") {
    console.log("o3-mini not implemented yet");
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
          content: `${formattedInfo}
          Here is the entire user conversation (for context):
          ${allUserQueries}
         
          The last user query is: "${latestUserQuery}".`
        }
      ];
      const response = await openai.beta.chat.completions.parse({
        model: "o3-mini-2025-1-31",
        messages: messages,
        response_format: zodResponseFormat(SuggestionsSchema, "suggestions"),
      });
      return response.choices[0]?.message?.parsed?.suggestions || [];
  } else {
    console.log("Llama for suggestions");
    const response = await ollama.chat({
      model: 'llama3.1',
      format: 'json',
      messages :[
        {
          role: 'user',
          content: `Please return a JSON object with "suggestions" as an array of single-sentence suggestions as simple strings. 
          The suggestions should be phrased as if the user was the one that is going to send that message. 
          Don't instruct the user on what to think about next, rather exactly suggest what phrase he may use as a response/follow up. 
          The suggestions should aim to generate more graphs to analyze brand sentiment and audience data and create visualizations.
          They must be possible to answer with either bar graphs or time series graphs.
          Here general example suggestions: ${example_suggestions.join(', ')}. 
          
          ${formattedInfo}
          Full conversation (for context):
          ${allUserQueries}
          
          The last user query is: "${latestUserQuery}".`
        }
      ]
    });
    const data = await response;
    const json_data = JSON.parse(data.message.content);
    // If the response came with suggestions in an unexpected format, like a list of objects rather than a list of phrases, try to extract the phrases:
    if (json_data.suggestions && json_data.suggestions.length > 0 && typeof(json_data.suggestions[0]) === 'object') {
      json_data.suggestions = json_data.suggestions.map((suggestion: { phrase: string }) => suggestion.phrase);
    }
    return json_data.suggestions;
  }
};

export const generateBarChartData = async (
  userQuery: string,
  modelName: string,
  industry?: string,
  companyName?: string
) => {
  const formattedInfo = buildIndustryCompanyText(industry || '', companyName || '');
  if (modelName === "GPT 4o" || modelName === "o1-mini" || modelName === "o3-mini") {
    console.log('Using GPT 4o for bar chart data');
    const messages = [
      {
        role: 'system' as const,
        content: `${main_system_prompt}
        We have a TypeScript interface ChartData with strict shape requirements. 
        In the structure you return you must provide a "content" member introducing the chart.
        Return a plausible bar-chart dataset with up to 10 labels reflecting the user query. 
        Each label's data field is a percentage (0-100). 
        Strongly prefer real brand names to generic ones.
        Never make up brand names.
        Never return "Brand A", "Brand B", etc.`
      },
      {
        role: 'user' as const,
        content: `${formattedInfo}
        The last user query is: "${userQuery}".`
      }
    ];
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages,
      response_format: zodResponseFormat(BarChartResponseSchema, "chartData"),
    });
    return response.choices[0].message.parsed;
  } else {
    console.log('Llama for bar chart data');
    const resp = await ollama.chat({
      model: 'llama3.1',
      format: 'json',
      messages: [
        {
          role: 'user',
          content: `Please return a JSON object with two top-level fields:
{
  "content": string,
  "chartData": {
    "labels": string[],
    "title": string,
    "dateRange": string,
    "demographic": string,
    "datasets": [{
      "label": string,
      "data": number[],
      "backgroundColor": string[],
      "borderColor": string[],
      "borderWidth": number
    }]
  }
}.
"description": Short introduction of the bar chart.
"chartData": Bar chart data shaped exactly like the ChartData interface.
Please produce "chartData" strictly matching that shape for a bar chart with up to 10 labels each corresponding to a brand
Each label will have a matching record in the datasets data array with each being a percentage (0-100). 
Include title, dateRange, demographic. Generate fictional but believable data. 

${formattedInfo}
The last user query is: "${userQuery}".`
        }
      ]
    });
    const parsed = JSON.parse(resp.message.content);
    return parsed; // this now has { content, chartData }
  }
};

export const generateTimeSeriesData = async (
  userQuery: string,
  modelName: string,
  industry?: string,
  companyName?: string
) => {
  const formattedInfo = buildIndustryCompanyText(industry || '', companyName || '');
  if (modelName === "GPT 4o" || modelName === "o1-mini" || modelName === "o3-mini") {
    console.log('Using GPT 4o for time series data');
    const messages = [
      {
        role: 'system' as const,
        content: `${main_system_prompt}
        In the structure you return you must provide a "content" member introducing the chart
        We have a TypeScript interface TimeSeriesData with strict shape requirements. 
        Return a plausible time-series dataset. 
        Strongly prefer real brand names to generic ones.`
      },
      {
        role: 'user' as const,
        content: `${formattedInfo}
        The last user query is: "${userQuery}".`
      }
    ];
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages,
      response_format: zodResponseFormat(TimeSeriesResponseSchema, "chartData"),
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
          content: `Please return a JSON object with two top-level fields:
{
  "content": string,
  "chartData": {
    "labels": string[],
    "title": string,
    "dateRange": string,
    "demographic": string,
    "datasets": [{
      "label": string,
      "data": number[],
      "backgroundColor": string,
      "borderColor": string,
      "borderWidth": number
    }]
  }
}.
"description": Short introduction of the time series chart.
"chartData": Time series data shaped exactly like the TimeSeriesData interface.
Please produce "chartData" strictly matching that shape for a time series chart.
Include title, dateRange, demographic. Generate fictional but believable data.
${formattedInfo}
The last user query is: "${userQuery}".`
        }
      ]
    });
    const parsed = JSON.parse(resp.message.content);
    return parsed; // this now has { content, chartData }
  }
};

export const determineChatTopic = async (
  allUserMessages: string,
  industry: string,
  companyName: string,
  modelName: string
) => {
  const formattedInfo = buildIndustryCompanyText(industry, companyName);
  if (modelName === "GPT 4o" || modelName === "o1-mini" || modelName === "o3-mini") {
    console.log('Using GPT 4o for topic');
    // Use OpenAI
    const messages = [
      {
        role: 'system' as const,
        content: `${main_system_prompt}
        You will suggest a short topic of 5 words summarizing the entire user conversation so it can be displayed in the chat tab.`
      },
      {
        role: 'user' as const,
        content: `${formattedInfo}User conversation: "${allUserMessages}".`
      }
    ];
    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: messages,
      response_format: zodResponseFormat(ChatTopicSchema, 'topic'),
    });
    return response.choices[0]?.message?.parsed?.topic || '';
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
          content: `${formattedInfo}
          Please determine the topic of the conversation based on the user query: "${allUserMessages}", and return it in JSON format.`
        }
      ]
    });
    const data = await response;
    const json_data = JSON.parse(data.message.content);
    return json_data.topic;
  }
};

export const determineChartType = async (
  userQuery: string,
  industry: string,
  companyName: string,
  modelName: string
) => {
  const formattedInfo = buildIndustryCompanyText(industry, companyName);
  if (modelName === "GPT 4o" || modelName === "o1-mini" || modelName === "o3-mini") {
    console.log('Using GPT 4o for chart type');
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
        content: `${formattedInfo}
        The last user query is: "${userQuery}".`
      }
    ];
    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: messages,
      response_format: zodResponseFormat(ChartTypeSchema, 'chartType'),
    });
    return response.choices[0]?.message?.parsed?.chartType || '';
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
          content: `${formattedInfo}
          The last user query is: "${userQuery}".`
        }
      ]
    });
    const data = await response;
    const json_data = JSON.parse(data.message.content);
    return json_data.chartType;
  }
};