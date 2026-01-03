import { callWithRetry } from "./openrouter";

export async function analyzeCompatibility(
  userProfile: string,
  candidateProfile: string
): Promise<{ score: number; explanation: string }> {
  const prompt = `You are an expert relationship compatibility analyst for MeetOnce, a premium dating platform that delivers ONE carefully curated match per week.

CONTEXT: These two people have been algorithmically matched using semantic vector embeddings. Your job is to provide a nuanced compatibility analysis that helps them understand WHY they were matched and what potential they have together.

PERSON A PROFILE:
${userProfile}

PERSON B PROFILE:
${candidateProfile}

ANALYSIS FRAMEWORK:

**1. SHARED VALUES & LIFE PHILOSOPHY (25 points)**
- Core values alignment (family, career, growth, authenticity)
- Life priorities and what they're optimizing for
- Worldview and how they approach life
- Emotional maturity and self-awareness

**2. LIFESTYLE COMPATIBILITY (25 points)**
- Daily routines and energy patterns (morning person vs night owl)
- Social preferences (introvert/extrovert balance, alone time needs)
- Activity level and weekend style (active vs relaxed, planned vs spontaneous)
- Work-life balance philosophy

**3. INTERESTS & CONNECTION POINTS (20 points)**
- Shared hobbies and activities they could do together
- Complementary interests that create curiosity
- Cultural alignment (food, music, art, travel preferences)
- Intellectual compatibility and conversation depth

**4. COMMUNICATION & EMOTIONAL STYLE (20 points)**
- Conflict resolution approaches (direct vs processing time)
- Emotional expression and vulnerability comfort
- Communication preferences (talking vs texting, depth vs lightness)
- How they handle challenges and stress

**5. RELATIONSHIP VISION & GOALS (10 points)**
- Timeline alignment (casual dating vs marriage-track)
- Future goals (kids, location, lifestyle)
- Relationship expectations and commitment level
- Deal-breaker alignment

SCORING GUIDELINES:
- **90-100**: Exceptional match - rare alignment across all dimensions, minimal friction points
- **80-89**: Excellent match - strong compatibility with minor differences that add interest
- **70-79**: Good match - solid foundation with some areas requiring compromise
- **60-69**: Moderate match - potential with significant differences to navigate
- **Below 60**: Low compatibility - fundamental misalignment in core areas

EXPLANATION GUIDELINES:
- Write 2-3 warm, conversational paragraphs (150-250 words total)
- **Paragraph 1**: Lead with the strongest compatibility points - what makes this match exciting and promising
- **Paragraph 2**: Explore complementary differences that could create chemistry and growth
- **Paragraph 3**: Acknowledge any potential friction points honestly but optimistically, framing them as opportunities for understanding

TONE: Warm, encouraging, and authentic. Write like a wise friend who wants them to succeed. Avoid:
- Generic platitudes ("you both enjoy life", "communication is key")
- Overly clinical language
- Lists or bullet points - use flowing narrative
- Forced positivity - be honest but kind

Be specific and reference actual details from their profiles. Make them feel seen and understood.

You MUST respond with valid JSON in this exact format:
{
  "score": <number between 0-100>,
  "explanation": "<2-3 warm paragraphs explaining compatibility>"
}`;

  const response = await callWithRetry({
    model: process.env.ANALYSIS_MODEL ?? "openai/gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "compatibility_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            score: {
              type: "number",
              description: "Compatibility score from 0-100",
            },
            explanation: {
              type: "string",
              description: "2-3 warm paragraphs explaining compatibility",
            },
          },
          required: ["score", "explanation"],
          additionalProperties: false,
        },
      },
    },
    temperature: 0.7,
    max_tokens: 600,
  });

  const content = response.choices[0].message.content;

  try {
    const parsed = JSON.parse(content);
    return {
      score: parsed.score,
      explanation: parsed.explanation,
    };
  } catch (error) {
    console.error("Failed to parse compatibility response:", content);
    console.error("Parse error:", error);
    throw new Error(
      `Invalid JSON response from LLM: ${content.substring(0, 100)}`
    );
  }
}

export async function generateConversationStarters(
  userProfile: string,
  matchProfile: string
): Promise<string[]> {
  const prompt = `You are a dating conversation expert for MeetOnce. Generate 3 conversation starters for two people who matched and will meet for their first date.

CONTEXT: This is a premium dating platform - users receive ONE curated match per week and are meeting in person. These starters will be revealed AFTER both people express interest. They should facilitate an engaging first date conversation.

PERSON A PROFILE:
${userProfile}

PERSON B PROFILE:
${matchProfile}

CONVERSATION STARTER REQUIREMENTS:

**STARTER 1: Shared Interest Deep Dive**
- Reference a SPECIFIC shared interest or hobby from both profiles
- Go beyond surface-level ("You both like hiking" ❌)
- Ask about preferences, experiences, or stories within that interest
- Create opportunity for them to geek out together

**STARTER 2: Complementary Curiosity**
- Highlight where their interests or backgrounds complement each other
- Express genuine curiosity about something unique in their profile
- Frame differences as interesting rather than incompatible
- Opens door to learning from each other

**STARTER 3: Date-Relevant Activity Suggestion**
- Suggest a specific activity or experience they could do together
- Reference both their interests/preferences
- Keep it casual and low-pressure for a first date
- Should feel natural, not forced

QUALITY GUIDELINES:

✅ **DO:**
- Reference specific details from their profiles (places, activities, foods, artists, books)
- Use their actual hobbies/interests, not generic assumptions
- Keep it playful and light while showing depth
- Make it easy to respond to (open-ended but not overwhelming)
- Sound like something a real person would say, not a chatbot

❌ **DON'T:**
- Use generic icebreakers ("What's your favorite color?", "Do you come here often?")
- Ask about physical appearance or photos
- Bring up heavy topics (exes, politics, dealbreakers)
- Use pickup lines or cheesy jokes
- Ask questions already answered in their profiles
- Use clichés ("Where do you see yourself in 5 years?")

TONE: Warm, curious, and authentic. Write like you're a mutual friend introducing them. Each starter should be 1-2 sentences, conversational and natural.

**EXAMPLES OF GOOD STARTERS:**

Profile mentions: Both love Italian cooking and live music
✅ "I saw you both love Italian cooking! Have you tried making fresh pasta? I'm curious what your go-to Sunday cooking project is."
❌ "You both like food, what's your favorite restaurant?"

Profile mentions: One does yoga, other is a marathon runner
✅ "I noticed you're into yoga and they're training for marathons—have you ever tried a yin yoga session for recovery? I bet you two have different approaches to the mind-body connection."
❌ "You both like fitness, do you work out?"

Profile mentions: Both mention travel but to different regions
✅ "You've explored Southeast Asia and they've been all over South America—what's the one place that completely surprised you? I feel like you two have some serious travel stories to swap."
❌ "You both like to travel, where do you want to go next?"

You MUST respond with valid JSON in this exact format:
{
  "starters": ["starter1", "starter2", "starter3"]
}`;

  const response = await callWithRetry({
    model: process.env.ANALYSIS_MODEL ?? "openai/gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "conversation_starters",
        strict: true,
        schema: {
          type: "object",
          properties: {
            starters: {
              type: "array",
              description: "Array of 3 conversation starters",
              items: {
                type: "string",
              },
              minItems: 3,
              maxItems: 3,
            },
          },
          required: ["starters"],
          additionalProperties: false,
        },
      },
    },
    temperature: 0.8,
    max_tokens: 400,
  });

  const content = response.choices[0].message.content;

  try {
    const parsed = JSON.parse(content);
    return parsed.starters;
  } catch (error) {
    console.error("Failed to parse conversation starters response:", content);
    console.error("Parse error:", error);
    throw new Error(
      `Invalid JSON response from LLM: ${content.substring(0, 100)}`
    );
  }
}

export async function suggestVenue(location: string): Promise<{
  name: string;
  address: string;
  placeId: string;
  description: string;
}> {
  // TODO: Integrate Google Places API
  // For now, return placeholder
  return {
    name: "The Local Café",
    address: `${location} city center`,
    placeId: "placeholder",
    description: "A cozy café perfect for a first date",
  };
}

export function formatProfile(user: any): string {
  return `${user.bio}\n\nLooking for ${user.lookingFor}`;
}

export function getWeekOfString(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Calculate days to subtract to get to Monday
  // Sunday (0) should go back 6 days, Monday (1) stays same, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Create Monday's date
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToSubtract);

  // Format as YYYY-MM-DD in LOCAL timezone (not UTC)
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const day = String(monday.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
