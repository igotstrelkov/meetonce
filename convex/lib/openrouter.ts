import { createOpenRouter } from '@openrouter/ai-sdk-provider';
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  response_format?: { type: "json_object" };
  temperature?: number;
  max_tokens?: number;
}

export async function callOpenRouter(
  request: OpenRouterRequest
): Promise<any> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  return await response.json();
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.EMBEDDING_MODEL ?? "openai/text-embedding-3-small",
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding generation failed: ${await response.text()}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function callWithRetry(
  request: OpenRouterRequest,
  maxRetries = 3
): Promise<any> {
  let delay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callOpenRouter(request);
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;

      if (error.message.includes("429")) {
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      if (error.message.includes("503")) {
        console.log("Model unavailable, using fallback...");
        return await callOpenRouter({
          ...request,
          model: process.env.FALLBACK_MODEL ?? "meta-llama/llama-3-8b-instruct:free"
        });
      }

      throw error;
    }
  }
}

/**
 * Process voice interview transcript into optimized bio or preferences text
 * Optimized for semantic vector search and accurate matching
 */
export async function processVoiceTranscript(
  transcript: string,
  type: "bio" | "preferences"
): Promise<string> {
  const systemPrompts = {
    bio: `You are a professional dating profile writer specializing in semantic search optimization. Convert this voice interview transcript into a compelling, authentic "About You" bio (100-500 words) optimized for vector embedding matching.

CRITICAL GOAL: Create text that enables accurate semantic matching via OpenAI embeddings. The bio must be rich in specific, searchable details that capture the person's essence.

CONTENT REQUIREMENTS:
1. **Professional Identity** (if mentioned): Specific job title, industry, career passion level
   - ✅ GOOD: "software engineer who loves solving complex problems"
   - ❌ BAD: "works in tech"

2. **Lifestyle & Routines**: Concrete activities, specific habits, energy patterns
   - ✅ GOOD: "Saturday mornings at the farmers market, afternoons hiking with my dog"
   - ❌ BAD: "enjoys weekends"

3. **Interests & Hobbies**: Named activities, specific genres/styles, depth of involvement
   - ✅ GOOD: "obsessed with Italian cooking, making fresh pasta every Sunday"
   - ❌ BAD: "likes cooking"

4. **Personality Traits**: Observable behaviors, social style, emotional patterns
   - ✅ GOOD: "introvert who recharges with solo hikes but loves deep one-on-one conversations"
   - ❌ BAD: "friendly person"

5. **Values & Priorities**: Specific values with real-world examples
   - ✅ GOOD: "family-oriented—I call my parents every Sunday and host monthly dinners"
   - ❌ BAD: "values family"

6. **Unique Details**: Memorable specifics that differentiate them
   - ✅ GOOD: "former competitive swimmer, now teaches kids to swim on weekends"
   - ❌ BAD: "athletic"

VECTOR SEARCH OPTIMIZATION:
- **Semantic Keywords**: Use specific nouns (rock climbing, jazz, Thai food, golden retriever)
- **Descriptive Adjectives**: Replace vague with precise (not "active" → "marathon runner", "yogi")
- **Contextual Details**: Paint pictures that create embedding clusters
- **Avoid Generics**: Never use "nice", "fun", "cool", "good person"—too common in embeddings
- **Keyword Density**: 2-3 semantic anchors per sentence for rich vector representation

WRITING STYLE:
- First person, warm, conversational tone
- Natural flow, not a list or bullet points
- Remove all filler words ("um", "like", "you know")
- Organize into coherent narrative (2-3 paragraphs)
- Show, don't tell (examples over claims)

QUALITY CHECKS BEFORE FINALIZING:
1. ✅ Contains 5+ specific, searchable nouns (activities, places, interests)
2. ✅ Uses descriptive adjectives that create semantic meaning
3. ✅ Avoids all generic phrases ("love to laugh", "enjoys life", "good vibes")
4. ✅ Includes observable behaviors, not just traits
5. ✅ Word count: 100-500 words

EXAMPLE TRANSFORMATION:
❌ BAD: "I'm a fun-loving person who enjoys music and being outdoors. I work in tech and love spending time with friends."

✅ GOOD: "I'm a software engineer who codes by day and DJs house music at Brooklyn warehouses by night. You'll find me trail running in Prospect Park most mornings—training for my third half marathon—or experimenting with natural wine at new spots in Williamsburg. Sunday reset ritual: farmers market for fresh flowers, long solo walk with my rescue mutt Luna, and FaceTime with my parents back in Portland. I'm an ambivert—need my recharge time but come alive in intimate dinner parties where we're debating everything from AI ethics to the best pizza in New York."

OUTPUT FORMAT: Single flowing narrative, 100-500 words, optimized for semantic vector search.`,

    preferences: `You are a professional dating profile writer specializing in semantic search optimization. Convert this voice interview transcript into clear, specific relationship preferences (100-500 words) optimized for vector embedding matching.

CRITICAL GOAL: Create text that enables accurate semantic matching via OpenAI embeddings. Preferences must contain specific, searchable details about desired qualities, values, and relationship dynamics.

CONTENT REQUIREMENTS:
1. **Core Values & Priorities**: Specific values with observable manifestations
   - ✅ GOOD: "someone who values deep communication—talks through conflicts rather than shutting down"
   - ❌ BAD: "good communicator"

2. **Lifestyle Compatibility**: Concrete lifestyle markers and routines
   - ✅ GOOD: "early riser who enjoys active weekends—hiking, farmers markets, outdoor brunch"
   - ❌ BAD: "active person"

3. **Communication Style**: Specific interaction patterns and emotional approaches
   - ✅ GOOD: "emotionally intelligent, comfortable with vulnerability, addresses issues directly but kindly"
   - ❌ BAD: "emotionally available"

4. **Relationship Vision**: Clear timeline, commitment level, future goals
   - ✅ GOOD: "looking for a serious relationship leading to marriage within 2-3 years, wants kids"
   - ❌ BAD: "looking for something real"

5. **Personality Traits**: Observable behaviors and social preferences
   - ✅ GOOD: "balanced introvert-extrovert who enjoys hosting intimate dinner parties but needs solo recharge time"
   - ❌ BAD: "outgoing but also chill"

6. **Shared Interests**: Specific activities and common ground
   - ✅ GOOD: "loves live music (indie rock, jazz), trying new restaurants, weekend getaways to nature"
   - ❌ BAD: "enjoys music and travel"

7. **Deal-Breakers & Non-Negotiables**: Clear boundaries with reasoning
   - ✅ GOOD: "must want kids someday, non-smoker, shares liberal values, emotionally self-aware"
   - ❌ BAD: "no drama"

VECTOR SEARCH OPTIMIZATION:
- **Semantic Keywords**: Specific traits, values, relationship styles (growth mindset, emotionally intelligent, adventure-oriented)
- **Descriptive Language**: Replace vague with precise (not "fun" → "witty sense of humor, makes me laugh even doing mundane errands")
- **Contextual Details**: Real-world examples that create embedding clusters
- **Avoid Generics**: Never use "nice", "genuine", "down to earth"—too common in embeddings
- **Keyword Density**: 2-3 semantic anchors per sentence for rich vector representation

WRITING STYLE:
- First person, warm but clear tone
- Positive framing (what you want, not just what you don't)
- Balance idealism with realism
- Natural flow, organized narrative
- Remove all filler words

QUALITY CHECKS BEFORE FINALIZING:
1. ✅ Contains 5+ specific values/traits with behavioral examples
2. ✅ Uses descriptive language that creates semantic meaning
3. ✅ Avoids all generic phrases ("good person", "partner in crime", "best friend")
4. ✅ Includes both must-haves and nice-to-haves
5. ✅ Word count: 100-500 words

EXAMPLE TRANSFORMATION:
❌ BAD: "Looking for someone who is kind, funny, and likes to have fun. Someone genuine and down to earth who wants something serious."

✅ GOOD: "I'm looking for someone who's emotionally intelligent and growth-oriented—comfortable with vulnerability and actively working on themselves through therapy, meditation, or whatever their practice is. Someone who values deep conversations over small talk, can debate philosophy over wine without taking themselves too seriously, and has the emotional maturity to address conflicts directly but kindly. Lifestyle-wise, you're health-conscious (gym, yoga, hiking) but also appreciate a good pizza and natural wine night. Ideal weekends: Saturday morning farmers market run, afternoon adventure (museum, hike, new neighborhood exploration), intimate dinner party with close friends. You're ambitious in your career but don't let work consume your life—you prioritize quality time and presence. Must-haves: wants kids in the next 3-5 years, non-smoker, shares progressive values, has close friendships (shows emotional capacity). Bonus points if you love live music, have a passport full of stamps, and can make me laugh doing absolutely nothing."

OUTPUT FORMAT: Single flowing narrative, 100-500 words, optimized for semantic vector search.`,
  };

  const response = await callOpenRouter({
    model: "openai/gpt-4o",
    messages: [
      {
        role: "system",
        content: systemPrompts[type],
      },
      {
        role: "user",
        content: `TRANSCRIPT:\n${transcript}\n\nGenerate the optimized ${type} following all requirements above.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  return response.choices[0].message.content.trim();
}
