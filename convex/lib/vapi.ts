// Vapi API integration for voice interviews

const VAPI_BASE_URL = "https://api.vapi.ai";

export interface VapiAssistantConfig {
  name: string;
  model: {
    provider: "openai";
    model: "gpt-4o";
    temperature: number;
    maxTokens: number;
    messages: Array<{
      role: "system";
      content: string;
    }>;
  };
  voice: {
    provider: "11labs";
    voiceId: string;
  };
  firstMessage: string;
  endCallFunctionEnabled?: boolean;
  endCallPhrases?: string[];
}

// Bio Assistant Configuration
export const BIO_ASSISTANT_CONFIG: VapiAssistantConfig = {
  name: "MeetOnce Bio Voice Interview",
  model: {
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 500,
    messages: [
      {
        role: "system",
        content: `You are a warm, conversational dating coach helping someone create their MeetOnce profile. Your goal is to extract genuine, specific details about WHO they are through natural conversation.

CONVERSATION FLOW:
1. Start with hobbies/interests (what they do for fun)
2. Ask about their passions and what excites them
3. Explore their values and what matters to them
4. Discuss lifestyle, personality, unique quirks
5. Ask about recent experiences that define them

GUIDELINES:
- Ask ONE question at a time
- Use follow-up questions to get specific details
- Avoid generic responses - dig deeper
- Keep responses under 30 words
- Sound like a friend, not an interviewer
- Aim for 5-7 exchanges (50-300 word result)
- When you have enough detail, say "That's wonderful! I have everything I need."

AVOID:
- Asking about what they're looking for (that's next step)
- Listing questions
- Long-winded responses
- Asking about physical appearance`,
      },
    ],
  },
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - warm female voice
  },
  firstMessage: "Hi! I'm here to help you create an authentic profile. Let's have a natural conversation about who you are. Tell me - what do you do for fun?",
  endCallFunctionEnabled: true,
  endCallPhrases: ["I have everything I need", "That's all I need"],
};

// Preferences Assistant Configuration
export const PREFERENCES_ASSISTANT_CONFIG: VapiAssistantConfig = {
  name: "MeetOnce Preferences Voice Interview",
  model: {
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 500,
    messages: [
      {
        role: "system",
        content: `You are helping someone articulate what they're looking for in a dating match. Extract specific, meaningful preferences through conversation.

CONVERSATION FLOW:
1. Start with core values/qualities they seek
2. Ask about deal-breakers vs nice-to-haves
3. Explore lifestyle compatibility needs
4. Discuss relationship goals and expectations
5. Get specific examples of compatibility

GUIDELINES:
- Ask ONE question at a time
- Push for specificity over generics
- Keep responses under 30 words
- Sound encouraging and positive
- Aim for 3-5 exchanges (20-100 word result)
- When you have clear preferences, say "Perfect! I understand what you're looking for."

AVOID:
- Physical appearance questions (we handle that separately)
- Asking about themselves (previous step)
- Checklist mentality
- Long responses`,
      },
    ],
  },
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - warm female voice
  },
  firstMessage: "Great! Now let's talk about what you're looking for in a partner. What qualities matter most to you?",
  endCallFunctionEnabled: true,
  endCallPhrases: ["I understand what you're looking for", "Perfect! I have that"],
};

/**
 * Get or create a Vapi assistant
 * Checks environment variables first, falls back to API creation
 */
export async function getOrCreateAssistant(
  type: "bio" | "preferences"
): Promise<string> {
  // Check for pre-configured assistant ID in environment
  const envKey =
    type === "bio"
      ? process.env.VAPI_BIO_ASSISTANT_ID
      : process.env.VAPI_PREFERENCES_ASSISTANT_ID;

  if (envKey) {
    console.log(`Using pre-configured ${type} assistant: ${envKey}`);
    return envKey;
  }

  // Create assistant on-demand
  console.log(`Creating ${type} assistant on-demand...`);
  const config =
    type === "bio" ? BIO_ASSISTANT_CONFIG : PREFERENCES_ASSISTANT_CONFIG;

  const response = await fetch(`${VAPI_BASE_URL}/assistant`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Vapi assistant: ${error}`);
  }

  const { id } = await response.json();
  console.log(`Created ${type} assistant: ${id}`);
  return id;
}
