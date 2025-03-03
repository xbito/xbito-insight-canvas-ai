// This file contains structured definitions of user personas
// Extracted from personas.md and transformed into a usable format

interface PersonaDefinition {
  id: string;
  displayName: string;
  description: {
    roleGoals: string[];
    motivation: string[];
    challenges: string[];
    keyNeeds: string[];
  }
}

export const personaDefinitions: Record<string, PersonaDefinition> = {
  'research-analyst': {
    id: 'research-analyst',
    displayName: 'Research Analyst',
    description: {
      roleGoals: [
        "Comb through daily changes in brand metrics (e.g., awareness_score, buzz_score) to spot shifts or early signals.",
        "Provide in-depth reports on how these scores evolve over time."
      ],
      motivation: [
        "Show clear cause-and-effect connections between brand sentiment changes and larger market events.",
        "Uncover hidden trends in data that might impact brand health or product feedback."
      ],
      challenges: [
        "Large amounts of data can be tough to manage; AI guidance helps them find meaningful insights faster.",
        "Must ensure data accuracy and validity when presenting findings to other teams."
      ],
      keyNeeds: [
        "A flexible interface that offers advanced filtering of scores (trust_score, loyalty_score, etc.).",
        "Automatic alerts or guided exploration when a pattern appears (e.g., a drop in quality_score across a region).",
        "Clear ways to export or share multi-step analyses with peers or supervisors."
      ]
    }
  },
  'marketing-brand-manager': {
    id: 'marketing-brand-manager',
    displayName: 'Marketing & Brand Manager',
    description: {
      roleGoals: [
        "Track brand health metrics daily (awareness_score, intent_score, word_of_mouth_score).",
        "Adjust campaigns if negative buzz_score spikes or if consideration_score dips."
      ],
      motivation: [
        "Find quick ways to see if brand messaging is resonating.",
        "Prove that marketing efforts lift trust_score and engagement_score over time."
      ],
      challenges: [
        "Limited time to dig into raw data, so an AI-driven chat or guided dashboard helps them keep up.",
        "Need clear visuals that show shifts since they present findings to executives and clients."
      ],
      keyNeeds: [
        "Automated insights on how scores move after a new ad or social media push.",
        "Ability to set up watchlists for important scores (e.g., brand reputation_score before and after a campaign).",
        "A user-friendly way to share quick snapshots with other departments."
      ]
    }
  },
  'senior-executive': {
    id: 'senior-executive',
    displayName: 'Senior Executive',
    description: {
      roleGoals: [
        "Oversee overall brand performance, including trust_score, loyalty_score, and impression.",
        "Decide on budget allocations and strategy based on high-level sentiment trends."
      ],
      motivation: [
        "Get a simple, accurate picture of which brands or products are gaining or losing favor in the market.",
        "Make sure the company isn't caught off guard by a sudden dip in reputation_score."
      ],
      challenges: [
        "Often have limited time or technical skill to dive deep themselves.",
        "Rely on others for day-to-day data checks, which can lead to delays."
      ],
      keyNeeds: [
        "Quick, high-level dashboards with daily or weekly alerts (e.g., a big drop in loyalty_score).",
        "A plain-language summary from the AI suggesting possible reasons for sentiment changes.",
        "Confidence in the data and methods used to create executive summaries."
      ]
    }
  },
  'communications-pr': {
    id: 'communications-pr',
    displayName: 'Communications & PR',
    description: {
      roleGoals: [
        "Monitor daily buzz_score, impression, and word_of_mouth_score to catch any negative turn.",
        "React quickly to protect brand image if sentiment goes south."
      ],
      motivation: [
        "Stay ahead of any PR crisis that might show up as a spike in negative impression or drop in quality_score.",
        "Gather proof of improved sentiment when responding to media inquiries or stakeholder concerns."
      ],
      challenges: [
        "Must respond fast to changing sentiment, so they need real-time or near real-time data.",
        "May not be experts in data exploration, so they value AI-driven suggestions on next steps."
      ],
      keyNeeds: [
        "Alerts when a potential crisis emerges (e.g., sudden decline in trust_score).",
        "Simple visuals and bullet points that can be shared with news outlets or posted on social media.",
        "Rapid sentiment comparisons (before/after events) to evaluate the success of PR responses."
      ]
    }
  },
  'product-manager': {
    id: 'product-manager',
    displayName: 'Product Manager',
    description: {
      roleGoals: [
        "Use satisfaction_score, quality_score, and value_score data to shape product development.",
        "Validate if new features or launches impact engagement_score and loyalty_score."
      ],
      motivation: [
        "Spot potential product issues early (e.g., dip in satisfaction_score) before they escalate.",
        "Show data-driven proof that product changes raise overall brand scores."
      ],
      challenges: [
        "Balancing user experience needs with business goals (time and money constraints).",
        "Sifting through sentiment data that covers many brands or products."
      ],
      keyNeeds: [
        "Ability to segment by audience traits (e.g., \"customers who left a negative quality_score in the past month\").",
        "Tools for \"what-if\" scenarios (e.g., forecasting the effect on loyalty_score if a certain product fix is done).",
        "Easy sharing of findings with design, engineering, and leadership."
      ]
    }
  },
  'market-intelligence': {
    id: 'market-intelligence',
    displayName: 'Market Intelligence Team Member',
    description: {
      roleGoals: [
        "Collect broad insights on multiple brands, not just one, to compare reputations and consumer loyalty.",
        "Package this data into regular deliverables that guide company direction."
      ],
      motivation: [
        "Build a solid competitive view by comparing brand sentiment metrics side by side (awareness_score, buzz_score, trust_score, etc.).",
        "Spot trends at the industry or category level to advise on where the market is heading."
      ],
      challenges: [
        "Dealing with overlapping data sets from different sources.",
        "Must produce clear insights for many teams (product, marketing, C-suite)."
      ],
      keyNeeds: [
        "Cross-brand comparisons that highlight big differences in daily brand metrics.",
        "Advanced filtering to focus on specific regions, demographics, or loyalty segments.",
        "Automatic charting and summary generation to keep their reports timely."
      ]
    }
  },
  'customer-insights': {
    id: 'customer-insights',
    displayName: 'Customer Insights Team Member',
    description: {
      roleGoals: [
        "Understand how customer satisfaction_score, recommendation_score, and trust_score shift over time.",
        "Communicate feedback to product, marketing, and support teams."
      ],
      motivation: [
        "Improve the customer journey by spotting what drives higher engagement_score or loyalty_score.",
        "Keep track of the brand's word_of_mouth_score, since peer recommendations matter."
      ],
      challenges: [
        "Might have to merge various internal data (support tickets, usage data) with external brand sentiment metrics.",
        "Translating raw numbers into user-friendly action steps for each department."
      ],
      keyNeeds: [
        "A single place to track changes in brand sentiment tied to actual customer feedback.",
        "Quick methods to share data highlights, like \"Customers who are unhappy with value_score are also less likely to recommend the brand.\"",
        "AI-generated suggestions on which metrics to investigate further."
      ]
    }
  },
  'sales-representative': {
    id: 'sales-representative',
    displayName: 'Sales Representative',
    description: {
      roleGoals: [
        "Use up-to-date brand sentiment (impression, consideration_score, etc.) in pitches and proposals.",
        "Show potential clients how the brand is perceived, especially in comparison to competitors."
      ],
      motivation: [
        "Strengthen the argument for the brand's quality and reputation in sales meetings.",
        "Quickly pull relevant stats (e.g., daily advertising_score) to highlight marketing reach."
      ],
      challenges: [
        "Sales folks may not have deep analytics backgrounds or the time to explore complex data.",
        "Need quick summaries they can show on the spot to a prospect."
      ],
      keyNeeds: [
        "Easy-to-create visual snippets or slides showing key positive metrics (trust_score, loyalty_score).",
        "Ready-to-go \"brand profile\" for a quick overview.",
        "Fast AI chat queries, like \"What's the brand's average satisfaction_score over the last 30 days?\""
      ]
    }
  },
  'strategy-operations': {
    id: 'strategy-operations',
    displayName: 'Strategy & Operations',
    description: {
      roleGoals: [
        "Align cross-functional teams by spotting where brand sentiment data affects company-wide goals.",
        "Use daily reputation_score and loyalty_score to predict potential operational shifts (e.g., resource planning)."
      ],
      motivation: [
        "Keep a finger on the pulse of brand health so they can anticipate budget changes or new projects.",
        "Present top-level sentiment updates to internal leadership."
      ],
      challenges: [
        "Balancing input from many departments while also dealing with day-to-day operational tasks.",
        "Needing real-time updates on brand issues that could affect the company's long-term plans."
      ],
      keyNeeds: [
        "Rolling dashboards that track big changes in brand sentiment across multiple time frames.",
        "AI-guided narratives to explain sudden shifts (like a sharp drop in buzz_score).",
        "Clear signals when it's time to pivot resources or escalate issues to leadership."
      ]
    }
  },
  'agency-consultant': {
    id: 'agency-consultant',
    displayName: 'Agency or External Consultant',
    description: {
      roleGoals: [
        "Work with clients' brand sentiment data to guide campaign strategies or product launches.",
        "Offer solutions backed by daily metrics, including brand awareness_score, trust_score, and more."
      ],
      motivation: [
        "Win repeat business by giving advice grounded in fresh, reliable data.",
        "Show how they contributed to a jump in recommendation_score or a reduction in negative impression."
      ],
      challenges: [
        "Might juggle multiple client dashboards, each with different brand targets or regions.",
        "Limited direct control over internal tools, so the AI chat must be straightforward."
      ],
      keyNeeds: [
        "Flexible ways to create and save custom views for each client's brand.",
        "Quick comparisons between a client's brand and key competitors.",
        "Easy exports to share with clients who don't have full access to the system."
      ]
    }
  }
};