import { Doc } from "../_generated/dataModel";
import { callWithRetry } from "./openrouter";

export interface DimensionScores {
  values: number;
  lifestyle: number;
  interests: number;
  communication: number;
  relationshipVision: number;
}

export interface CompatibilityAnalysis {
  dimensionScores: DimensionScores;
  totalScore: number;
  redFlags: string[];
  explanation: string;
}

export async function analyzeCompatibility(
  userProfile: string,
  candidateProfile: string
): Promise<CompatibilityAnalysis> {
  const prompt = `You are a professional matchmaker with 15 years of experience analyzing relationship compatibility. You predict real compatibility based on psychology research, not just surface similarities. You are honest, specific, and data-driven. You understand that "good on paper" doesn't always mean real chemistry, and you score accordingly.

CONTEXT: These two people have been algorithmically matched using semantic vector embeddings for MeetOnce, a premium dating platform that delivers ONE carefully curated match per week. Your job is to provide an accurate compatibility analysis that predicts real match quality.

PERSON A PROFILE:
${userProfile}

PERSON B PROFILE:
${candidateProfile}

ANALYSIS FRAMEWORK:

**1. SHARED VALUES & LIFE PHILOSOPHY (0-25 points)**
- Core values alignment (family, career, growth, authenticity)
- Life priorities and what they're optimizing for
- Worldview and how they approach life
- Emotional maturity and self-awareness

Scoring Guide:
• 20-25: Core values perfectly aligned, same life priorities, complementary worldviews
• 15-19: Strong values overlap, minor differences in priorities
• 10-14: Some shared values, notable differences in life approach
• 5-9: Different values but potential for growth
• 0-4: Fundamental values misalignment

**2. LIFESTYLE COMPATIBILITY (0-25 points)**
- Daily routines and energy patterns (morning person vs night owl)
- Social preferences (introvert/extrovert balance, alone time needs)
- Activity level and weekend style (active vs relaxed, planned vs spontaneous)
- Work-life balance philosophy

Scoring Guide:
• 20-25: Daily routines sync naturally, compatible energy levels, complementary social needs
• 15-19: Similar lifestyle with minor adjustments needed
• 10-14: Different rhythms but willing to compromise
• 5-9: Significant lifestyle differences requiring major adjustments
• 0-4: Incompatible daily patterns (night owl + morning person, workaholic + needs quality time)

**3. INTERESTS & CONNECTION POINTS (0-20 points)**
- Shared hobbies and activities they could do together
- Complementary interests that create curiosity
- Cultural alignment (food, music, art, travel preferences)
- Intellectual compatibility and conversation depth

Scoring Guide:
• 16-20: Multiple shared passions + complementary interests that create curiosity
• 11-15: 2-3 genuine shared interests with specificity
• 6-10: Some overlap, mostly different but compatible interests
• 0-5: Few shared interests, limited connection points

**4. COMMUNICATION & EMOTIONAL STYLE (0-20 points)**
- Conflict resolution approaches (direct vs processing time)
- Emotional expression and vulnerability comfort
- Communication preferences (talking vs texting, depth vs lightness)
- How they handle challenges and stress

Scoring Guide:
• 16-20: Aligned conflict resolution, similar emotional expression, compatible vulnerability levels
• 11-15: Different styles but complementary, both emotionally mature
• 6-10: Some communication gaps, manageable with effort
• 0-5: Incompatible communication (avoidant + needs constant talk)

**5. RELATIONSHIP VISION & GOALS (0-10 points)**
- Timeline alignment (casual dating vs marriage-track)
- Future goals (kids, location, lifestyle)
- Relationship expectations and commitment level
- Deal-breaker alignment

Scoring Guide:
• 8-10: Identical timeline, aligned on kids/marriage/location
• 5-7: Similar vision with minor timeline differences
• 0-4: Misaligned timeline or fundamental goal differences (wants kids vs doesn't)

SCORING GUIDELINES - BE STRICT AND REALISTIC:

**You are an expert matchmaker, not a cheerleader. Your job is to predict REAL compatibility, not sell the match.**

⚠️ **COMMON SCORING MISTAKES TO AVOID:**
- **Score inflation**: Don't give 85+ just because they seem "nice" or have some things in common
- **Ignoring red flags**: If there are fundamental misalignments, score them accordingly
- **Surface-level matching**: "Both like travel" is NOT strong compatibility (everyone likes travel)
- **Forced positivity**: If someone wants kids soon and the other is unsure, that's a 60, not a 75

**Score Distribution Reality Check:**
- **90-100 (Exceptional)**: <5% of matches - rare, multi-dimensional alignment with minimal friction
- **80-89 (Excellent)**: ~15% of matches - strong compatibility, minor differences add interest
- **70-79 (Good)**: ~30% of matches - solid foundation, requires meaningful compromise
- **60-69 (Moderate)**: ~35% of matches - potential exists but significant differences
- **<60 (Low)**: ~15% of matches - fundamental misalignments

**RED FLAGS THAT LOWER SCORES:**
- Life stage misalignment (one exploring, one ready to settle): -15 points
- Incompatible daily rhythms (night owl + early riser): -10 points
- Family timeline conflict (wants kids now vs unsure): -15 points
- Availability mismatch (80hr work weeks + needs quality time): -10 points
- Opposite social energy (extreme introvert + extreme extrovert): -10 points
- Location distance (different cities without relocation plans): -20 points
- Values contradiction (career-focused + values work-life balance): -10 points
- Age gap >10 years with different life stages: -10 points

CALIBRATION EXAMPLES:

**Example 1 - Score: 92 (Exceptional)**
Person A: 28F software engineer in SF, yoga 4x/week, loves jazz, wants kids in 3-5 years, values emotional intelligence
Person B: 30M product designer in SF, rock climbs 3x/week, plays saxophone, wants 2-3 kids, therapy advocate
Why: Exceptional values alignment (growth mindset, emotional maturity), complementary active lifestyles, both creatives in tech, shared SF location, aligned family timeline. Minor difference: yoga vs climbing creates curiosity, not friction.

**Example 2 - Score: 76 (Good but requires compromises)**
Person A: 25F marketing manager, night owl, loves going out, wants to travel the world, unsure about kids
Person B: 32M teacher, early riser, prefers quiet weekends, ready to settle down, wants kids soon
Why: Some shared interests (both love food, museums) but fundamental lifestyle misalignment. Different life stages (she's exploring, he's ready to commit), incompatible daily rhythms (night owl vs early bird), misaligned family timeline. Could work with major compromises.

**Example 3 - Score: 63 (Below threshold - do not match)**
Person A: 29M entrepreneur working 80hr weeks, high-energy extrovert, prioritizes career over everything
Person B: 31F seeks work-life balance, introvert who recharges with alone time, wants consistent quality time
Why: Core values misalignment (career vs balance), incompatible social energy (high-energy extrovert drains introverts), availability mismatch (80hr weeks means little quality time). Not enough foundation despite some shared interests.

Use these examples to calibrate your scoring. BE STRICT - most matches should score 70-85, not 85-95.

EXPLANATION REQUIREMENTS:

✅ **MUST INCLUDE:**
- Reference SPECIFIC details from profiles (actual hobbies, places, values, interests mentioned)
- Cite AGE and LOCATION when relevant to compatibility (e.g., "Both in your late 20s in Brooklyn")
- Name at least 2-3 concrete shared interests from their interests list
- Address the most significant friction point honestly (if score <85)
- Use actual examples: "You both practice morning yoga" not "You're both active"

❌ **NEVER SAY:**
- "You both enjoy life" (meaningless)
- "Communication is key" (generic advice)
- "You like similar things" (be specific about WHAT things)
- Anything that could apply to any two people

**Paragraph 1** (50-80 words): Start with their strongest alignment. Reference specific shared interests/values from profiles. Be concrete.

**Paragraph 2** (50-80 words): Highlight complementary differences that create chemistry. Use specific examples from their bios.

**Paragraph 3** (50-90 words): If score <85, address the main friction point honestly but constructively. If score 85+, emphasize what makes this exceptional.

TONE: Warm but honest. Write like an experienced matchmaker who cares about real success, not just selling the match.

You MUST respond with valid JSON in this exact format:
{
  "dimensionScores": {
    "values": <0-25>,
    "lifestyle": <0-25>,
    "interests": <0-20>,
    "communication": <0-20>,
    "relationshipVision": <0-10>
  },
  "totalScore": <sum of dimension scores, 0-100>,
  "redFlags": [<array of 0-3 strings describing potential compatibility risks>],
  "explanation": "<2-3 warm paragraphs explaining compatibility>"
}

**IMPORTANT**: Calculate dimension scores first, then sum them for totalScore. If you identify red flags, list them concisely (e.g., "7-year age gap may reflect different life stages", "Different cities with no relocation plans"). Leave redFlags empty [] if no significant concerns.`;

  const response = await callWithRetry({
    model: process.env.ANALYSIS_MODEL!,
    messages: [
      {
        role: "system",
        content:
          "You are a professional matchmaker with 15 years of experience. You predict real compatibility based on psychology research, not just surface similarities. You are honest, specific, and data-driven. You understand that 'good on paper' doesn't always mean real chemistry, and you score accordingly.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "compatibility_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            dimensionScores: {
              type: "object",
              description: "Breakdown by dimension",
              properties: {
                values: {
                  type: "number",
                  description: "Shared values & life philosophy (0-25 points)",
                },
                lifestyle: {
                  type: "number",
                  description: "Lifestyle compatibility (0-25 points)",
                },
                interests: {
                  type: "number",
                  description: "Interests & connection points (0-20 points)",
                },
                communication: {
                  type: "number",
                  description: "Communication & emotional style (0-20 points)",
                },
                relationshipVision: {
                  type: "number",
                  description: "Relationship vision & goals (0-10 points)",
                },
              },
              required: [
                "values",
                "lifestyle",
                "interests",
                "communication",
                "relationshipVision",
              ],
              additionalProperties: false,
            },
            totalScore: {
              type: "number",
              description: "Sum of dimension scores (0-100)",
            },
            redFlags: {
              type: "array",
              description: "List of 0-3 potential compatibility risks",
              items: { type: "string" },
              maxItems: 3,
            },
            explanation: {
              type: "string",
              description: "2-3 warm paragraphs explaining compatibility",
            },
          },
          required: [
            "dimensionScores",
            "totalScore",
            "redFlags",
            "explanation",
          ],
          additionalProperties: false,
        },
      },
    },
    temperature: 0.5,
    max_tokens: 800,
  });

  const content = response.choices[0].message.content;

  try {
    const parsed = JSON.parse(content);
    return {
      dimensionScores: parsed.dimensionScores,
      totalScore: parsed.totalScore,
      redFlags: parsed.redFlags || [],
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
    model: process.env.ANALYSIS_MODEL!,
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
  rating: number;
}> {
  // TODO: Integrate Google Places API
  // For now, return placeholder
  return {
    name: "The Local Café",
    address: `${location} city center`,
    placeId: "placeholder",
    rating: 4.5,
  };
}

// Location: ${user.location}
// Gender: ${user.gender}
// Seeking: ${user.interestedIn}${agePreference}

export function formatProfile(user: Doc<"users">): string {
  // const interestsList = user.interests?.length
  //   ? `\n\nInterests: ${user.interests.join(", ")}`
  //   : "";

  const agePreference =
    user.minAge || user.maxAge
      ? ` (seeking ages ${user.minAge || "any"}-${user.maxAge || "any"})`
      : "";

  return `Name: ${user.firstName}
Age: ${user.age}

About me:
${user.bio}

What I'm looking for in a partner:
${user.lookingFor}`;
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
