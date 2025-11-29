export const sampleNewsData = [
  {
    id: 1,
    title: "The 27th Amendment & Power Shift",
    category: "Politics",
    timeAgo: 12,
    summary: "The constitutional package moves forward after rancorous debate. Proponents pitch stability and coherent command; critics warn of centralization and weaker judicial independence. Business voices worry about policy whiplash if rushed.",
    sentiment: {
      type: "negative",
      percentage: 40,
      positive: 20,
      neutral: 40,
      negative: 40
    },
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop",
    sources: [
      {
        id: 1,
        source: "PTV News",
        headline: "Reform for a Stronger Pakistan?",
        url: "https://ptvnews.gov.pk",
        sentiment: "positive",
        excerpt: "The 27th Amendment introduces sweeping changes to constitutional structures, with proponents arguing it strengthens governance.",
        summary: null,
        timeAgo: 120, // 2 hours ago
        category: "Politics",
        topicId: 1,
        topicName: "The 27th Amendment & Power Shift"
      },
      {
        id: 2,
        source: "Dawn",
        headline: "PTI's Gohar raises 'elite class' concern",
        url: "https://dawn.com",
        sentiment: "neutral",
        excerpt: "Opposition leader questions whether the new amendment serves the interests of ordinary citizens or political elites.",
        summary: null,
        timeAgo: 180, // 3 hours ago
        category: "Politics",
        topicId: 1,
        topicName: "The 27th Amendment & Power Shift"
      },
      {
        id: 3,
        source: "Al Jazeera",
        headline: "Power balance and army's role",
        url: "https://aljazeera.com",
        sentiment: "negative",
        excerpt: "Critics warn that the amendment shifts too much authority to military institutions, potentially undermining civilian oversight.",
        summary: null,
        timeAgo: 240, // 4 hours ago
        category: "Politics",
        topicId: 1,
        topicName: "The 27th Amendment & Power Shift"
      },
      {
        id: 4,
        source: "Express Tribune",
        headline: "Senate numbers and process",
        url: "https://tribune.com.pk",
        sentiment: "neutral",
        excerpt: "The amendment passed with majority support in the Senate, though the voting process faced procedural challenges.",
        summary: null,
        timeAgo: 300, // 5 hours ago
        category: "Politics",
        topicId: 1,
        topicName: "The 27th Amendment & Power Shift"
      },
      {
        id: 5,
        source: "Civil society",
        headline: "Rule-of-law anxieties",
        url: "#",
        sentiment: "negative",
        excerpt: "Human rights organizations express concerns about the impact on judicial independence and civil liberties.",
        summary: null,
        timeAgo: 360, // 6 hours ago
        category: "Politics",
        topicId: 1,
        topicName: "The 27th Amendment & Power Shift"
      }
    ],
    quote: "Institutional redesign can be reform—or re-rule.",
    quoteAuthor: "KarachiAnalyst"
  },
  {
    id: 2,
    title: "AI Breakthrough in Quantum Computing",
    category: "Technology",
    timeAgo: 45,
    summary: "Scientists achieve major milestone in quantum computing with new error correction techniques. The breakthrough could accelerate practical applications in cryptography, drug discovery, and climate modeling. Industry leaders express cautious optimism.",
    sentiment: {
      type: "positive",
      percentage: 50,
      positive: 50,
      neutral: 50,
      negative: 0
    },
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop",
    sources: [
      {
        id: 6,
        source: "TechCrunch",
        headline: "Quantum leap forward in computing technology",
        url: "https://techcrunch.com",
        sentiment: "positive",
        excerpt: "Researchers achieve breakthrough in quantum error correction, potentially bringing practical quantum computing closer to reality.",
        summary: null,
        timeAgo: 270, // 4.5 hours ago
        category: "Technology",
        topicId: 2,
        topicName: "AI Breakthrough in Quantum Computing"
      },
      {
        id: 7,
        source: "Nature",
        headline: "New error correction methods show promise",
        url: "https://nature.com",
        sentiment: "positive",
        excerpt: "Scientific journal publishes peer-reviewed study demonstrating significant improvements in quantum error rates.",
        summary: null,
        timeAgo: 360, // 6 hours ago
        category: "Science",
        topicId: 2,
        topicName: "AI Breakthrough in Quantum Computing"
      },
      {
        id: 8,
        source: "Wired",
        headline: "When will quantum computers be practical?",
        url: "https://wired.com",
        sentiment: "neutral",
        excerpt: "Industry analysts debate timeline for commercial quantum computing applications despite recent advances.",
        summary: null,
        timeAgo: 420, // 7 hours ago
        category: "Technology",
        topicId: 2,
        topicName: "AI Breakthrough in Quantum Computing"
      },
      {
        id: 9,
        source: "The Verge",
        headline: "Experts remain cautious about timeline",
        url: "https://theverge.com",
        sentiment: "neutral",
        excerpt: "While acknowledging progress, scientists emphasize that significant challenges remain before practical deployment.",
        summary: null,
        timeAgo: 480, // 8 hours ago
        category: "Technology",
        topicId: 2,
        topicName: "AI Breakthrough in Quantum Computing"
      }
    ],
    quote: "This could be the decade when quantum computing moves from lab to reality.",
    quoteAuthor: "QuantumInsider"
  },
  {
    id: 3,
    title: "Global Markets React to Trade Agreement",
    category: "Business",
    timeAgo: 120,
    summary: "International trade pact signed between major economies sends ripple effects across global markets. Stock indices surge while currency markets show volatility. Analysts predict both opportunities and challenges for emerging economies.",
    sentiment: {
      type: "neutral",
      percentage: 50,
      positive: 25,
      neutral: 50,
      negative: 25
    },
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
    sources: [
      {
        id: 10,
        source: "Financial Times",
        headline: "Trade deal boosts investor confidence",
        url: "https://ft.com",
        sentiment: "positive",
        excerpt: "Stock markets rally as major economies finalize comprehensive trade agreement, signaling renewed global economic cooperation.",
        summary: null,
        timeAgo: 480, // 8 hours ago
        category: "Business",
        topicId: 3,
        topicName: "Global Markets React to Trade Agreement"
      },
      {
        id: 11,
        source: "Bloomberg",
        headline: "Market gains tempered by regulatory concerns",
        url: "https://bloomberg.com",
        sentiment: "neutral",
        excerpt: "Investors welcome trade pact but remain cautious about implementation details and potential regulatory changes.",
        summary: null,
        timeAgo: 540, // 9 hours ago
        category: "Business",
        topicId: 3,
        topicName: "Global Markets React to Trade Agreement"
      },
      {
        id: 12,
        source: "Reuters",
        headline: "Smaller economies express reservations",
        url: "https://reuters.com",
        sentiment: "negative",
        excerpt: "Developing nations voice concerns about potential disadvantages in new trade framework favoring larger economies.",
        summary: null,
        timeAgo: 600, // 10 hours ago
        category: "Economy",
        topicId: 3,
        topicName: "Global Markets React to Trade Agreement"
      },
      {
        id: 13,
        source: "Wall Street Journal",
        headline: "What the trade pact means for consumers",
        url: "https://wsj.com",
        sentiment: "neutral",
        excerpt: "Analysis suggests mixed effects for consumers, with potential price reductions offset by job market adjustments.",
        summary: null,
        timeAgo: 660, // 11 hours ago
        category: "Business",
        topicId: 3,
        topicName: "Global Markets React to Trade Agreement"
      }
    ],
    quote: "Trade agreements create winners and losers—the question is who benefits most.",
    quoteAuthor: "EconomicWatch"
  }
]
