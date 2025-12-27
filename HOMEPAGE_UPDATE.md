# Homepage Update - Onboarding Flow Integration

## Issue Fixed
After authentication, users were seeing "Authenticated content" placeholder instead of being redirected to onboarding.

## Solution Implemented

Updated `app/page.tsx` to:

1. **Check if user exists in Convex** using `getCurrentUser()` query
2. **Redirect to onboarding** if user is null (not in Convex database)
3. **Show status-based UI** if user has completed onboarding

## User Flow States

### 1. Unauthenticated User
- **Show**: Landing page with sign up/login buttons
- **Component**: `<LandingPage />`

### 2. Authenticated + No Convex Profile
- **Show**: "Redirecting to onboarding..." message
- **Action**: Automatic redirect to `/onboarding`
- **Logic**: `currentUser === null` → `router.push("/onboarding")`

### 3. Authenticated + Profile Pending
- **Show**: Welcome message + Yellow alert
- **Message**: "Your photo is being reviewed! We'll send you an email within 24 hours..."
- **Status**: `photoStatus === "pending"`

### 4. Authenticated + Profile Approved
- **Show**: Welcome message + Green success alert
- **Message**: "Your profile is live! You'll receive your first match on Monday morning at 9am."
- **Status**: `photoStatus === "approved"`

### 5. Authenticated + Profile Rejected
- **Show**: Welcome message + Red warning alert
- **Message**: "Photo needs updating. Please upload a new photo that meets our guidelines."
- **Status**: `photoStatus === "rejected"`
- **TODO**: Add "Update Photo" button to edit profile

## Code Changes

### Before
```typescript
function Content() {
  return <div>Authenticated content</div>;
}
```

### After
```typescript
function Content() {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (currentUser === undefined) return;
    if (currentUser === null) {
      router.push("/onboarding");
      return;
    }
  }, [currentUser, router]);

  // Loading, redirecting, or status-based UI
  // ...
}
```

## User Experience Flow

```
1. User signs up via Clerk
   ↓
2. Authenticated in Clerk (but NOT in Convex yet)
   ↓
3. Lands on homepage "/"
   ↓
4. getCurrentUser() returns null
   ↓
5. Automatic redirect to "/onboarding"
   ↓
6. User completes 4 steps
   ↓
7. createUser() mutation creates Convex profile
   ↓
8. Redirects back to "/"
   ↓
9. getCurrentUser() returns user object
   ↓
10. Shows status-based UI (pending/approved/rejected)
```

## Query Logic

```typescript
// convex/users.ts
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;  // Not authenticated in Clerk
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first();  // null if not in Convex, user object if exists
  },
});
```

## Loading States

1. **AuthLoading**: Clerk is checking authentication
   - Shows: "Loading..."

2. **Query Loading**: Convex is fetching user
   - Shows: "Loading your profile..."
   - `currentUser === undefined`

3. **Redirecting**: User doesn't exist in Convex
   - Shows: "Redirecting to onboarding..."
   - `currentUser === null`

4. **Loaded**: User exists, show status UI
   - Shows: Welcome message + status alert
   - `currentUser !== null`

## Status Badge Colors

- **Pending**: Yellow (`bg-yellow-50 border-yellow-200`)
- **Approved**: Green (`bg-green-50 border-green-200`)
- **Rejected**: Red (`bg-red-50 border-red-200`)

## Next Steps (Future Enhancements)

### 1. Profile Edit Flow
- Add "Edit Profile" button
- Allow users to update bio, interests
- Allow photo resubmission if rejected

### 2. Match Display
When user has an active match:
- Replace status UI with match display
- Show compatibility score
- Show match profile
- Add "Interested" / "Pass" buttons

### 3. Match History
- Add "View Past Matches" link
- Show all previous matches
- Display match status (mutual, passed, expired)

### 4. Settings Page
- Vacation mode toggle
- Profile visibility settings
- Notification preferences

## Testing Checklist

- [x] Unauthenticated user sees landing page
- [x] Authenticated user without profile redirects to onboarding
- [x] After onboarding completion, redirects to homepage
- [x] Pending status shows yellow alert
- [ ] Approved status shows green alert (need admin approval)
- [ ] Rejected status shows red alert (need admin rejection)
- [x] No infinite redirect loops
- [x] Build succeeds without errors

## Build Verification

```
✓ Compiled successfully in 2.6s
✓ Generating static pages using 7 workers (5/5)

Routes:
┌ ○ /              # Homepage with status logic
├ ○ /_not-found    # 404 page
└ ○ /onboarding    # 4-step wizard
```

## Complete! ✅

The homepage now properly handles all user states and redirects new users to onboarding automatically.
