import { Industry } from './types';

export function getInitialSuggestions(industry: Industry, companyName: string): string[] {
  const suggestions: { [key in Industry]: string[] } = {
    automobiles: [
      "Show me the top car brands by awareness in the last year.",
      "Compare customer satisfaction scores for luxury car brands.",
      "Which car brands have the highest loyalty scores?",
      "How has brand trust changed for electric vehicle manufacturers?"
    ],
    airlines: [
      "Which airlines have the highest customer satisfaction?",
      "Compare safety perception scores across major airlines.",
      "Show me airline preference trends among business travelers.",
      "Which airlines have improved their reputation the most?"
    ],
    beverage: [
      "What are the most popular soft drink brands?",
      "Show me coffee brand preferences by age group.",
      "Compare brand loyalty for energy drink companies.",
      "Which beverage brands are trending with Gen Z?"
    ],
    retail: [
      "Which retail chains have the highest customer loyalty?",
      "Compare online vs in-store satisfaction scores.",
      "Show me which retailers are preferred by millennials.",
      "How has brand trust changed for e-commerce companies?"
    ],
    banks: [
      "Which banks have the highest trust scores?",
      "Compare mobile banking satisfaction across banks.",
      "Show me which banks are preferred by young professionals.",
      "How has digital banking adoption changed?"
    ],
    phones: [
      "What are the most trusted smartphone brands?",
      "Compare brand loyalty between iPhone and Android users.",
      "Show me phone brand preferences by age group.",
      "Which phone brands are gaining market share?"
    ],
    food: [
      "Which fast food chains have the highest satisfaction?",
      "Compare healthy food brand awareness trends.",
      "Show me which food brands are popular with families.",
      "How has organic food brand perception changed?"
    ],
    cosmetics: [
      "What are the top beauty brands by awareness?",
      "Compare eco-friendly cosmetics brand perception.",
      "Show me makeup brand preferences by age group.",
      "Which beauty brands are trending on social media?"
    ],
    apparel: [
      "Which clothing brands are most popular with teens?",
      "Compare luxury fashion brand perception trends.",
      "Show me athletic wear brand preferences.",
      "How has sustainable fashion awareness changed?"
    ],
    electronics: [
      "What are the most trusted electronics brands?",
      "Compare gaming console brand preferences.",
      "Show me smart home device adoption trends.",
      "Which tech brands have the highest innovation scores?"
    ],
    media: [
      "Which streaming services have the highest satisfaction?",
      "Compare news channel trust scores.",
      "Show me entertainment platform preferences by age.",
      "How has traditional media trust changed?"
    ],
    "social-media-apps": [
      "Which social media apps are most popular with teens?",
      "Compare platform engagement metrics.",
      "Show me social media usage trends by demographics.",
      "Which platforms have the highest user satisfaction?"
    ],
    "health-pharma": [
      "What are the most trusted healthcare brands?",
      "Compare pharmacy chain satisfaction scores.",
      "Show me telehealth platform adoption trends.",
      "Which health brands have highest credibility?"
    ],
    sports: [
      "Which sports brands have highest brand loyalty?",
      "Compare athletic wear brand preferences.",
      "Show me fitness app engagement trends.",
      "How has sports equipment brand perception changed?"
    ],
    appliances: [
      "What are the most reliable appliance brands?",
      "Compare smart appliance adoption trends.",
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

  if (companyName) {
    return industrySuggestions.map(s => s.replace(/brands?|companies/, companyName));
  }

  return industrySuggestions;
}