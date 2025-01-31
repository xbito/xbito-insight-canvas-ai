import { Industry } from "./types";

export const getInitialSuggestions = (industry: Industry, companyName: string) => {
  const suggestions: Record<Industry, string[]> = {
    automobiles: [
      `What are the top car brands by awareness in the ${industry} industry?`,
      `How does ${companyName} compare to other car brands?`,
    ],
    airlines: [
      `Which airlines are most popular with frequent flyers?`,
      `How does ${companyName} rank in customer satisfaction?`,
    ],
    beverage: [
      `What are the most popular beverage brands?`,
      `How does ${companyName} perform in the ${industry} market?`,
    ],
    retail: [
      `Which retail brands are most recognized?`,
      `How does ${companyName} compare to other retail brands?`,
    ],
    banks: [
      `What are the most trusted banks?`,
      `How does ${companyName} rank in customer satisfaction?`,
    ],
    phones: [
      `Which phone brands are most popular?`,
      `How does ${companyName} compare to other phone brands?`,
    ],
    food: [
      `What are the most popular food brands?`,
      `How does ${companyName} perform in the ${industry} market?`,
    ],
    cosmetics: [
      `Which cosmetics brands are most recognized?`,
      `How does ${companyName} compare to other cosmetics brands?`,
    ],
    apparel: [
      `What are the top apparel brands?`,
      `How does ${companyName} rank in customer satisfaction?`,
    ],
    electronics: [
      `Which electronics brands are most popular?`,
      `How does ${companyName} compare to other electronics brands?`,
    ],
    media: [
      `What are the most recognized media brands?`,
      `How does ${companyName} perform in the ${industry} market?`,
    ],
    'social-media-apps': [
      `Which social media apps are most popular?`,
      `How does ${companyName} compare to other social media apps?`,
    ],
    'health-pharma': [
      `What are the most trusted health/pharma brands?`,
      `How does ${companyName} rank in customer satisfaction?`,
    ],
    sports: [
      `Which sports brands are most recognized?`,
      `How does ${companyName} compare to other sports brands?`,
    ],
    appliances: [
      `What are the most popular appliance brands?`,
      `How does ${companyName} perform in the ${industry} market?`,
    ],
  };

  return suggestions[industry] || [
    `Show me the top brands by awareness in the ${industry} industry.`,
    `How does ${companyName} compare to other brands?`,
  ];
};
