# Onboarding Flow Setup - Complete ✅

## Overview
4-step onboarding wizard that creates users in Convex database after completion.

**Important**: Users exist ONLY in Clerk until they complete all 4 onboarding steps. Upon completion, a full user profile is created in Convex.

## File Structure

```
app/(auth)/
├── layout.tsx                    # Auth layout with gradient background
└── onboarding/
    ├── page.tsx                  # Main onboarding orchestrator
    ├── ProfileStep.tsx           # Step 1: Basic info
    ├── BioStep.tsx               # Step 2: Bio & Looking For
    ├── InterestsStep.tsx         # Step 3: Interest selection
    └── PhotoStep.tsx             # Step 4: Photo upload

convex/
└── users.ts
    ├── generateUploadUrl()       # Generate URL for photo upload
    ├── createUser()              # Create user in Convex (includes photoUrl)
    ├── getCurrentUser()          # Get authenticated user
    └── getUserByClerkId()        # Query user by Clerk ID
```

## Onboarding Steps

### Step 1: ProfileStep (Basic Info)
**Route**: `/onboarding` (Step 1/4)

**Fields**:
- Name (min 2 chars)
- Age (18-100)
- Gender (male | female | non-binary)
- Location (city, state format)

**Validation**:
- All fields required
- Real-time error display
- Continue button disabled until valid

### Step 2: BioStep (Bio & Looking For)
**Route**: `/onboarding` (Step 2/4)

**Fields**:
- Bio (50-300 words)
- Looking For (20-100 words)

**Features**:
- Real-time word count
- Color-coded validation (red when out of range)
- Back button to edit previous step

**Validation**:
- Bio: 50-300 words
- Looking For: 20-100 words

### Step 3: InterestsStep
**Route**: `/onboarding` (Step 3/4)

**Features**:
- Grid of interest buttons from `INTERESTS` constant
- Toggle selection with visual feedback
- Selected count display
- Minimum 3 interests required

**UI**:
- Selected: Pink background, white text
- Unselected: Gray background, hover effect

### Step 4: PhotoStep (Photo Upload)
**Route**: `/onboarding` (Step 4/4)

**Features**:
- File input with custom styling
- Image preview (64x64 rounded)
- File validation (type & size)
- Photo guidelines display
- Review notification

**Validation**:
- Max size: 5MB
- Accepted types: image/*
- Required to submit

**Workflow**:
1. User selects photo
2. Client validates size/type
3. Preview displayed
4. On submit:
   - Call `generateUploadUrl()` mutation
   - Upload file to Convex storage
   - Get `storageId`
   - Call `createUser()` with all profile data + `photoUrl`
   - Redirect to homepage

## User Creation Flow

### Frontend (onboarding/page.tsx)

```typescript
const handleSubmit = async () => {
  // 1. Generate upload URL
  const uploadUrl = await generateUploadUrl();

  // 2. Upload photo to Convex storage
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": formData.photo.type },
    body: formData.photo,
  });

  const { storageId } = await result.json();

  // 3. Create user in Convex with all data
  await createUser({
    clerkId: user.id,
    email: user.primaryEmailAddress.emailAddress,
    name: formData.name,
    age: formData.age,
    gender: formData.gender,
    location: formData.location,
    bio: formData.bio,
    lookingFor: formData.lookingFor,
    interests: formData.interests,
    photoUrl: storageId,
  });

  // 4. Redirect to homepage
  router.push("/");
};
```

### Backend (convex/users.ts)

```typescript
export const createUser = mutation({
  handler: async (ctx, args) => {
    // 1. Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      throw new Error("User already exists");
    }

    // 2. Generate AI embedding from profile text
    const profileText = `
      Name: ${args.name}, Age: ${args.age}, Gender: ${args.gender}
      Location: ${args.location}
      Bio: ${args.bio}
      Looking for: ${args.lookingFor}
      Interests: ${args.interests.join(", ")}
    `;

    const embedding = await generateEmbedding(profileText);

    // 3. Create user in database
    const userId = await ctx.db.insert("users", {
      ...args,
      embedding,
      accountStatus: "pending",  // Awaiting admin review
      accountResubmissionCount: 0,
      vacationMode: false,
      isAdmin: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});
```

## Form State Management

The main `page.tsx` component manages all form state:

```typescript
const [formData, setFormData] = useState({
  name: "",
  age: 0,
  gender: "male" as "male" | "female" | "non-binary",
  location: "",
  bio: "",
  lookingFor: "",
  interests: [] as string[],
  photo: null as File | null,
});
```

**State updates**:
- Each step receives `updateData()` callback
- Partial updates merged into state
- State persists across step navigation

## Progress Tracking

**Progress Bar**:
- Visual indicator: 0-100% based on current step
- Step counter: "Step X of 4"
- Pink gradient fill

**Navigation**:
- Step 1: Only "Continue" button
- Steps 2-3: "Back" and "Continue" buttons
- Step 4: "Back" and "Complete Profile" buttons

## User States

### 1. Clerk Only (Not in Convex)
- User signed up via Clerk
- Has not completed onboarding
- Redirect to `/onboarding`

### 2. Pending Approval (In Convex)
- Completed onboarding
- `accountStatus: "pending"`
- Waiting for admin review (24h)
- Can view profile but cannot get matches

### 3. Approved (Active)
- Admin approved photo
- `accountStatus: "approved"`
- Eligible for weekly matching
- Full platform access

### 4. Rejected (Resubmit Required)
- Admin rejected photo
- `accountStatus: "rejected"`
- Can edit profile and resubmit
- `accountResubmissionCount` incremented

## Testing Checklist

### ✅ Step 1 - Profile
- [ ] Name validation (min 2 chars)
- [ ] Age validation (18-100)
- [ ] Gender dropdown works
- [ ] Location required
- [ ] Continue button disabled when invalid
- [ ] Form state persists when going back

### ✅ Step 2 - Bio
- [ ] Word count updates in real-time
- [ ] Bio validation (50-300 words)
- [ ] Looking For validation (20-100 words)
- [ ] Color changes when out of range
- [ ] Back button returns to Step 1
- [ ] Previous data preserved

### ✅ Step 3 - Interests
- [ ] Interests load from INTERESTS constant
- [ ] Toggle selection works
- [ ] Selected count updates
- [ ] Minimum 3 interests enforced
- [ ] Visual feedback (pink when selected)
- [ ] Back button works

### ✅ Step 4 - Photo
- [ ] File input accepts images only
- [ ] Preview displays after selection
- [ ] 5MB size limit enforced
- [ ] Image type validation
- [ ] Submit button disabled without photo
- [ ] Loading state during submission
- [ ] Error handling displays

### ✅ Full Flow
- [ ] Complete all 4 steps
- [ ] Photo uploads to Convex storage
- [ ] User created in Convex database
- [ ] Embedding generated
- [ ] accountStatus set to "pending"
- [ ] Redirects to homepage
- [ ] No duplicate user creation

## Error Handling

**Validation Errors**:
- Display inline below fields
- Red text color
- Prevent step advancement

**Upload Errors**:
- File too large: "Photo must be less than 5MB"
- Wrong type: "Please upload an image file"
- No photo: "Please upload a photo"

**Submission Errors**:
- User exists: "User already exists"
- Network error: "Failed to create profile. Please try again."
- Stay on current step, allow retry

## Next Steps

After this implementation is complete:

1. **Middleware Protection**: Redirect unauthenticated users
2. **Photo Review Dashboard**: Admin interface for photo approval
3. **Email Notifications**: Send confirmation emails
4. **Profile Edit Flow**: Allow users to edit after creation
5. **Resubmission Flow**: Handle rejected photo resubmission

## Environment Variables

Already configured in `.env.local`:
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `OPENROUTER_API_KEY` (for embedding generation)

## Routes

- `/onboarding` - Main onboarding wizard
- `/` - Homepage (redirect after completion)

## Database Impact

**New User Record**:
- Creates entry in `users` table
- Photo stored in Convex storage (separate from DB)
- Embedding (1536 floats) generated via OpenRouter
- Initial status: `accountStatus: "pending"`

**Storage Used Per User**:
- Database: ~2KB (profile data + embedding)
- File storage: ~500KB (compressed photo)
- Total: ~502KB per user
