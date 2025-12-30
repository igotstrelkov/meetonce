# AI Dating Platform

One curated match per week. No swiping. AI-powered compatibility.

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Convex (serverless)
- **Auth:** Clerk
- **AI:** OpenRouter (multi-provider)
- **Email:** Resend
- **Styling:** Tailwind CSS + shadcn/ui

## Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in:

- Convex deployment URL
- Clerk API keys
- OpenRouter API key
- Resend API key
- Google Places API key

### 3. Start Development Servers

\`\`\`bash
# Terminal 1: Convex
npx convex dev

# Terminal 2: Next.js
npm run dev
\`\`\`

### 4. Access Application

Open http://localhost:3000

## Project Structure

- `app/` - Next.js pages and routes
- `convex/` - Backend functions and schema
- `components/` - React components
- `emails/` - Email templates
- `lib/` - Utilities

## Key Features

- Multi-step onboarding
- Admin photo review
- Sunday night batch matching
- Match display and responses
- Post-date feedback
- Analytics dashboard

## Primary Success Metric

**Mutual Interest Rate ≥ 30%**

(Both users want second date / Total dates completed) × 100

## Deployment

\`\`\`bash
# Deploy Convex
npx convex deploy --prod

# Deploy Next.js to Vercel
vercel --prod
\`\`\`

## License

MIT
\`\`\`

FINAL ACCEPTANCE CRITERIA:
✅ All admin analytics working
✅ Matches admin view shows all matches
✅ Can filter matches by week
✅ Can view match details (responses, pass reasons, date outcomes)
✅ Success stories highlighted (mutual second date interest)
✅ Primary metric (Mutual Interest Rate) displaying correctly
✅ Email sending configured
✅ Landing page created
✅ 404 page created
✅ README.md documentation complete
✅ All core features working end-to-end
✅ Can onboard new user
✅ Can review and approve photos
✅ Can run matching algorithm
✅ Can view and respond to matches
✅ Can submit feedback
✅ Can view analytics

COMPREHENSIVE END-TO-END TEST:
1. Visit landing page
2. Sign up and complete onboarding
3. User is created in Convex on onboarding completion
4. Admin approves photo
5. Run matching algorithm (creates matches)
6. View match on homepage
7. Respond with "interested"
8. Other user also responds "interested"
9. See mutual match celebration
10. Submit post-date feedback
11. Both say "yes" to second date
12. Admin dashboard shows updated metrics
13. Mutual Interest Rate calculates correctly
14. Admin can view all matches in Matches tab
15. Admin can see pass reasons and date outcomes
16. Success stories (mutual second dates) are highlighted

🎉 CONGRATULATIONS! YOUR AI DATING PLATFORM IS COMPLETE! 🎉

The app is now ready for alpha testing with real users.

**Key Achievement:**
You've built a complete dating platform with:
✅ Simple, clean architecture (create-on-onboarding)
✅ Multi-step onboarding wizard
✅ Admin photo review system
✅ AI-powered matching algorithm with pass history tracking
✅ Match display and response system
✅ Comprehensive feedback tracking
✅ Full matches admin view (responses, pass reasons, date outcomes)
✅ Analytics dashboard with PRIMARY METRIC
✅ Success story tracking (mutual second date interest)
✅ Email automation
✅ Production-ready, maintainable codebase

**Why This Approach Works:**
- ✅ **Simple** - Users created when they complete onboarding
- ✅ **Clean** - No webhooks, no placeholder records
- ✅ **Maintainable** - Less code = fewer bugs
- ✅ **Production-Ready** - Thousands of apps use this pattern
- ✅ **Easy to understand** - Straightforward data flow
- ✅ **Scalable** - Can add webhooks later if needed (you probably won't need them)