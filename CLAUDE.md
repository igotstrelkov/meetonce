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
1. User creates profile with single photo + detailed bio (500-1000 words)
2. Admin manually reviews and rates photo (1-10 scale) + approves/rejects
3. Sunday 11pm: Weekly batch matching runs (6-stage AI pipeline)
4. Monday 9am: Users receive one curated match via email
5. Users respond "Interested" or "Pass" by Friday 11:59pm
6. If mutual match: Receive conversation starters + suggested venue + schedule date
7. Post-date feedback (8 questions) determines algorithm success

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
- **AI**: OpenAI (text-embedding-3-small for matching, GPT-4o for analysis)
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
- Clerk handles user authentication on the frontend
- ConvexClientProvider bridges Clerk auth with Convex backend
- Convex functions access user identity via `ctx.auth.getUserIdentity()`
- JWT issuer domain configured in `convex/auth.config.ts`

**Convex Functions**:
- **Queries**: Read-only database operations (e.g., `convex/messages.tsx`)
- **Mutations**: Write operations to database
- **Scheduled Functions**: Cron jobs (e.g., Sunday 11pm weekly matching batch)
- All functions must export from `convex/_generated/server`
- Use validators from `convex/values` for type-safe arguments
- Access in components via `useQuery(api.file.function)` and `useMutation(api.file.function)`

**Weekly Matching Algorithm** (Sunday 11pm scheduled function):
Critical constraint: **One match per week per user** enforced via in-memory Set tracking.

6-Stage Pipeline:
1. **Fast Filter**: Embeddings similarity → top 100 candidates (filter out already-matched users)
2. **Deep Analysis**: GPT-4 analyzes top 20 filtered candidates
3. **Validation**: Match history check (never matched before) + compatibility ≥70 + attractiveness ±2
4. **Selection**: Choose #1 highest scoring valid match
5. **Package**: Generate explanation, conversation starters, venue (Google Places API for midpoint café)
6. **Schedule**: Queue for Monday 9am email delivery

**Progressive Disclosure Pattern**:
- Before mutual match: Show compatibility score + explanation + full profiles
- **Hidden until mutual match**: Conversation starters + suggested venue
- This prevents venue bias and focuses decision on compatibility

### File Structure

```
app/
  ├─ layout.tsx        # Root layout with providers
  ├─ page.tsx          # Landing page
  └─ globals.css       # Global styles

components/
  ├─ ConvexClientProvider.tsx  # Convex + Clerk integration
  ├─ header.tsx               # Navigation with auth buttons
  ├─ landing-page.tsx         # Main landing page component
  └─ ui/                      # shadcn/ui components

convex/
  ├─ auth.config.ts     # Clerk JWT configuration
  ├─ messages.tsx       # Example query functions
  └─ _generated/        # Auto-generated Convex types

lib/
  ├─ utils.ts          # Utility functions (cn, date helpers)
  └─ constants.ts      # App constants (INTERESTS, PASS_REASONS, etc.)
```

### Import Aliases
TypeScript path aliases configured in `tsconfig.json`:
- `@/` → Root directory
- Use: `import { cn } from "@/lib/utils"`

### Database Schema (Core Tables)

**users**:
- Profile data: `clerkId`, `email`, `name`, `age`, `gender`, `location`, `bio` (500-1000 words)
- Photo: `photoUrl` (Convex storage), `photoStatus` ('pending' | 'approved' | 'rejected')
- Rating: `attractivenessRating` (1-10, **NEVER exposed to users**, encrypted at rest)
- AI: `embedding` (1536 floats from OpenAI text-embedding-3-small)
- State: `vacationMode`, `vacationUntil`

**weeklyMatches**:
- Match pair: `userId`, `matchUserId`, `weekOf` (e.g., '2024-12-16')
- AI content: `compatibilityScore` (0-100), `explanation`, `conversationStarters` (array), `suggestedVenue` (object)
- Responses: `userResponse`, `matchResponse` ('pending' | 'interested' | 'passed')
- State: `mutualMatch` (boolean), `status` ('sent' | 'expired' | 'completed')
- Timestamps: `sentAt`, `expiresAt` (Friday 11:59pm), `dateScheduledFor`
- **Critical indexes**: `by_user_and_match`, `by_match_and_user` (prevent duplicate matches)

**passReasons**:
- Feedback: `userId`, `matchId`, `reason` (6 categories: too_far, lifestyle, attraction, profile, dealbreaker, no_chemistry)
- Used for algorithm improvement

**dateOutcomes**:
- **CRITICAL for algorithm validation**: Post-date feedback
- Key fields: `dateHappened`, `wouldMeetAgain` ('yes' | 'maybe' | 'no'), `overallRating` (1-5 stars)
- Quality metrics: `wentWell` (array), `wentPoorly` (array), `conversationStartersHelpful`, `venueRating`

### Environment Variables
Required in `.env.local`:
```
CONVEX_DEPLOYMENT=                      # Convex deployment ID
NEXT_PUBLIC_CONVEX_URL=                 # Public Convex URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=      # Clerk public key
CLERK_SECRET_KEY=                       # Clerk secret key
CLERK_JWT_ISSUER_DOMAIN=                # Clerk JWT issuer for Convex
OPENAI_API_KEY=                         # OpenAI API key (for embeddings + GPT-4)
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
- **Two-step process**: Rate attractiveness (1-10) → Approve/Reject
- Rating does NOT equal approval (can rate '4' and still approve if photo is appropriate)
- **Attractiveness ratings are PRIVATE**: Never exposed to users via any API, encrypted at rest
- Used only for ±2 compatibility matching (user rated 8 matches with 6-10 range)
- 8 rejection reasons: poor quality, face obscured, group photo, inappropriate, heavily filtered, poor lighting, face not visible, other

### Matching Constraints
- **One match per week per user** (strictly enforced)
- **Never match same pair twice** (compound index validation)
- Compatibility threshold: Score ≥70 required
- Attractiveness compatibility: Within ±2 points
- Users with `vacationMode=true` excluded from matching
- Only users with `photoStatus='approved'` participate

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
Protected route (Clerk authentication required). Four tabs with auto-refresh every 30 seconds:

**Tab 1: Platform Overview**
- User growth, photo queue status (alerts if >50 pending), matching performance
- **Critical metrics**: Date completion rate (≥80%), mutual interest rate (≥30%), second date request rate
- Alert system for issues: mutual interest <20%, photo queue >50, completion rate <70%

**Tab 2: Photo Review Queue** (PRIMARY ADMIN TASK)
- Two-step review: Rate 1-10 → Approve (A key) or Reject (R key)
- Rejection modal: Select reason + optional guidance for user
- Goal: Review within 24 hours of submission

**Tab 3: User Management**
- Search users, view profiles, manual actions (re-rate photo, vacation mode)
- View match history and feedback patterns

**Tab 4: Analytics Deep Dive**
- Charts: User growth, pass reasons, mutual match trends, compatibility vs outcome correlation
- Cohort analysis, CSV export, time range selector (7d/30d/90d/all)

## Development Notes

- The app uses Next.js App Router (not Pages Router)
- All client components must have `"use client"` directive
- Convex functions are server-side only and type-safe
- Clerk authentication state is managed globally via providers
- shadcn/ui components are customizable and located in `components/ui/`
- **Cost per user per week**: ~$0.03 (OpenAI embeddings + GPT-4 + Google Places)
- **Target metrics**: 30%+ mutual interest rate (both want second date), 80%+ date completion rate
