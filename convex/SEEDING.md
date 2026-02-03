# Database Seeding Guide

This guide explains how to seed test users into your MeetOnce database for development and testing.

## Overview

The seeding script creates realistic test user profiles with:

- Diverse backgrounds, ages, and interests
- AI-generated embeddings for matching
- Automatic approval option for immediate matching
- Gender balance (10 males, 10 females)

## Quick Start

### 1. Seed All Users (Approved)

Run this in the **Convex Dashboard** or via CLI:

```bash
# In Convex Dashboard → Functions tab
internal.seed.seedTestUsers()
```

This will create **20 approved users** ready for matching.

### 2. Seed Specific Number of Users

```bash
# Seed only 10 users
internal.seed.seedTestUsers({ count: 10 })

# Seed 5 users as pending (requires admin approval)
internal.seed.seedTestUsers({ count: 5, approved: false })
```

### 3. Clear All Test Users

```bash
# Remove all test users from database
internal.seed.clearTestUsers()
```

## Using Convex Dashboard

1. Navigate to your Convex Dashboard
2. Go to **Functions** tab
3. Find `internal.seed.seedTestUsers`
4. Click **Run**
5. Enter parameters (optional):
   ```json
   {
     "count": 10,
     "approved": true
   }
   ```
6. Click **Run Function**
7. Check the **Logs** tab to see progress

## Test Users

The script includes 20 pre-defined users:

### Females (10 users)

- Sarah Johnson, 28 - Software engineer
- Emma Murphy, 31 - Marketing manager
- Aoife O'Brien, 26 - Graphic designer
- Chloe Murphy, 30 - Journalist
- Sophie Byrne, 25 - Environmental scientist
- Rachel Kelly, 29 - Veterinarian
- Katie O'Connor, 27 - Nurse
- Niamh Ryan, 26 - Physiotherapist
- Grace Dunne, 28 - HR manager
- Ciara Walsh, 30 - Event planner

### Males (10 users)

- Michael Chen, 29 - Data scientist
- James Walsh, 32 - Teacher
- Liam O'Sullivan, 27 - Fitness coach
- Patrick Doyle, 34 - Architect
- Daniel Murphy, 30 - Product manager
- Conor Fitzgerald, 28 - Civil engineer
- Seán Brennan, 31 - Secondary school teacher
- Tom Anderson, 33 - Financial analyst
- Oisín McCarthy, 29 - UX designer
- Brian Kavanagh, 32 - Mechanical engineer

## Parameters

### `count` (optional)

- **Type**: `number`
- **Default**: `20` (all users)
- **Description**: Number of users to seed from the list

### `approved` (optional)

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Auto-approve users for immediate matching
  - `true`: Users created with `accountStatus: "approved"` and random attractiveness rating (6-8)
  - `false`: Users created with `accountStatus: "pending"` (requires admin approval)

## Test User Details

All test users have:

- ✅ Unique email addresses (`name@test.meetonce.iem`)
- ✅ Fake Clerk IDs (`test_name_timestamp`)
- ✅ AI-generated embeddings (via OpenRouter API)
- ✅ Realistic bios and interests
- ✅ Age preferences (minAge, maxAge)
- ❌ No photos (photoStorageId: undefined)
- ❌ No verification documents

## Testing Matching Algorithm

After seeding approved users:

1. **Run Weekly Match Generation**:

   ```bash
   internal.matching.weeklyMatchGeneration()
   ```

2. **Test Specific Batch**:

   ```bash
   internal.matching.testMatchingAlgorithm()
   ```

3. **Check Results**:
   - Go to Convex Dashboard → Data → `weeklyMatches`
   - View created matches with compatibility scores

## Cleanup

### Remove All Test Users

```bash
internal.seed.clearTestUsers()
```

This will:

- Find all users with `@test.meetonce.iem` emails
- Delete all test users from database
- Display deletion count in logs

### Manual Cleanup

1. Go to Convex Dashboard → Data → `users`
2. Filter by email containing `@test.meetonce.iem`
3. Delete manually if needed

## Common Use Cases

### 1. Testing Matching Algorithm

```bash
# Seed users
internal.seed.seedTestUsers({ count: 20, approved: true })

# Run matching
internal.matching.testMatchingAlgorithm()

# Clear when done
internal.seed.clearTestUsers()
```

### 2. Testing Admin Approval Flow

```bash
# Seed unapproved users
internal.seed.seedTestUsers({ count: 10, approved: false })

# Go to /admin/photo-review and approve manually
# Test the approval workflow
```

### 3. Testing with Fresh Data

```bash
# Clear existing test users
internal.seed.clearTestUsers()

# Seed new batch
internal.seed.seedTestUsers({ count: 20 })
```

## Notes

- **OpenRouter API costs**: Each user requires one embedding generation call (~$0.0001 per user)
- **Fake Clerk IDs**: Test users won't authenticate via Clerk
- **No photos**: Test users don't have profile photos (intentional for testing)
- **Timestamps**: Clerk IDs include timestamps to ensure uniqueness across multiple runs
- **Attractiveness ratings**: Randomly assigned 6-8 for approved users (matches real distribution)

## Troubleshooting

### "User already exists" Error

Test users have timestamped Clerk IDs, so duplicates shouldn't occur. If they do:

1. Run `clearTestUsers()` first
2. Then run `seedTestUsers()` again

### No Matches Created

Check that:

1. Users are approved: `internal.seed.seedTestUsers({ approved: true })`
2. Embeddings were generated successfully (check logs)
3. Users meet matching criteria (age ranges, gender preferences)

### Embedding Generation Fails

Ensure:

1. `OPENROUTER_API_KEY` is set in environment variables
2. API key has sufficient credits
3. Network connectivity is working
