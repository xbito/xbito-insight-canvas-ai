import { Industry } from './types';

export function getInitialSuggestions(industry: Industry, companyName: string): string[] {
  const suggestions: { [key in Industry]: string[] } = {
    automobiles: [
      `Show me the top car brands by awareness in the ${industry} industry.`,
      `How does ${companyName} compare to other car manufacturers?`,
      "Which car brands have the highest loyalty scores?",
      "How has brand trust changed for electric vehicle manufacturers?"
    ],
    airlines: [
      `Which airlines have the highest customer satisfaction compared to ${companyName}?`,
      `How has ${companyName}'s reputation changed over time in the ${industry} industry?`,
      "Show me airline preference trends among business travelers.",
      "Which airlines have improved their reputation the most?"
    ],
    beverage: [
      `What are the most popular brands in the ${industry} category?`,
      `How does ${companyName} perform compared to other beverage companies?`,
      "Compare brand loyalty for energy drink companies.",
      "Which beverage brands are trending with Gen Z?"
    ],
    retail: [
      `Which retail chains have the highest customer loyalty compared to ${companyName}?`,
      "Compare online vs in-store satisfaction scores.",
      `Show me how ${companyName} is positioned in the ${industry} market.`,
      "How has brand trust changed for e-commerce companies?"
    ],
    banks: [
      `Which banks have the highest trust scores compared to ${companyName}?`,
      "Compare mobile banking satisfaction across banks.",
      "Show me which banks are preferred by young professionals.",
      `How has ${companyName}'s customer satisfaction changed in the ${industry} sector?`
    ],
    phones: [
      `What are the most trusted smartphone brands in the same category as ${companyName}?`,
      "Compare brand loyalty between iPhone and Android users.",
      "Show me phone brand preferences by age group.",
      `How is ${companyName} performing in the ${industry} market?`
    ],
    food: [
      `Which food brands have the highest satisfaction ratings compared to ${companyName}?`,
      `How does ${companyName} rank among other companies in the ${industry} industry?`,
      "Show me which food brands are popular with families.",
      "How has organic food brand perception changed?"
    ],
    cosmetics: [
      `What are the top beauty brands competing with ${companyName}?`,
      `Compare ${companyName}'s perception with other brands in the ${industry} sector.`,
      "Show me makeup brand preferences by age group.",
      "Which beauty brands are trending on social media?"
    ],
    apparel: [
      `Which clothing brands are most popular in the same market as ${companyName}?`,
      "Compare luxury fashion brand perception trends.",
      `How does ${companyName} measure up against competitors in the ${industry} industry?`,
      "How has sustainable fashion awareness changed?"
    ],
    electronics: [
      `What are the most trusted electronics brands compared to ${companyName}?`,
      `How is ${companyName} performing relative to competitors in the ${industry} market?`,
      "Show me smart home device adoption trends.",
      "Which tech brands have the highest innovation scores?"
    ],
    media: [
      `How does ${companyName} compare to other companies in the ${industry} landscape?`,
      "Compare news channel trust scores.",
      `Show me ${companyName}'s performance trends over the last five years.`,
      "How has traditional media trust changed?"
    ],
    "social-media-apps": [
      `How does ${companyName} rank among other platforms in the ${industry} space?`,
      "Compare platform engagement metrics.",
      `Show me ${companyName}'s user growth compared to competitors.`,
      "Which platforms have the highest user satisfaction?"
    ],
    "health-pharma": [
      `What are the most trusted healthcare brands compared to ${companyName}?`,
      `How does ${companyName} perform in the ${industry} market?`,
      "Show me telehealth platform adoption trends.",
      "Which health brands have highest credibility?"
    ],
    sports: [
      `Which sports brands have highest brand loyalty compared to ${companyName}?`,
      `How does ${companyName} rank in the ${industry} industry?`,
      "Show me fitness app engagement trends.",
      "How has sports equipment brand perception changed?"
    ],
    appliances: [
      `What are the most reliable appliance brands compared to ${companyName}?`,
      `Show me how ${companyName}'s reputation has evolved in the ${industry} market.`,
      "Show me kitchen brand preferences.",
      "Which appliance brands have best warranties?"
    ]
  };

  if (!industry) {
    return [
      "Show me the top car brands by awareness.",
      "Which coffee shops are most popular with millennials?",
      "What are the most trusted smartphone brands?",
      "Which retailers have the highest customer satisfaction?"
    ];
  }

  const industrySuggestions = suggestions[industry];

  // If no company name is provided, use generic suggestions
  if (!companyName) {
    return industrySuggestions.map(s => s.replace(/\$\{companyName\}/g, 'brands').replace(/\$\{industry\}/g, industry));
  }

  return industrySuggestions;
}