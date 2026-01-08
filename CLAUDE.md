# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MeetOnce is an AI-powered dating platform that eliminates endless swiping by delivering **one carefully curated match per week**. The platform uses semantic matching (OpenAI embeddings + GPT-4) combined with manual photo rating to create high-quality, compatible matches.

### Core Value Proposition

- **No Swiping**: One curated match per week delivered via email
- **Quality Over Quantity**: Deep compatibility analysis, not just photos
- **AI-Powered Matching**: Semantic matching using OpenAI embeddings + GPT-4
- **Premium Concierge**: Platform handles matching and real-time chat
- **Manual Curation**: Every photo and profile reviewed before going live

### Key User Flow

1. User signs up via Clerk authentication → Redirected to `/onboarding`
2. User completes 6-step onboarding wizard:
   - **Step 1**: Profile (name, age, gender, location)
   - **Step 2**: Bio Voice Interview (5-7 min Vapi conversation → GPT-4 processed bio)
   - **Step 3**: Preferences Voice Interview (4-6 min Vapi conversation → GPT-4 processed preferences)
   - **Step 4**: Interests selection
   - **Step 5**: Photo upload (with face detection)
   - **Step 6**: Document verification upload
3. User created in Convex → Redirected to `/dashboard`
4. Admin manually reviews photo in `/admin/photo-review`: **Two-step process** (Approve/Reject decision → Rate 1-10 attractiveness scale)
5. User sees "Profile Under Review" message on `/dashboard` until photo is approved
6. Sunday 11pm: Weekly batch matching runs (6-stage AI pipeline with dimensional scoring) → Emails sent to both users immediately after match creation
7. Users receive match notification email with match preview
8. Users view match on `/dashboard`: See full profile, overall compatibility score (0-100), detailed explanation, **dimensional breakdown** (5 progress bars), and red flags (if any)
9. Users respond "Interested" or "Pass" by Friday 11:59pm (optional pass feedback with 6 categories)
10. If mutual match: "Open Chat" button appears on dashboard → Full-screen real-time chat
11. Users chat to plan their date (chat active until Friday 11:59pm)
12. Post-date feedback (7 questions) determines algorithm success

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
- **Voice Interviews**: Vapi (AI voice agents for bio/preferences collection with real-time transcription)
- **Photo Tools**: ✅ face-api.js (browser-based face detection) + browser-image-compression (implemented)
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
- `/chat/[matchId]` - Protected full-screen chat page (requires mutual match, real-time messaging until Friday 11:59pm)
- `/feedback/[matchId]` - Protected post-date feedback form (7 questions tracking PRIMARY METRIC)
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

**7-Stage Pipeline** (per user):

1. **Vector Search** (Action): `ctx.vectorSearch()` finds top 256 similar users by embedding cosine similarity. **100x faster than manual calculation, scales to thousands**
2. **Fast Filter** (Query): Load full documents, filter by accountStatus='approved', vacationMode=false, match/pass history
3. **Deep Analysis** (Action): GPT-4 analyzes top 20 filtered candidates with **dimensional scoring**:
   - **5 dimensions**: Values (25pts), Lifestyle (25pts), Interests (20pts), Communication (20pts), Relationship Vision (10pts)
   - **Total score**: 0-100 (sum of dimensions)
   - **Red flags**: 0-3 potential compatibility risks identified
   - **Calibration examples**: LLM trained with score=92 (exceptional), 76 (good), 63 (below threshold) examples
   - **Strict scoring**: Score distribution enforced (90-100: <5%, 80-89: ~15%, 70-79: ~30%)
   - **Profile enrichment**: Includes age, location, gender, seeking preferences (not just bio/lookingFor)
4. **Validation** (Query): Check attractiveness ±2, compatibility ≥70, pass history in both directions
5. **Package** (Action): Generate venue suggestion via LLM
6. **Save** (Mutation): Write match record with dimensional scores + red flags to weeklyMatches table
7. **Notify** (Action): Send weekly match emails to **both users** immediately with match preview (name, age, dashboard link)

**Pass History Tracking**:

- Checks both `by_user_and_match` and `by_match_and_user` indexes
- If `userResponse="passed"` OR `matchResponse="passed"` → Never re-match
- Respects user preferences and improves algorithm over time

**Compatibility Analysis System** (`convex/lib/matching.ts`):

The matching algorithm uses an optimized GPT-4 prompt with dimensional scoring to predict real compatibility.

**Profile Formatting** (`formatProfile` function):
- Enriched profile data includes: name, age, location, gender, seeking preferences (with age range)
- Bio: 100-500 words (voice-processed, semantically optimized)
- Looking for: 100-500 words (voice-processed preferences)
- **Note**: Interests array intentionally excluded to avoid over-weighting surface-level matches

**LLM Configuration**:
- Model: GPT-4o via OpenRouter
- Temperature: 0.5 (lower for consistent, less creative scoring)
- Max tokens: 800 (increased for dimensional analysis)
- System message: Professional matchmaker with 15 years experience persona

**Dimensional Scoring Framework**:

1. **Shared Values & Life Philosophy** (0-25 points):
   - Core values alignment, life priorities, worldview, emotional maturity
   - Scoring guide: 20-25 (perfect), 15-19 (strong), 10-14 (notable differences), 5-9 (potential), 0-4 (misalignment)

2. **Lifestyle Compatibility** (0-25 points):
   - Daily routines, energy patterns, social preferences, work-life balance
   - Scoring guide: 20-25 (natural sync), 15-19 (minor adjustments), 10-14 (compromise), 5-9 (major adjustments), 0-4 (incompatible)

3. **Interests & Connection Points** (0-20 points):
   - Shared hobbies, complementary interests, cultural alignment
   - Scoring guide: 16-20 (multiple passions), 11-15 (2-3 shared), 6-10 (some overlap), 0-5 (limited)

4. **Communication & Emotional Style** (0-20 points):
   - Conflict resolution, emotional expression, vulnerability comfort
   - Scoring guide: 16-20 (aligned), 11-15 (complementary), 6-10 (manageable gaps), 0-5 (incompatible)

5. **Relationship Vision & Goals** (0-10 points):
   - Timeline alignment, future goals (kids/marriage/location)
   - Scoring guide: 8-10 (identical), 5-7 (minor differences), 0-4 (misaligned)

**Score Distribution Reality Check**:
- 90-100 (Exceptional): <5% of matches - rare, multi-dimensional alignment
- 80-89 (Excellent): ~15% of matches - strong compatibility with minor differences
- 70-79 (Good): ~30% of matches - solid foundation, meaningful compromise needed
- 60-69 (Moderate): ~35% of matches - potential with significant differences
- <60 (Low): ~15% of matches - fundamental misalignments (not sent to users)

**Red Flag Detection**:
- Life stage misalignment: -15 points
- Incompatible daily rhythms (night owl + early riser): -10 points
- Family timeline conflict (wants kids vs unsure): -15 points
- Availability mismatch (80hr weeks + needs quality time): -10 points
- Opposite social energy (extreme introvert + extrovert): -10 points
- Location distance (different cities, no plans): -20 points
- Values contradiction (career-focused + work-life balance): -10 points
- Age gap >10 years with different life stages: -10 points

**Calibration Examples**:
- Score 92: 28F engineer SF + 30M designer SF, yoga/climbing, jazz/saxophone, kids 3-5yr, therapy advocates
- Score 76: 25F night owl + 32M early riser, different life stages, timeline misalignment
- Score 63: 29M 80hr workaholic + 31F work-life balance seeker, incompatible energy

**Explanation Quality Requirements**:
- Must reference specific details from profiles (actual hobbies, places, values)
- Must cite age and location when relevant
- Must name 2-3 concrete shared interests
- Must address main friction point if score <85
- Prohibited: Generic phrases ("you both enjoy life", "communication is key")
- Format: 2-3 paragraphs (150-250 words) with warm but honest tone

**Benefits**:
- **More discriminating scores**: Reduced score inflation (fewer 85-95, more 70-80)
- **Better calibration**: Stricter rubrics aligned with research on relationship success
- **Transparency**: Users see dimensional breakdown, understand *why* compatible
- **Red flag honesty**: Users informed of potential friction points constructively
- **Improved accuracy**: Profile enrichment + calibration examples → better predictions

**Progressive Disclosure Pattern**:

- Before mutual match: Show compatibility score + explanation + full profiles
- **Hidden until mutual match**: Real-time chat
- This focuses decision on compatibility, then enables direct communication to plan the date

**Voice Interview System** (Steps 2-3 of onboarding):

**Architecture**:

- **Client**: @vapi-ai/web SDK integrated via custom `useVapiCall` hook
- **Server**: Convex actions for transcript processing via GPT-4o
- **Visualization**: Real-time audio waveform with agent speaking detection
- **Processing**: Raw transcript → GPT-4o optimization → semantic-rich bio/preferences

**Two-Stage Interview Flow**:

1. **Bio Interview (Step 2)** - 5-7 minutes
   - Vapi assistant conducts conversational interview
   - Topics: Work, lifestyle, hobbies, personality, values, unique details
   - Goal: Extract 8-10 specific semantic keywords (activities, places, interests)
   - Output: 100-500 word bio optimized for vector matching

2. **Preferences Interview (Step 3)** - 4-6 minutes
   - Vapi assistant explores ideal partner qualities
   - Topics: Core values, lifestyle compatibility, communication style, relationship vision, deal-breakers
   - Goal: Extract 6-8 specific traits with behavioral examples
   - Output: 100-500 word preferences optimized for vector matching

**Key Components**:

- **VoiceInterviewCard** (`components/voice/VoiceInterviewCard.tsx`): Main interview orchestrator
  - Manages interview state (idle, recording, processing, complete, error)
  - Handles retry logic with state reset
  - Integrates waveform, controls, and status indicator

- **useVapiCall** (`hooks/useVapiCall.ts`): Custom hook for Vapi SDK
  - Manages Vapi client lifecycle
  - Tracks agent state (idle, connecting, listening, speaking)
  - Collects transcript from message events
  - Handles call start/end, speech start/end events

- **LiveWaveform** (`components/Elevenlabs.tsx`): Real-time audio visualization
  - Visualizes user microphone input during recording
  - Animates when AI agent is speaking (distinct wave patterns)
  - Shows processing state with calm transition waves

- **VoiceControls** (`components/voice/VoiceControls.tsx`): Interview control buttons
  - Start Interview button (idle state)
  - Redo Interview button (complete state)
  - Try Again button (error state)

- **VoiceStateIndicator** (`components/voice/VoiceStateIndicator.tsx`): Status messages
  - Idle: "Ready to start the interview?"
  - Recording: "In progress..." (with animated mic icon)
  - Processing: "Processing your interview..." (with spinner)
  - Complete: "Interview complete! Ready to continue"
  - Error: Custom error message display

**Transcript Processing Pipeline**:

1. **Voice Collection**: Vapi assistant conducts interview, collects raw transcript
2. **Transcript Completion**: useVapiCall hook triggers `onTranscriptComplete` callback
3. **GPT-4 Processing**: Convex action calls OpenRouter with specialized prompts
4. **Validation**: Word count check (100-500 words), retry if out of range
5. **Storage**: Processed text saved to formData state
6. **User Creation**: Final bio/preferences text used for embedding generation

**GPT-4 Processing Prompts**:

- **Bio Prompt**: Converts raw transcript to compelling first-person bio
  - Focus: Specific nouns, observable behaviors, semantic keywords
  - Avoids: Generic traits like "fun", "nice", "love to laugh"
  - Example transformation: "I like music" → "DJ house music at Brooklyn warehouses on weekends"

- **Preferences Prompt**: Converts raw transcript to clear relationship preferences
  - Focus: Specific traits, behavioral examples, relationship dynamics
  - Distinguishes: Must-haves vs nice-to-haves
  - Positive framing: "no drama" → "emotionally mature, handles conflict calmly"

**Vapi Assistant Configuration**:

- **Bio Assistant**: Configured in Vapi dashboard, ID stored in `NEXT_PUBLIC_VAPI_BIO_ASSISTANT_ID`
  - Model: GPT-4o with warm, empathetic system prompt
  - Voice: ElevenLabs Rachel (warm female voice)
  - Interview approach: Conversational, not interrogative
  - Success criteria: 8-10 specific nouns, observable behaviors, unique details

- **Preferences Assistant**: Configured in Vapi dashboard, ID stored in `NEXT_PUBLIC_VAPI_PREFERENCES_ASSISTANT_ID`
  - Model: GPT-4o with thoughtful relationship coach prompt
  - Voice: ElevenLabs Rachel (warm female voice)
  - Interview approach: Non-judgmental, balances idealism with realism
  - Success criteria: 6-8 traits with examples, must-haves distinction, positive framing

**Benefits**:

- **Higher Quality Data**: Voice interviews extract 3-4x more semantic detail than text forms
- **Better Matching**: Specific, differentiated traits enable more accurate vector matching
- **User Experience**: Natural conversation vs tedious form filling
- **Semantic Optimization**: Prompts engineered to generate embedding-friendly text
- **Efficiency**: 10-15 min total vs 30+ min typing detailed bio/preferences

**Real-Time Chat System** (`/chat/[matchId]`):

**Architecture**:

- **Client**: Convex reactive queries with real-time subscriptions
- **Backend**: Convex queries (read messages) and mutations (write messages, mark as read, flag messages)
- **Storage**: messages table with optimized indexes for fast queries
- **Cleanup**: Daily cron job deletes messages from expired matches (>7 days old)

**Chat Flow**:

1. **Mutual Match Detection** - Both users respond "interested"
2. **Chat Activation** - "Open Chat" button appears on match card
3. **Full-Screen Chat** - Routes to `/chat/[matchId]` dedicated page
4. **Real-Time Messaging** - Convex subscriptions for live updates (no polling)
5. **Time-Limited** - Chat active until Friday 11:59pm (match expiry)
6. **Read Receipts** - Messages marked as read when viewing chat
7. **Message Cleanup** - Deleted 7 days after expiry

**Key Components**:

- **ChatInterface** (`components/match/ChatInterface.tsx`): Main orchestrator
  - Manages Convex real-time subscriptions
  - Auto-marks messages as read when viewing
  - Shows expired banner after Friday 11:59pm
  - Full-screen layout (calc(100dvh - 120px))

- **ChatHeader** (`components/match/ChatHeader.tsx`): User info and timer
  - Match user's name and photo
  - Countdown timer to Friday 11:59pm
  - Unread message badge
  - Back button navigation

- **MessageList** (`components/match/MessageList.tsx`): Message display
  - Auto-scroll to bottom on new messages
  - Date separators (Today, Yesterday, date)
  - Read receipts ("Read" indicator)
  - Message bubbles (sender left, current user right)

- **MessageInput** (`components/match/MessageInput.tsx`): Send interface
  - Textarea with 1000 char limit
  - Character counter (red when over limit)
  - Enter to send, Shift+Enter for new line
  - Disabled after expiry

- **ChatExpiredBanner** (`components/match/ChatExpiredBanner.tsx`): Expiry state
  - Shown after Friday 11:59pm
  - Link to post-date feedback form
  - Messages remain read-only for 7 days

**Convex Functions** (`convex/chat.ts`):

1. **getMessages** (query): Load messages with pagination (50 per page)
   - Verifies user is part of match
   - Returns messages with sender info (name, photoUrl)
   - Sorted by sentAt timestamp

2. **getUnreadCount** (query): Count unread messages
   - Counts where receiverId = current user AND readAt = null
   - Displayed in chat header badge

3. **sendMessage** (mutation): Send new message
   - Validates mutual match exists
   - Checks match hasn't expired
   - Validates content (1-1000 chars)
   - Inserts message with sentAt timestamp

4. **markMessagesAsRead** (mutation): Mark as read
   - Updates all unread messages for current user
   - Sets readAt = now

5. **flagMessage** (mutation): Flag inappropriate content
   - Sets flagged = true with reason
   - TODO: Admin notification system

6. **cleanupExpiredMessages** (internalMutation): Daily cleanup
   - Runs at 3 AM UTC daily
   - Deletes messages from matches expired >7 days ago

**Benefits**:

- **Direct Communication**: Users coordinate dates directly (no venue suggestions)
- **Real-Time Experience**: Convex subscriptions enable instant message delivery
- **Privacy**: Messages deleted after 7 days (not permanent)
- **Safety**: Flagging system for inappropriate content
- **Mobile-Optimized**: Full-screen layout with dynamic viewport height

**Post-Date Feedback System** (`/feedback/[matchId]`):

- **PRIMARY METRIC**: "Would you want to see them again?" (yes/maybe/no)
- **7-Question Form**:
  1. Did the date happen? \* (yes/cancelled_by_them/cancelled_by_me/rescheduled)
  2. Overall rating \* (1-5 stars, conditional on date happening)
  3. Would meet again? \* (yes/maybe/no - **THE PRIMARY METRIC**)
  4. What went well? (multi-select: great conversation, lots in common, good chemistry, attractive, funny, genuine)
  5. What didn't go well? (optional multi-select: awkward silences, nothing in common, no chemistry, not as described, late/unreliable, inappropriate behavior)
  6. Venue rating? (perfect/good/okay/not_good/went_elsewhere)
  7. Additional thoughts? (optional text area)
- **Mutual Second-Date Detection**: If both users answer "yes" to Q3, system logs mutual interest (TODO: send contact info email)
- Form submission saves to `dateOutcomes` table with `providedAt` timestamp
- Conditional rendering: Questions 2-7 only show if user selects "yes" to Q1
- Success KPI: ≥30% mutual interest rate (both want second date)

**Match Display & Response Flow** (`/dashboard`):

- Queries `getCurrentMatch` to get current week's match (checks both user and matchUser directions)
- Displays different states based on user status:
  - `accountStatus = "pending"` → "Profile Under Review" message
  - `accountStatus = "rejected"` → "Photo Needs Update" with rejection reason
  - No match found → "No Match This Week" message
  - Active match → Full match card with response buttons
- **Match Card Display** (`components/match/MatchCard.tsx`):
  - Profile photo with loading state
  - Name, age, location header
  - **Overall compatibility score** (large percentage display)
  - **"Why We Matched You" explanation** (2-3 warm paragraphs with specific details)
  - **Dimensional Scores Breakdown** (`components/match/DimensionalScores.tsx`):
    - 5 progress bars with icons (Heart, Home, Sparkles, MessageSquare, Target)
    - Score display for each dimension (e.g., "18/25")
    - Percentage completion bars
    - Descriptions for each dimension
  - **Red Flags Alert** (if applicable):
    - Warning icon with "Things to Consider" heading
    - Bullet list of 0-3 compatibility risks
    - Honest but constructive framing
  - Interests badges
  - Response buttons or status
- **Response Handling**:
  - "I'm Interested" button → Updates `userResponse` or `matchResponse` (based on direction)
  - "Pass" button → Shows optional feedback form with 6 categories
  - Responses trigger mutual match detection (both = "interested" → `mutualMatch = true`)
- **Mutual Match Reveal**:
  - "Open Chat" button appears on match card
  - Routes to `/chat/[matchId]` full-screen chat page
  - Real-time messaging enabled
  - Chat active until Friday 11:59pm (match expiry)
  - Celebration message displayed
- All photo storage IDs converted to URLs via `ctx.storage.getUrl()` in queries

### File Structure

```
app/
  ├─ layout.tsx              # Root layout with providers
  ├─ page.tsx                # Public landing page
  ├─ globals.css             # Global styles
  └─ (auth)/                 # Protected routes group
      ├─ layout.tsx          # Auth layout wrapper
      ├─ dashboard/
      │   └─ page.tsx        # Match display dashboard (shows current week's match)
      ├─ onboarding/
      │   ├─ page.tsx        # Onboarding orchestrator (6 steps)
      │   ├─ ProfileStep.tsx # Step 1: Basic info
      │   ├─ BioVoiceStep.tsx # Step 2: Bio voice interview
      │   ├─ PreferencesVoiceStep.tsx # Step 3: Preferences voice interview
      │   ├─ InterestsStep.tsx # Step 4: Interest selection
      │   ├─ PhotoStep.tsx   # Step 5: Photo upload
      │   ├─ DocumentStep.tsx # Step 6: Document verification
      │   └─ StepWrapper.tsx # Reusable step wrapper
      ├─ resubmit/
      │   └─ page.tsx        # Photo/document resubmission for rejected users
      ├─ chat/
      │   └─ [matchId]/
      │       └─ page.tsx    # Full-screen real-time chat page (requires mutual match)
      ├─ feedback/
      │   └─ [matchId]/
      │       └─ page.tsx    # Post-date feedback form (7 questions, PRIMARY METRIC tracking)
      └─ admin/
          ├─ layout.tsx      # Admin layout with navigation
          ├─ AdminNav.tsx    # Admin tab navigation component (4 tabs)
          ├─ page.tsx        # Platform overview (Tab 1)
          ├─ photo-review/
          │   └─ page.tsx    # Two-step photo review queue (Tab 2)
          ├─ matches/
          │   ├─ page.tsx    # All matches view with filters (Tab 3)
          │   └─ MatchDetailsModal.tsx # Detailed match modal with outcomes
          └─ analytics/
              └─ page.tsx    # Analytics deep dive with PRIMARY METRIC (Tab 4)

components/
  ├─ ConvexClientProvider.tsx  # Convex + Clerk integration
  ├─ header.tsx               # Navigation with auth buttons
  ├─ landing-page.tsx         # Main landing page component
  ├─ Elevenlabs.tsx           # LiveWaveform component with agent speaking visualization
  ├─ voice/
  │   ├─ VoiceInterviewCard.tsx # Main voice interview orchestrator
  │   ├─ VoiceWaveform.tsx    # CSS-only waveform visualization (fallback)
  │   ├─ VoiceControls.tsx    # Interview control buttons (start/retry)
  │   └─ VoiceStateIndicator.tsx # Status indicator (idle/recording/processing/complete/error)
  ├─ match/
  │   ├─ MatchCard.tsx        # Match profile display with response buttons
  │   ├─ DimensionalScores.tsx # Dimensional compatibility breakdown with progress bars
  │   ├─ PassFeedbackForm.tsx # Optional pass feedback (6 categories)
  │   ├─ ChatInterface.tsx    # Main chat orchestrator with real-time subscriptions
  │   ├─ ChatHeader.tsx       # Chat header with user info and countdown timer
  │   ├─ MessageList.tsx      # Scrollable message list with auto-scroll
  │   ├─ MessageInput.tsx     # Message input with character counter
  │   └─ ChatExpiredBanner.tsx # Expiry banner with feedback link
  ├─ feedback/
  │   └─ PostDateFeedbackForm.tsx # 7-question post-date feedback (PRIMARY METRIC)
  └─ ui/                      # shadcn/ui components (dialog, textarea, card, radio-group, checkbox, progress, alert, etc.)

hooks/
  └─ useVapiCall.ts           # Custom hook for Vapi SDK integration

convex/
  ├─ auth.config.ts     # Clerk JWT configuration
  ├─ schema.ts          # Database schema (5 tables: users, weeklyMatches, passReasons, dateOutcomes, messages)
  ├─ crons.ts           # Scheduled jobs (weekly matching on Sunday 11pm, message cleanup daily 3am)
  ├─ users.ts           # User CRUD operations + admin functions
  ├─ admin.ts           # Admin queries: photo review, platform metrics, analytics, all matches
  ├─ matching.ts        # Batched matching algorithm (actions, queries, mutations)
  ├─ matches.ts         # Match display queries (getCurrentMatch, getMatchById) and response mutations
  ├─ chat.ts            # Real-time chat queries (getMessages, getUnreadCount) and mutations (sendMessage, markMessagesAsRead, flagMessage)
  ├─ feedback.ts        # Post-date feedback mutations (submitPassFeedback, submitDateFeedback, getFeedbackForMatch)
  ├─ emails.ts          # Email actions (sendWeeklyMatchEmail, sendMutualMatchEmail, sendSecondDateContactEmail)
  ├─ voice.ts           # Voice interview actions (processTranscript)
  ├─ lib/
  │   ├─ openrouter.ts  # OpenRouter API integration + voice transcript processing (processVoiceTranscript)
  │   ├─ vapi.ts        # Vapi assistant ID management (getOrCreateAssistant)
  │   ├─ matching.ts    # Matching helpers (compatibility analysis, venue suggestions)
  │   └─ cosine.ts      # Vector similarity calculations (legacy - now uses native vector search)
  └─ _generated/        # Auto-generated Convex types

emails/
  └─ WeeklyMatch.tsx    # React Email template for weekly match notifications

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
  - `accountStatus` ('pending' | 'approved' | 'rejected')
  - `attractivenessRating` (optional, 1-10, **NEVER exposed to users**, encrypted at rest)
  - `accountRejectionReason` (optional string - guidance for rejected photos)
  - `accountResubmissionCount` (number - tracks resubmissions)
- **AI Matching**: `embedding` (optional, 1536 float64 values from OpenAI text-embedding-3-small)
- **State**: `vacationMode` (boolean), `vacationUntil` (optional timestamp)
- **Admin**: `isAdmin` (boolean, grants access to `/admin` dashboard)
- **Timestamps**: `createdAt`, `updatedAt`
- **Indexes**: `by_clerk_id`, `by_email`, `by_account_status`, `by_vacation`
- **Vector Search Index**: `by_embedding` (vectorField: "embedding", dimensions: 1536, filterFields: ["accountStatus", "vacationMode", "gender"])

**weeklyMatches**:

- **Match Participants**: `userId`, `matchUserId`, `weekOf` (string, e.g., '2024-12-16')
- **AI Analysis**:
  - `compatibilityScore` (number, 0-100 - sum of dimensional scores)
  - `explanation` (string, 2-3 warm paragraphs with specific profile details)
  - `dimensionScores` (optional object):
    - `values` (number, 0-25): Shared values & life philosophy alignment
    - `lifestyle` (number, 0-25): Daily routines & social preferences compatibility
    - `interests` (number, 0-20): Hobbies & connection points overlap
    - `communication` (number, 0-20): Emotional expression & conflict resolution alignment
    - `relationshipVision` (number, 0-10): Future timeline & goals compatibility
  - `redFlags` (optional array of strings): 0-3 potential compatibility risks (e.g., "7-year age gap may reflect different life stages")
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
  - `venueRating` (optional: 'perfect' | 'good' | 'okay' | 'not_good' | 'went_elsewhere')
- **Additional**: `additionalThoughts` (optional string), `providedAt` (timestamp), `feedbackProvided` (boolean)
- **Indexes**: `by_match`, `by_user`, `by_date_happened`, `by_would_meet_again`

**messages**:

- **CRITICAL for real-time chat**: In-app messaging system for mutual matches
- **Relational**: `matchId`, `senderId`, `receiverId`
- **Message Data**:
  - `content` (string, max 1000 chars)
  - `sentAt` (timestamp)
  - `readAt` (optional timestamp for read receipts)
- **Safety Features**:
  - `flagged` (boolean - for admin review)
  - `flaggedReason` (optional string - reason for flagging)
- **Purpose**: Real-time communication between mutual matches until Friday 11:59pm (match expiry)
- **Cleanup**: Messages deleted 7 days after match expiry via daily cron job
- **Indexes**: `by_match` (matchId, sentAt), `by_match_and_receiver` (matchId, receiverId), `by_sender` (senderId), `by_flagged` (flagged)

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
NEXT_PUBLIC_APP_URL=                    # App URL for email links (default: http://localhost:3000)
GOOGLE_PLACES_API_KEY=                  # Google Places API (venue selection)
NEXT_PUBLIC_VAPI_BIO_ASSISTANT_ID=      # Vapi assistant ID for bio interviews (client-side)
NEXT_PUBLIC_VAPI_PREFERENCES_ASSISTANT_ID= # Vapi assistant ID for preferences interviews (client-side)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=            # Vapi public key for client SDK
```

**Vapi Configuration**:

- Vapi assistants are configured in the Vapi dashboard (not via API)
- Assistant IDs are stored as environment variables and read directly by client components
- System prompts, voice settings, and conversation flow managed in Vapi dashboard
- See `convex/lib/vapi.ts` for detailed assistant prompt specifications

**Email Configuration**:

- Emails are sent from `MeetOnce <admin@meetonce.co>`
- Domain must be verified in Resend dashboard before production use
- Update sender address in `convex/emails.ts` if using different domain

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
- Only users with `accountStatus='approved'` participate
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

### Email Templates

Built with React Email + Resend. Email integration is **ACTIVE** using Resend API.

**Implemented Templates** (`emails/` directory):

1. ✅ **PhotoApproved.tsx** - Account approved, profile is live
2. ✅ **PhotoRejected.tsx** - Account rejected with reason + optional guidance
3. ✅ **WeeklyMatch.tsx** - Weekly match delivery (Monday 9am)
4. ✅ **MutualMatch.tsx** - Mutual match celebration (both interested)
5. ✅ **SecondDateContact.tsx** - Mutual second-date interest (contact info sharing)

**Email Functions** (`convex/emails.ts`):

- All 5 email functions use Resend with `react:` parameter for React Email templates
- Error handling with try-catch and console logging
- From address: `MeetOnce <admin@meetonce.co>`
- Uses environment variable `RESEND_API_KEY`

**Email Triggers**:

- Photo approval/rejection → `convex/admin.ts` (approvePhoto, rejectPhoto mutations)
- Mutual match → `convex/matches.ts` (respondToMatch mutation, sent to BOTH users)
- Second date contact → `convex/feedback.ts` (submitDateFeedback mutation, sent to BOTH users)

**Planned Templates** (not yet implemented):

- Account submitted for review confirmation
- Match passed notification
- Date confirmation with calendar invite
- Date reminder (24 hours before)
- Post-date feedback request (24 hours after)
- Missed match reminder (Saturday if no response)

### Photo Validation System

**Client-side photo processing** implemented in `PhotoStep.tsx` with automatic face detection and image optimization.

**Validation Pipeline** (4 steps, runs on photo upload):

1. **File Validation**: Type check (must be image), size check (10MB max before compression)
2. **Face Detection**: face-api.js TinyFaceDetector + FaceLandmark68Net models
   - ❌ No face detected → Error: "No face detected. Please upload a clear photo showing your face."
   - ❌ Multiple faces → Error: "Multiple faces detected. Please upload a photo with only you in it."
   - ✅ Exactly one face → Proceed to compression
3. **Image Compression**: browser-image-compression
   - Max size: 1MB
   - Max dimensions: 1920px
   - Web worker enabled for performance
   - Preserves original file type
4. **Storage**: Compressed file uploaded to Convex storage

**Model Files** (`public/models/`):

- `tiny_face_detector_model-*` (189KB + 2.9KB manifest)
- `face_landmark_68_model-*` (348KB + 7.7KB manifest)
- Models loaded on component mount, graceful degradation if loading fails

**User Experience**:

- Loading state: "Analyzing photo... Detecting face and optimizing"
- Validation happens immediately after file selection
- Clear error messages for validation failures
- Automatic retry by selecting new photo
- Buttons disabled during validation

**Benefits**:

- Reduces admin photo review workload (filters out group photos and non-face images)
- Saves storage costs (1MB max vs 10MB original)
- Improves upload speed (smaller file size)
- Better user experience (immediate feedback vs waiting for admin rejection)

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

**Tab 3: Matches** (`/admin/matches`)

- **All Matches View**: See all weekly matches with filters by week
- **Stats Overview**: Total matches, mutual matches (%), dates completed, both passed count
- **Week Filter Dropdown**: Filter matches by specific week or view all
- **Match Cards**: Clickable cards showing:
  - Both user names with mutual match badge
  - Week, compatibility score
  - Response status for both users (pending/interested/passed)
  - Sent and expires dates
- **Match Details Modal**: Click any match to see:
  - Full match information (week, compatibility, status)
  - AI explanation of why they were matched
  - Conversation starters and suggested venue
  - Both users' responses with timestamps
  - Pass reasons (if applicable)
  - Date outcomes from both users (if mutual match happened)
  - **SUCCESS STORY indicator** if both want second date (PRIMARY METRIC)

**Tab 4: Analytics Deep Dive** (`/admin/analytics`)

- **Matching Performance Card**:
  - This week's matches count
  - Response rate (% of users who responded)
  - Mutual match rate (% of responded matches that were mutual)
- **Date Outcomes Card**:
  - Dates completed count
  - Average date rating (1-5 stars)
  - Success stories (mutual second date requests)
- **PRIMARY SUCCESS METRIC (Large Card)**:
  - Mutual Interest Rate displayed prominently with large percentage
  - Formula: (Both users want second date / Total dates completed) × 100
  - Target indicator: ✓ Above Target (30%) or ⚠️ Below Target (30%)
  - This is THE key metric validating algorithm success

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
  photoStorageId: storageId, // Store ID, not URL
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
     userId: ctx.db.normalizeId("users", "user_id_here"),
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

### Email Integration

**Email System** (Resend + React Email):

- Email templates located in `emails/` directory (React Email components)
- Email sending functions in `convex/emails.ts` as internal actions
- Templates use `@react-email/components` for responsive, accessible emails

**Available Email Functions**:

1. `sendWeeklyMatchEmail`: Notify user of their weekly match (sent immediately after match creation)
   - Args: to, userName, matchName, matchAge, matchUrl
   - Template: `emails/WeeklyMatch.tsx`
   - Sent to BOTH users in the match pair

2. `sendMutualMatchEmail`: Celebrate mutual match and encourage chat
   - Args: to, userName, matchName, matchUrl
   - Sent when both users respond "interested"
   - Directs users to in-app chat

3. `sendSecondDateContactEmail`: Share contact info when both want second date
   - Args: to, userName, matchName, matchEmail
   - Triggered by mutual "yes" on Q3 of post-date feedback
   - **This validates the PRIMARY METRIC**

**Email Configuration**:

- Set `RESEND_API_KEY` in `.env.local`
- Update sender domain in email functions (currently: `admin@yourdomain.com`)
- All email functions currently log to console (uncomment Resend code to send real emails)
- Email templates use pink (#ec4899) brand color matching platform theme

**Integration Points**:

- Weekly matching algorithm (`convex/matching.ts`) sends `sendWeeklyMatchEmail` to BOTH users immediately after creating each match (Sunday 11pm)
- Mutual match detection in `convex/matches.ts` calls `sendMutualMatchEmail` (both users get email)
- Date feedback submission in `convex/feedback.ts` calls `sendSecondDateContactEmail` (if both want second date)
