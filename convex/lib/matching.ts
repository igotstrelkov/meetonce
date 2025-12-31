import { callWithRetry } from "./openrouter";

export async function analyzeCompatibility(
  userProfile: string,
  candidateProfile: string
): Promise<{ score: number; explanation: string }> {
  const prompt = `Analyze compatibility between these two people for dating:

Person A:
${userProfile}

Person B:
${candidateProfile}

Analyze their compatibility focusing on:
1. Shared values and life goals
2. Compatible interests and hobbies
3. Lifestyle alignment
4. Communication style compatibility
5. Long-term relationship potential

Respond with JSON:
{
  "score": <number 0-100>,
  "explanation": "<2-3 warm paragraphs explaining compatibility>"
}`;

  const response = await callWithRetry({
    model: process.env.ANALYSIS_MODEL ?? "anthropic/claude-3.5-sonnet",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 500,
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(content);
  return {
    score: parsed.score,
    explanation: parsed.explanation,
  };
}

export async function generateConversationStarters(
  userProfile: string,
  matchProfile: string
): Promise<string[]> {
  const prompt = `Based on these two profiles, generate 3 conversation starters:

Person A:
${userProfile}

Person B:
${matchProfile}

Generate 3 specific, personalized conversation starters that:
- Reference shared interests or complementary traits
- Are natural and friendly
- Help break the ice
- Show you read their profiles

Respond with JSON:
{
  "starters": ["starter1", "starter2", "starter3"]
}`;

  const response = await callWithRetry({
    model: process.env.ANALYSIS_MODEL ?? "anthropic/claude-3.5-sonnet",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 300,
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(content);
  return parsed.starters;
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
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const day = String(monday.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
