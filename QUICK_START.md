# MeetOnce - Quick Start Guide

## ✅ What's Complete

1. **Database Schema** - 4 tables with 18 indexes deployed to Convex
2. **AI Integration** - OpenRouter API integration for embeddings
3. **Onboarding Flow** - 4-step wizard (Profile → Bio → Interests → Photo)
4. **Photo Upload** - Direct upload to Convex storage
5. **User Creation** - Full user creation with AI embedding generation

## 🚀 Next Steps to Test

### 1. Add OpenRouter API Key

**Get your API key**:
1. Go to https://openrouter.ai/keys
2. Sign up or log in
3. Create a new API key
4. Copy the key

**Update `.env.local`**:
```bash
OPENROUTER_API_KEY=sk-or-v1-... # Replace with your actual key
```

### 2. Run the Development Server

```bash
# Terminal 1: Run Convex backend
npx convex dev

# Terminal 2: Run Next.js frontend
npm run dev
```

### 3. Test the Onboarding Flow

1. **Visit**: http://localhost:3000
2. **Sign Up**: Click "Sign Up" button (Clerk handles this)
3. **Complete Onboarding**: Navigate to http://localhost:3000/onboarding
4. **Fill out 4 steps**:
   - Step 1: Name, Age, Gender, Location
   - Step 2: Bio (50-300 words), Looking For (20-100 words)
   - Step 3: Select at least 3 interests
   - Step 4: Upload a photo (max 5MB)
5. **Submit**: Click "Complete Profile"
6. **Verify**: Check Convex dashboard for new user

### 4. Verify in Convex Dashboard

1. **Open**: https://dashboard.convex.dev
2. **Select Project**: meetonce (valiant-chickadee-463)
3. **Go to Data Tab**
4. **Check Tables**:
   - `users` - Should have 1 new user
   - `_storage` - Should have 1 uploaded photo
5. **Verify Fields**:
   - `clerkId` matches Clerk user ID
   - `embedding` is array of 1536 floats
   - `photoStatus` is "pending"
   - `photoUrl` points to storage

## 📂 File Structure Overview

```
app/
├── (auth)/
│   ├── layout.tsx              # Auth pages layout
│   └── onboarding/
│       ├── page.tsx            # Main wizard orchestrator
│       ├── ProfileStep.tsx     # Step 1: Basic info
│       ├── BioStep.tsx         # Step 2: Bio & Looking For
│       ├── InterestsStep.tsx   # Step 3: Interest selection
│       └── PhotoStep.tsx       # Step 4: Photo upload

convex/
├── schema.ts                   # Database schema (4 tables)
├── users.ts                    # User CRUD operations
├── lib/
│   ├── openrouter.ts          # AI API integration
│   └── cosine.ts              # Vector similarity
└── _generated/                 # Auto-generated types

lib/
├── utils.ts                    # Utility functions
└── constants.ts                # INTERESTS, PASS_REASONS, etc.
```

## 🔍 Troubleshooting

### Issue: "OPENROUTER_API_KEY is not defined"
**Solution**: Add your API key to `.env.local` and restart both servers

### Issue: Photo upload fails
**Solution**:
- Check file size (max 5MB)
- Check file type (must be image/*)
- Check Convex dev server is running

### Issue: User creation fails with "User already exists"
**Solution**:
- Sign up with a new Clerk account
- Or delete the existing user in Convex dashboard

### Issue: Embedding generation fails
**Solution**:
- Verify OpenRouter API key is correct
- Check if you have credits on OpenRouter
- Check Convex logs for error details

### Issue: Build errors
**Solution**:
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

## 🎯 What to Test

### Onboarding Flow
- [ ] All 4 steps load correctly
- [ ] Validation works on each step
- [ ] Back button preserves data
- [ ] Progress bar updates
- [ ] Photo preview displays
- [ ] Submit creates user in Convex
- [ ] Redirect to homepage after completion

### Database
- [ ] User record created in `users` table
- [ ] Photo uploaded to Convex storage
- [ ] Embedding array has 1536 floats
- [ ] photoStatus is "pending"
- [ ] All profile fields populated

### UI/UX
- [ ] Responsive design works on mobile
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Word counters update in real-time
- [ ] Interest buttons toggle correctly

## 📊 Expected Data

### Example User Record
```json
{
  "clerkId": "user_2abc...",
  "email": "test@example.com",
  "name": "Test User",
  "age": 28,
  "gender": "female",
  "location": "San Francisco, CA",
  "bio": "50-300 word bio about yourself...",
  "lookingFor": "20-100 words about ideal match...",
  "interests": ["Hiking", "Coffee", "Reading"],
  "photoUrl": "kg2abc...",
  "embedding": [0.123, -0.456, ...], // 1536 floats
  "photoStatus": "pending",
  "photoResubmissionCount": 0,
  "vacationMode": false,
  "isAdmin": false,
  "createdAt": 1703462400000,
  "updatedAt": 1703462400000
}
```

## 🚦 Success Indicators

✅ **Onboarding Working**:
- User can complete all 4 steps
- Photo uploads successfully
- User created in Convex
- Redirects to homepage

✅ **Database Working**:
- User record exists in `users` table
- Photo exists in `_storage`
- Embedding array has 1536 elements
- All indexes created

✅ **AI Integration Working**:
- Embedding generated successfully
- No OpenRouter API errors in logs
- Embedding values are between -1 and 1

## 🔧 Commands Reference

```bash
# Development
npm run dev          # Start Next.js dev server
npx convex dev       # Start Convex backend

# Build & Lint
npm run build        # Build for production
npm run lint         # Run ESLint

# Convex
npx convex dev --once    # Deploy functions once
npx convex dashboard     # Open Convex dashboard
npx convex logs          # View Convex logs
```

## 📚 Documentation

- `CLAUDE.md` - Project overview and architecture
- `ONBOARDING_SETUP.md` - Detailed onboarding flow docs
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation summary
- `test-convex-setup.md` - Schema verification details

## 🎉 You're Ready!

The platform is fully set up and ready for testing. Just add your OpenRouter API key and start testing the onboarding flow!

**Happy building! 🚀**
