# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MeetOnce is an AI-powered dating platform that eliminates endless swiping by delivering **one carefully curated match per week**. The platform uses semantic matching (OpenAI embeddings + GPT-4) combined with manual photo rating to create high-quality, compatible matches.

### Core Value Proposition
- **No Swiping**: One curated match per week delivered via email
- **Quality Over Quantity**: Deep compatibility analysis, not just photos
- **AI-Powered Matching**: Semantic matching using OpenAI embeddings + GPT-4
- **Premium Concierge**: Platform handles matching, venue selection, conversation starters
- **Manual Curation**: Every photo and profile reviewed before going live

### Key User Flow
1. User signs up via Clerk authentication → Redirected to `/onboarding`
2. User completes 4-step onboarding wizard (Profile → Bio → Interests → Photo) → User created in Convex → Redirected to `/dashboard`
3. Admin manually reviews photo in `/admin/photo-review`: **Two-step process** (Approve/Reject decision → Rate 1-10 attractiveness scale)
4. User sees "Profile Under Review" message on `/dashboard` until photo is approved
5. Sunday 11pm: Weekly batch matching runs (6-stage AI pipeline)
6. Monday 9am: Users receive one curated match via email
7. Users view match on `/dashboard`: See full profile, compatibility score, and explanation
8. Users respond "Interested" or "Pass" by Friday 11:59pm (optional pass feedback with 6 categories)
9. If mutual match: Conversation starters + suggested venue revealed on dashboard
10. Post-date feedback (8 questions) determines algorithm success

### Success Metrics (Primary KPI)
- **Mutual Interest Rate**: ≥30% (both users want second date after meeting)
- This validates the entire matching algorithm quality

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Convex Backend
Convex functions are located in `convex/` directory. The Convex CLI is used to manage backend:
```bash
npx convex dev       # Run Convex backend in development mode
npx convex deploy    # Deploy Convex functions
npx convex -h        # Show all available Convex commands
npx convex docs      # Launch Convex documentation
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router with React Server Components)
- **Authentication**: Clerk (session-based, OAuth support)
- **Backend/Database**: Convex (serverless DB + functions + scheduled jobs + file storage)
- **Email**: Resend with React Email templates
- **AI**: OpenRouter API (proxies OpenAI text-embedding-3-small for embeddings, GPT-4o for analysis)
- **Photo Tools**: face-api.js (browser-based face detection) + browser-image-compression
- **UI Components**: shadcn/ui with base-maia style preset
- **Styling**: Tailwind CSS v4
- **Fonts**: Outfit (primary), Geist, Geist Mono
- **Deployment**: Vercel (frontend) + Convex Cloud (backend)

### Key Architecture Patterns

**Provider Hierarchy** (app/layout.tsx):
```
ClerkProvider
  └─ ConvexClientProvider (Convex + Clerk integration)
      └─ Header
      └─ children (page content)
```

**Authentication Flow**:
- Clerk middleware protects routes in `proxy.ts` (`/onboarding`, `/dashboard`, `/admin`)
- Unauthenticated users trying to access protected routes are redirected to Clerk sign-in
- ConvexClientProvider bridges Clerk auth with Convex backend
- Convex functions access user identity via `ctx.auth.getUserIdentity()`
- JWT issuer domain configured in `convex/auth.config.ts`

**Route Structure**:
- `/` - Public landing page (shows LandingPage component, redirects authenticated users to `/dashboard`)
- `/dashboard` - Protected dashboard (requires authentication via Clerk middleware)
- `/onboarding` - Protected onboarding wizard (requires authentication, redirects to `/dashboard` after completion)
- `/admin` - Protected admin dashboard (requires authentication + admin flag in database)
  - `/admin` - Platform overview with metrics
  - `/admin/photo-review` - Two-step photo review queue (PRIMARY ADMIN TASK)
  - `/admin/users` - User management and search
  - `/admin/analytics` - Deep analytics and reporting
- Route protection handled by Clerk middleware in `proxy.ts`, not Convex auth wrappers
- Admin access controlled by `isAdmin` boolean field in users table

**Convex Functions**:
- **Queries**: Read-only database operations (e.g., `api.users.getCurrentUser`)
- **Mutations**: Write operations to database (e.g., `api.users.generateUploadUrl`)
- **Actions**: Can use external APIs via `fetch()` (e.g., `api.users.createUser` calls OpenRouter for embeddings)
- **Internal Mutations/Queries**: Private functions called only by actions (e.g., `internal.users.internalCreateUser`)
- **Scheduled Functions**: Cron jobs (e.g., Sunday 11pm weekly matching batch)
- All functions must export from `convex/_generated/server`
- Use validators from `convex/values` for type-safe arguments
- Access in components via `useQuery(api.file.function)`, `useMutation(api.file.function)`, and `useAction(api.file.function)`
- **Important**: Mutations/Queries cannot use `fetch()` - use actions instead

**Weekly Matching Algorithm** (Sunday 11pm scheduled function):
Implemented as batched Convex actions for scalability. Processes users in batches of 50 to prevent timeouts.

**Architecture**:
- **Actions**: Orchestrate process, perform vector search, make LLM calls to OpenRouter
- **Queries**: Load user batches, filter candidates by match history
- **Mutations**: Save matches to database
- **Batching**: Recursive scheduling via `ctx.scheduler.runAfter()` chains batches together

**Critical Constraints**:
- **One match per week per user** (enforced via in-batch Set tracking)
- **Pass history respected**: If either person passed before, they will NEVER be matched again
- **Never match same pair twice** (compound index validation in both directions)

**6-Stage Pipeline** (per user):
1. **Vector Search** (Action): `ctx.vectorSearch()` finds top 256 similar users by embedding cosine similarity. **100x faster than manual calculation, scales to thousands**
2. **Fast Filter** (Query): Load full documents, filter by photoStatus='approved', vacationMode=false, match/pass history
3. **Deep Analysis** (Action): GPT-4 analyzes top 20 filtered candidates for compatibility (0-100 score + explanation)
4. **Validation** (Query): Check attractiveness ±2, compatibility ≥70, pass history in both directions
5. **Package** (Action): Generate conversation starters + venue suggestion via LLM
6. **Save** (Mutation): Write match record to weeklyMatches table

**Pass History Tracking**:
- Checks both `by_user_and_match` and `by_match_and_user` indexes
- If `userResponse="passed"` OR `matchResponse="passed"` → Never re-match
- Respects user preferences and improves algorithm over time

**Progressive Disclosure Pattern**:
- Before mutual match: Show compatibility score + explanation + full profiles
- **Hidden until mutual match**: Conversation starters + suggested venue
- This prevents venue bias and focuses decision on compatibility

**Match Display & Response Flow** (`/dashboard`):
- Queries `getCurrentMatch` to get current week's match (checks both user and matchUser directions)
- Displays different states based on user status:
  - `photoStatus = "pending"` → "Profile Under Review" message
  - `photoStatus = "rejected"` → "Photo Needs Update" with rejection reason
  - No match found → "No Match This Week" message
  - Active match → Full match card with response buttons
- **Response Handling**:
  - "I'm Interested" button → Updates `userResponse` or `matchResponse` (based on direction)
  - "Pass" button → Shows optional feedback form with 6 categories
  - Responses trigger mutual match detection (both = "interested" → `mutualMatch = true`)
- **Mutual Match Reveal**:
  - Conversation starters (array of 3) revealed
  - Suggested venue (name, address, placeId, description) revealed
  - Celebration message displayed
- All photo storage IDs converted to URLs via `ctx.storage.getUrl()` in queries

### File Structure

```
app/
  ├─ layout.tsx              # Root layout with providers
  ├─ page.tsx                # Public landing page
  ├─ dashboard/
  │   └─ page.tsx            # Match display dashboard (shows current week's match)
  ├─ admin/
  │   ├─ layout.tsx          # Admin layout with navigation
  │   ├─ AdminNav.tsx        # Admin tab navigation component
  │   ├─ page.tsx            # Platform overview (Tab 1)
  │   ├─ photo-review/
  │   │   └─ page.tsx        # Two-step photo review queue (Tab 2)
  │   ├─ users/
  │   │   └─ page.tsx        # User management (Tab 3)
  │   └─ analytics/
  │       └─ page.tsx        # Analytics deep dive (Tab 4)
  ├─ (auth)/
  │   ├─ layout.tsx          # Auth layout wrapper
  │   └─ onboarding/
  │       ├─ page.tsx        # Onboarding orchestrator
  │       ├─ ProfileStep.tsx # Step 1: Basic info
  │       ├─ BioStep.tsx     # Step 2: Bio and looking for
  │       ├─ InterestsStep.tsx # Step 3: Interest selection
  │       ├─ PhotoStep.tsx   # Step 4: Photo upload
  │       └─ StepWrapper.tsx # Reusable step wrapper
  └─ globals.css             # Global styles

components/
  ├─ ConvexClientProvider.tsx  # Convex + Clerk integration
  ├─ header.tsx               # Navigation with auth buttons
  ├─ landing-page.tsx         # Main landing page component
  ├─ match/
  │   ├─ MatchCard.tsx        # Match profile display with response buttons
  │   └─ PassFeedbackForm.tsx # Optional pass feedback (6 categories)
  └─ ui/                      # shadcn/ui components (dialog, textarea, card, etc.)

convex/
  ├─ auth.config.ts     # Clerk JWT configuration
  ├─ schema.ts          # Database schema (4 tables: users, weeklyMatches, passReasons, dateOutcomes)
  ├─ crons.ts           # Scheduled jobs (weekly matching on Sunday 11pm)
  ├─ users.ts           # User CRUD operations + admin functions
  ├─ admin.ts           # Admin-specific functions (photo review, metrics)
  ├─ matching.ts        # Batched matching algorithm (actions, queries, mutations)
  ├─ matches.ts         # Match display queries and response mutations
  ├─ lib/
  │   ├─ openrouter.ts  # OpenRouter API integration
  │   ├─ matching.ts    # Matching helpers (compatibility analysis, conversation starters)
  │   └─ cosine.ts      # Vector similarity calculations (legacy - now uses native vector search)
  └─ _generated/        # Auto-generated Convex types

lib/
  ├─ utils.ts          # Utility functions (cn, date helpers)
  └─ constants.ts      # App constants (INTERESTS, PASS_REASONS, GENDERS, COUNTRIES, etc.)

proxy.ts                # Clerk middleware for route protection
```

### Import Aliases
TypeScript path aliases configured in `tsconfig.json`:
- `@/` → Root directory
- Use: `import { cn } from "@/lib/utils"`

### Database Schema (Core Tables)

**users**:
- **Authentication**: `clerkId`, `email`
- **Profile**: `name`, `age`, `gender`, `location`, `bio` (500-1000 words), `lookingFor`, `interests` (array)
- **Photo & Review**:
  - `photoStorageId` (optional - Convex storage ID, converted to URL via `ctx.storage.getUrl()` in queries)
  - `photoStatus` ('pending' | 'approved' | 'rejected')
  - `attractivenessRating` (optional, 1-10, **NEVER exposed to users**, encrypted at rest)
  - `photoRejectionReason` (optional string - guidance for rejected photos)
  - `photoResubmissionCount` (number - tracks resubmissions)
- **AI Matching**: `embedding` (optional, 1536 float64 values from OpenAI text-embedding-3-small)
- **State**: `vacationMode` (boolean), `vacationUntil` (optional timestamp)
- **Admin**: `isAdmin` (boolean, grants access to `/admin` dashboard)
- **Timestamps**: `createdAt`, `updatedAt`
- **Indexes**: `by_clerk_id`, `by_email`, `by_photo_status`, `by_vacation`
- **Vector Search Index**: `by_embedding` (vectorField: "embedding", dimensions: 1536, filterFields: ["photoStatus", "vacationMode", "gender"])

**weeklyMatches**:
- **Match Participants**: `userId`, `matchUserId`, `weekOf` (string, e.g., '2024-12-16')
- **AI Analysis**:
  - `compatibilityScore` (number, 0-100)
  - `explanation` (string, 2-3 warm paragraphs)
  - `conversationStarters` (array of 3 strings)
- **Venue**: `suggestedVenue` (object with name, address, placeId, description)
- **Responses**:
  - `userResponse`, `matchResponse` ('pending' | 'interested' | 'passed')
  - `userRespondedAt`, `matchRespondedAt` (optional timestamps)
- **Status**:
  - `mutualMatch` (boolean - both interested)
  - `status` ('sent' | 'expired' | 'completed')
- **Scheduling**:
  - `dateScheduled` (boolean)
  - `dateScheduledFor` (optional timestamp)
- **Timestamps**: `sentAt`, `expiresAt` (Friday 11:59pm)
- **Indexes**: `by_user_and_match`, `by_match_and_user` (prevent duplicate matches), `by_user`, `by_week`, `by_user_and_week`, `by_match_user_and_week`

**passReasons**:
- **Fields**: `userId`, `matchId`, `matchUserId`, `weekOf`
- **Reason**: 7 categories ('too_far' | 'lifestyle' | 'attraction' | 'profile' | 'dealbreaker' | 'no_chemistry' | 'skipped')
- **Timestamp**: `providedAt`
- **Purpose**: Algorithm improvement and user preference learning
- **Indexes**: `by_user`, `by_match`, `by_reason`

**dateOutcomes**:
- **CRITICAL for algorithm validation**: Post-date feedback
- **Relational**: `matchId`, `userId`, `matchUserId`, `weekOf`
- **Core Feedback**:
  - `dateHappened` ('yes' | 'cancelled_by_them' | 'cancelled_by_me' | 'rescheduled')
  - `overallRating` (optional, 1-5 stars)
  - `wouldMeetAgain` (optional: 'yes' | 'maybe' | 'no')
- **Quality Metrics**:
  - `wentWell` (optional array - positive aspects)
  - `wentPoorly` (optional array - negative aspects)
- **Feature Feedback**:
  - `conversationStartersHelpful` (optional: 'very' | 'somewhat' | 'not_used' | 'not_helpful')
  - `venueRating` (optional: 'perfect' | 'good' | 'okay' | 'not_good' | 'went_elsewhere')
- **Additional**: `additionalThoughts` (optional string), `providedAt` (timestamp), `feedbackProvided` (boolean)
- **Indexes**: `by_match`, `by_user`, `by_date_happened`, `by_would_meet_again`

### Environment Variables
Required in `.env.local`:
```
CONVEX_DEPLOYMENT=                      # Convex deployment ID
NEXT_PUBLIC_CONVEX_URL=                 # Public Convex URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=      # Clerk public key
CLERK_SECRET_KEY=                       # Clerk secret key
CLERK_JWT_ISSUER_DOMAIN=                # Clerk JWT issuer for Convex
OPENROUTER_API_KEY=                     # OpenRouter API key (for embeddings + GPT-4)
EMBEDDING_MODEL=                        # Optional: OpenAI embedding model (default: openai/text-embedding-3-small)
RESEND_API_KEY=                         # Resend email API key
GOOGLE_PLACES_API_KEY=                  # Google Places API (venue selection)
```

## UI Development

**shadcn/ui Configuration**:
- Style preset: `base-maia`
- Components installed in `components/ui/`
- Add components: `npx shadcn@latest add [component]`
- Icon library: lucide-react

**Utility Functions**:
- `cn()`: Merge Tailwind classes with conflict resolution
- `getWeekOfString()`: Get current week's Monday as ISO string
- `getMondayMorning9am()`: Next Monday 9am timestamp
- `getFridayMidnight()`: Current Friday midnight timestamp

## Critical Business Rules

### Photo Review & Ratings
- **Two-step process**:
  1. **Step 1: Approve/Reject Decision** - Admin decides if photo meets quality standards (keyboard shortcuts: A = approve, R = reject)
  2. **Step 2: Attractiveness Rating** - If approved, admin rates 1-10 on attractiveness scale (keyboard shortcuts: 1-9, 0 for 10)
- Rejection does NOT require rating - admin selects from 8 rejection reasons and provides optional guidance
- **Attractiveness ratings are PRIVATE**: Never exposed to users via any API, encrypted at rest
- Used only for ±2 compatibility matching (user rated 8 matches with 6-10 range)
- 8 rejection reasons: poor quality, face obscured, group photo, inappropriate, heavily filtered, poor lighting, face not visible, other

### Matching Constraints
- **One match per week per user** (strictly enforced via in-batch Set tracking)
- **Never match same pair twice** (compound index validation in both directions)
- **Pass history respected**: If either person passed previously, they will NEVER be matched again
- Compatibility threshold: Score ≥70 required
- Attractiveness compatibility: Within ±2 points
- Users with `vacationMode=true` excluded from matching
- Only users with `photoStatus='approved'` participate
- Batched processing: 50 users per batch to prevent timeouts and scale to thousands

**Testing the matching algorithm**:
- Manual trigger: Run `internal.matching.testMatchingAlgorithm` in Convex dashboard
- Processes small batch (5 users) for testing
- Production: Runs automatically every Sunday at 11pm UTC via cron job

### Response Deadlines
- Match sent: Monday 9am
- Response deadline: Friday 11:59pm
- Post-deadline responses rejected
- If both pass: No contact info shared, wait for next Monday

### Email Templates (10+ types required)
All built with React Email + Resend:
1. Account submitted for review confirmation
2. Account approved - profile is live
3. Account rejected with reason + guidance
4. Weekly match delivery (Monday 9am)
5. Mutual match celebration (both interested)
6. Match passed notification
7. Date confirmation with calendar invite
8. Date reminder (24 hours before)
9. Post-date feedback request (24 hours after)
10. Mutual second-date interest (contact info sharing)
11. Missed match reminder (Saturday if no response)

### Admin Dashboard (/admin)
Protected route (Clerk authentication + `isAdmin=true` required). Four tabs with auto-refresh every 30 seconds:

**Tab 1: Platform Overview** (`/admin`)
- User growth, photo queue status (alerts if >50 pending), matching performance
- **Critical metrics**: Date completion rate (≥80%), mutual interest rate (≥30%), second date request rate
- Alert system for issues: mutual interest <20%, photo queue >50, completion rate <70%
- Metrics displayed: Total users, pending photos, approval rate, average rating (admin only)

**Tab 2: Photo Review Queue** (`/admin/photo-review`) - **PRIMARY ADMIN TASK**
- **Two-step workflow**:
  1. **Decision Step**: Approve (A key) or Reject (R key)
  2. **Rating Step**: If approved, rate 1-10 attractiveness (1-9 keys, 0 for 10)
- **Rejection flow**: Select from 8 reasons + optional guidance for user → Photo status set to 'rejected'
- **Approval flow**: Rate attractiveness → Photo status set to 'approved' with rating stored
- Keyboard navigation for efficiency (A/R for decision, 1-0 for rating)
- Displays photo with user profile info (name, age, gender, location, bio snippet)
- Goal: Review within 24 hours of submission

**Tab 3: User Management** (`/admin/users`)
- Search users, view profiles, manual actions (re-rate photo, vacation mode)
- View match history and feedback patterns

**Tab 4: Analytics Deep Dive** (`/admin/analytics`)
- Charts: User growth, pass reasons, mutual match trends, compatibility vs outcome correlation
- Cohort analysis, CSV export, time range selector (7d/30d/90d/all)

## Development Notes

- The app uses Next.js App Router (not Pages Router)
- All client components must have `"use client"` directive
- Convex functions are server-side only and type-safe
- Clerk authentication state is managed globally via providers
- shadcn/ui components are customizable and located in `components/ui/`
- **Route Protection**: Handled by Clerk middleware in `proxy.ts`, not Convex auth wrappers
- **User Creation**: Uses Convex actions (not mutations) because embedding generation requires `fetch()` to OpenRouter API
- **Vector Search**: Only available in Convex actions (not queries/mutations), returns `Array<{_id, _score}>`
- **Batched Processing**: Critical for scaling - processes 50 users per batch, chains batches via scheduler
- **Cost per user per week**: ~$0.03 (OpenRouter embeddings + GPT-4 + Google Places)
- **Target metrics**: 30%+ mutual interest rate (both want second date), 80%+ date completion rate

### Convex Storage Pattern
Photo management follows a consistent storage ID → URL conversion pattern:

**Storage (Write)**:
```typescript
// Store only the storage ID in database
const uploadUrl = await generateUploadUrl();
const result = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": photo.type },
  body: photo,
});
const { storageId } = await result.json();

await ctx.db.insert("users", {
  photoStorageId: storageId,  // Store ID, not URL
  // ... other fields
});
```

**Retrieval (Read)**:
```typescript
// Convert storage ID to URL in queries
const users = await ctx.db.query("users").collect();
const usersWithUrls = await Promise.all(
  users.map(async (user) => ({
    ...user,
    photoUrl: user.photoStorageId
      ? await ctx.storage.getUrl(user.photoStorageId)
      : null,
  }))
);
```

**Why this pattern?**:
- Storage IDs are permanent references (e.g., `kg282te5bctnsvzj644af8k4x97y06y0`)
- URLs are temporary and expire (contain time-limited tokens)
- Always store IDs in database, convert to URLs in queries for display
- Field naming: `photoStorageId` in schema, `photoUrl` in query results

### Admin Access Setup

To grant admin access to a user:

1. **Using Convex Dashboard**:
   - Navigate to your Convex dashboard → Data → users table
   - Find the user by `clerkId` or `email`
   - Edit the user and set `isAdmin: true`

2. **Using Convex Function** (recommended for automation):
   ```typescript
   // In Convex dashboard or via mutation call
   await ctx.runMutation(api.users.makeUserAdmin, {
     userId: ctx.db.normalizeId("users", "user_id_here")
   });
   ```

3. **Verification**:
   - Log in as the user
   - Navigate to `/admin` - should see admin dashboard
   - If access denied, verify `isAdmin` field is `true` in database

**Security Notes**:
- Admin routes protected by Clerk middleware + `isAdmin` flag check
- Admin functions (`convex/admin.ts`) should verify admin status in handler
- Never expose admin functions to non-admin users via API
- Attractiveness ratings NEVER exposed to end users (admin dashboard only)
