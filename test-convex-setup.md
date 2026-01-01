# Convex Setup Verification

## ✅ Completed Tasks

1. **Schema Created** - `convex/schema.ts`
   - ✅ `users` table with 4 indexes
   - ✅ `weeklyMatches` table with 7 indexes
   - ✅ `passReasons` table with 3 indexes
   - ✅ `dateOutcomes` table with 4 indexes
   - **Total: 18 indexes created**

2. **OpenRouter Integration** - `convex/lib/openrouter.ts`
   - ✅ `callOpenRouter()` - Main API call function
   - ✅ `generateEmbedding()` - Generate embeddings for profiles
   - ✅ `callWithRetry()` - Retry logic with rate limit handling

3. **Cosine Similarity** - `convex/lib/cosine.ts`
   - ✅ `cosineSimilarity()` - Calculate similarity between embeddings

4. **User Functions** - `convex/users.ts`
   - ✅ `getUserByClerkId` - Query user by Clerk ID
   - ✅ `getCurrentUser` - Get authenticated user
   - ✅ `createUser` - Create user with embedding generation
   - ✅ `updateProfile` - Update profile and regenerate embedding
   - ✅ `updateAccountStatus` - Admin verification (document and photo) approval/rejection
   - ✅ `setVacationMode` - Enable/disable vacation mode
   - ✅ `getUsersForMatching` - Get approved users for matching

5. **Environment Variables Added**
   - ✅ `OPENROUTER_API_KEY`
   - ✅ `OPENROUTER_SITE_URL`
   - ✅ `OPENROUTER_APP_NAME`
   - ✅ `EMBEDDING_MODEL`
   - ✅ `FALLBACK_MODEL`

## 🔍 Schema Verification

Run `npx convex dev --once` output:
```
✔ Added table indexes:
  [+] dateOutcomes.by_date_happened
  [+] dateOutcomes.by_match
  [+] dateOutcomes.by_user
  [+] dateOutcomes.by_would_meet_again
  [+] passReasons.by_match
  [+] passReasons.by_reason
  [+] passReasons.by_user
  [+] users.by_clerk_id
  [+] users.by_email
  [+] users.by_account_status
  [+] users.by_vacation
  [+] weeklyMatches.by_match_and_user
  [+] weeklyMatches.by_match_user_and_week
  [+] weeklyMatches.by_user
  [+] weeklyMatches.by_user_and_match
  [+] weeklyMatches.by_user_and_week
  [+] weeklyMatches.by_week
✔ Convex functions ready!
```

## 📊 Database Tables

### 1. users
**Purpose**: Store user profiles, photos, and AI embeddings

**Key Fields**:
- `clerkId` - Authentication identifier
- `accountStatus` - pending | approved | rejected
- `attractivenessRating` - 1-10 (PRIVATE, never exposed)
- `embedding` - 1536-dimensional vector for matching
- `vacationMode` - Exclude from matching when true

**Indexes**: by_clerk_id, by_email, by_account_status, by_vacation

### 2. weeklyMatches
**Purpose**: Store weekly match pairs with AI-generated content

**Key Fields**:
- `userId`, `matchUserId` - Match pair
- `weekOf` - Week identifier (e.g., '2024-12-16')
- `compatibilityScore` - 0-100 from GPT-4 analysis
- `conversationStarters` - Array of 3 AI-generated starters
- `suggestedVenue` - Midpoint café from Google Places
- `userResponse`, `matchResponse` - pending | interested | passed
- `mutualMatch` - True when both interested

**Indexes**: by_user_and_match, by_match_and_user (prevent duplicates), by_user, by_week, by_user_and_week, by_match_user_and_week

### 3. passReasons
**Purpose**: Optional feedback when users pass on matches

**Key Fields**:
- `reason` - too_far | lifestyle | attraction | profile | dealbreaker | no_chemistry | skipped

**Indexes**: by_user, by_match, by_reason

### 4. dateOutcomes
**Purpose**: Post-date feedback (CRITICAL for algorithm validation)

**Key Fields**:
- `dateHappened` - yes | cancelled_by_them | cancelled_by_me | rescheduled
- `wouldMeetAgain` - yes | maybe | no (PRIMARY KPI)
- `overallRating` - 1-5 stars
- `conversationStartersHelpful`, `venueRating` - Feature feedback

**Indexes**: by_match, by_user, by_date_happened, by_would_meet_again

## 🎯 Next Steps

1. **Add OpenRouter API Key** to `.env.local`
   - Get key from: https://openrouter.ai/keys
   - Replace `your_openrouter_api_key_here`

2. **Test User Creation** in frontend:
   ```typescript
   import { useMutation } from "convex/react";
   import { api } from "@/convex/_generated/api";

   const createUser = useMutation(api.users.createUser);

   await createUser({
     clerkId: "user_123",
     email: "test@example.com",
     name: "Test User",
     age: 28,
     gender: "female",
     location: "San Francisco, CA",
     bio: "I love hiking and coffee...",
     lookingFor: "Someone who enjoys...",
     interests: ["Hiking", "Coffee", "Reading"]
   });
   ```

3. **Verify in Convex Dashboard**:
   - Go to https://dashboard.convex.dev
   - Select project: meetonce
   - Click "Data" tab
   - Verify all 4 tables exist with correct indexes

## ⚠️ Important Notes

- **Attractiveness ratings are PRIVATE**: Never exposed via any API
- **One match per week per user**: Enforced in matching algorithm
- **Never match same pair twice**: Compound indexes prevent duplicates
- **Embedding generation**: Automatic on profile creation/update
- **Fallback model**: Free Llama 3 8B if primary model unavailable
