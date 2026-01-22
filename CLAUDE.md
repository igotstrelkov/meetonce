# CLAUDE.md

## Project Overview

MeetOnce is an AI-powered dating platform delivering **one curated match per week**. Uses OpenAI embeddings + GPT-4 for semantic matching combined with manual photo rating.

### Key User Flow

1. Sign up → `/onboarding` (5 steps: Profile, Bio Voice, Preferences Voice, Photo, Document)
2. Admin reviews in `/admin/user-review`: 3-step process (Approve/Reject → Rate 1-10 → Waitlist or Approve)
3. Status on `/dashboard`: pending (review), waitlisted (awaiting activation), approved (active), rejected (resubmit)
4. Sunday 11pm: Weekly matching → Emails sent to both users
5. Users respond by Friday 11:59pm → Mutual match enables real-time chat
6. Post-date feedback tracks PRIMARY METRIC: ≥30% mutual second-date interest

## Development Commands

```bash
npm run dev          # Start dev server http://localhost:3000
npm run build        # Build for production
npx convex dev       # Run Convex backend in dev mode
npx convex deploy    # Deploy Convex functions
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Clerk
- **Backend/DB**: Convex (serverless DB + functions + file storage)
- **Email**: Resend + React Email
- **AI**: OpenRouter (text-embedding-3-small, GPT-4o)
- **Voice**: Vapi (AI voice agents)
- **UI**: shadcn/ui (base-maia preset), Tailwind CSS v4

## Route Structure

- `/` - Landing page (redirects authenticated → `/dashboard`)
- `/dashboard` - Match display (status-specific UI for pending/waitlisted/rejected/approved)
- `/onboarding` - 5-step wizard; `/onboarding/resubmit` for rejected users
- `/chat/[matchId]` - Real-time chat (mutual matches only, until Friday 11:59pm)
- `/admin` - Overview + waitlist management
- `/admin/user-review` - 3-step review queue (PRIMARY ADMIN TASK)
- `/admin/matches` - All matches with filters
- `/admin/analytics` - Metrics + PRIMARY SUCCESS METRIC

## File Structure

```
app/
  ├─ layout.tsx, page.tsx, globals.css, not-found.tsx
  └─ (auth)/
      ├─ dashboard/
      │   ├─ layout.tsx, page.tsx, ThisWeek.tsx, PastMatches.tsx
      │   ├─ FeedbackForm.tsx, FeedbackContent.tsx
      ├─ onboarding/
      │   ├─ page.tsx, ProfileStep.tsx, BioVoiceStep.tsx
      │   ├─ PreferencesVoiceStep.tsx, PhotoStep.tsx, DocumentStep.tsx
      │   └─ resubmit/page.tsx
      ├─ chat/[matchId]/page.tsx
      └─ admin/
          ├─ layout.tsx, AdminNav.tsx, page.tsx
          ├─ user-review/page.tsx
          ├─ matches/page.tsx, MatchDetailsModal.tsx
          └─ analytics/page.tsx

components/
  ├─ ConvexClientProvider.tsx, NavBar.tsx, LandingPage.tsx
  ├─ LoadingSpinner.tsx, Elevenlabs.tsx
  ├─ voice/ (VoiceInterviewCard, VoiceControls, VoiceStateIndicator, VoiceWaveform)
  ├─ match/ (MatchCard, MatchDrawer, StatusCard, DimensionalScores, PassFeedbackForm, ChatInterface, ChatHeader, MessageList, MessageInput)
  └─ ui/ (shadcn components)

convex/
  ├─ schema.ts, auth.config.ts, crons.ts
  ├─ users.ts, admin.ts, matching.ts, matches.ts
  ├─ chat.ts, feedback.ts, emails.ts, voice.ts, seed.ts
  └─ lib/ (openrouter.ts, vapi.ts, matching.ts, utils.ts)

emails/ (MutualMatch, NewMessage, PhotoApproved, PhotoRejected, SecondDateContact, Waitlist, WeeklyMatch)
hooks/ (useVapiCall.ts, useMatchInteraction.ts)
lib/ (utils.ts, constants.ts)
proxy.ts (Clerk middleware)
```

## Convex Functions

- **Queries**: Read-only (`useQuery(api.file.function)`)
- **Mutations**: Write operations (`useMutation(api.file.function)`)
- **Actions**: External APIs via `fetch()` (`useAction(api.file.function)`)

### When to Use Actions vs Mutations

Actions are **only** needed when you need:
- `fetch()` for external API calls
- `ctx.vectorSearch()` for vector search
- `ctx.runAction()` to call other actions

**Prefer mutations** when you only need database access + auth (`ctx.auth.getUserIdentity()` works in mutations). Mutations are faster (no extra round trip) and simpler.

### Key Admin Functions (`convex/admin.ts`)

- `getPendingUsers`, `getWaitlistedUsers` - Query users by status
- `waitlistUser` - Add to waitlist with rating → sends waitlist email
- `approveUser` - Approve from waitlist → sends approval email
- `rejectUser` - Reject with reason → sends rejection email

### Email Functions (`convex/emails.ts`)

- `sendWaitlistEmail`, `sendUserApprovedEmail`, `sendUserRejectedEmail`
- `sendWeeklyMatchEmail`, `sendMutualMatchEmail`, `sendSecondDateContactEmail`
- `sendNewMessageEmail` (rate-limited: 1 per 24hrs per match)
- `sendUserFeedback` (public action for NavBar feedback)

## Database Schema

**users**: clerkId, email, name, age, gender, location, bio, lookingFor, interests[], photoStorageId, accountStatus (`pending|waitlisted|approved|rejected`), attractivenessRating (1-10, PRIVATE), embedding (1536 floats), vacationMode, isAdmin

**weeklyMatches**: userId, matchUserId, weekOf, compatibilityScore (0-100), explanation, dimensionScores {values, lifestyle, interests, communication, relationshipVision}, redFlags[], userResponse/matchResponse (`pending|interested|passed`), mutualMatch, status

**messages**: matchId, senderId, receiverId, content (max 1000), sentAt, readAt, flagged

**passReasons**: userId, matchId, reason (7 categories)

**dateOutcomes**: matchId, userId, dateHappened, overallRating (1-5), wouldMeetAgain (`yes|maybe|no` - PRIMARY METRIC)

## Weekly Matching Algorithm (Sunday 11pm)

7-stage pipeline per user:

1. **Vector Search**: `ctx.vectorSearch()` finds top 256 similar users
2. **Fast Filter**: accountStatus='approved', vacationMode=false, no past matches/passes
3. **Deep Analysis**: GPT-4 dimensional scoring (5 dimensions, 0-100 total, red flags)
4. **Validation**: attractiveness ±2, compatibility ≥70
5. **Package**: Generate venue suggestion
6. **Save**: Write match with dimensional scores
7. **Notify**: Email both users

**Constraints**: One match/week/user, never re-match same pair, pass history respected

## Critical Business Rules

### Account Status Flow

```
pending → waitlisted → approved  (standard)
pending → rejected               (rejection)
```

### User Review (3-step)

1. Waitlist/Reject decision
2. If waitlisted: Rate 1-10 attractiveness (PRIVATE, ±2 matching)
3. Choose: Add to waitlist or Reject

### Matching Rules

- Compatibility ≥70 required
- Attractiveness within ±2 points
- Pass history = never re-match
- Only `accountStatus='approved'` users participate

### Response Timeline

- Match sent: Monday 9am
- Response deadline: Friday 11:59pm
- Chat active until Friday 11:59pm

## Environment Variables

```
CONVEX_DEPLOYMENT, NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_JWT_ISSUER_DOMAIN
OPENROUTER_API_KEY, RESEND_API_KEY
NEXT_PUBLIC_APP_URL, GOOGLE_PLACES_API_KEY
NEXT_PUBLIC_VAPI_BIO_ASSISTANT_ID, NEXT_PUBLIC_VAPI_PREFERENCES_ASSISTANT_ID, NEXT_PUBLIC_VAPI_PUBLIC_KEY
```

## Development Notes

- Next.js App Router - all client components need `"use client"`
- Route protection: Clerk middleware in `proxy.ts`
- Admin access: `isAdmin=true` in users table
- Photo storage: Store `photoStorageId`, convert to URL via `ctx.storage.getUrl()` in queries
- Vector search: Only in actions, returns `Array<{_id, _score}>`
- Batched processing: 50 users/batch via `ctx.scheduler.runAfter()`

### shadcn/ui

- Style preset: `base-maia`
- Add components: `npx shadcn@latest add [component]`
- Icon library: lucide-react

### Email Configuration

- From: `MeetOnce <admin@meetonce.co>`
- Verify domain in Resend dashboard for production
