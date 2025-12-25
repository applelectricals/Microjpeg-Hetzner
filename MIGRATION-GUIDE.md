# MicroJPEG 2-Tier Migration Guide

## Overview

This guide covers the migration from 4-tier (Free, Starter, Pro, Business) to 2-tier (Free, Starter) pricing structure.

---

## Files Updated

### Frontend Files

| File | Status | Description |
|------|--------|-------------|
| `header.tsx` | ✅ Ready | Added "Premium Tools" link for paid users |
| `EnhancedPricingPage.tsx` | ✅ Ready | Simplified to 2 plans with comparison table |
| `CheckoutPage.tsx` | ✅ Ready | Single plan (Starter) with monthly/yearly toggle |
| `UpgradePrompt.tsx` | ✅ Ready | Updated messaging for 2-tier structure |
| `DynamicCompressPage-tier-changes.tsx` | ✅ Ready | Replacement code for tier functions |

### Backend Files

| File | Status | Description |
|------|--------|-------------|
| `tierMiddleware.ts` | ✅ Ready | Updated middleware for 2-tier logic |
| `tierConfig.ts` | ✅ Ready | Central configuration file (NEW) |

### Backend Routes (routes.ts) - MANUAL CHANGES NEEDED

See "Backend Route Changes" section below.

---

## New Tier Structure

### Free Tier ($0)
```
Compress/Convert: 30/month
File Size: 5MB Regular / 10MB RAW
AI BG Removal: 10/month
AI Enhancement: 10/month
Output Formats (AI): PNG only
Max Upscale: 2x
Face Enhancement: No
API Access: No
Priority Processing: No
Support: Community
```

### Starter Tier ($9/month or $49/year)
```
Compress/Convert: Unlimited
File Size: Unlimited (actual 75MB/100MB RAW)
AI BG Removal: 300/month
AI Enhancement: 300/month
Output Formats (AI): All (WebP, AVIF, PNG, JPG)
Max Upscale: 8x
Face Enhancement: Yes
API Access: Full
Priority Processing: Yes
Support: Priority Email
```

---

## Installation Steps

### Step 1: Frontend Updates

1. **Replace `client/src/components/header.tsx`** with the new version
   - Adds tier check query
   - Shows "Premium Tools" button for paid users
   - Links to `/compress` page

2. **Replace `client/src/pages/EnhancedPricingPage.tsx`** with new version
   - Only shows Free and Starter plans
   - Includes feature comparison table
   - Updated FAQ section

3. **Replace `client/src/pages/CheckoutPage.tsx`** with new version
   - Single plan selection (Starter)
   - Monthly/Yearly toggle
   - Simplified UI

4. **Replace `client/src/components/UpgradePrompt.tsx`** with new version
   - Updated limits (30 compression, 10 AI ops)
   - Simplified pricing display
   - "Starter" branding

5. **Update `DynamicCompressPage.tsx`** - Replace lines 78-119:
   ```typescript
   // Replace getTierLimits, getTierPageIdentifier, getTierDisplayName
   // with the code from DynamicCompressPage-tier-changes.tsx
   ```

### Step 2: Backend Updates

1. **Add `shared/tierConfig.ts`** - New file
   - Central source of truth for tier limits
   - Use in both frontend and backend

2. **Replace `server/middleware/tierMiddleware.ts`** with new version
   - Updated `normalizeTier()` function
   - New `isPaidTier()` helper
   - Updated `getTierLimits()`

### Step 3: Backend Route Changes (routes.ts)

Search and replace these patterns:

#### 3.1 Tier Limit Checks

**Find:**
```typescript
case 'pro':
case 'pro-monthly':
case 'pro-yearly':
  // ... pro limits
case 'business':
case 'business-monthly':
case 'business-yearly':
  // ... business limits
```

**Replace with:**
```typescript
// All paid tiers map to starter
case 'starter':
case 'starter-monthly':
case 'starter-yearly':
case 'pro':
case 'pro-monthly':
case 'pro-yearly':
case 'business':
case 'business-monthly':
case 'business-yearly':
case 'premium':
  return {
    monthlyOperations: -1, // Unlimited
    maxFileSize: 75 * 1024 * 1024,
    maxRawFileSize: 100 * 1024 * 1024,
    bgRemovalLimit: 300,
    enhancementLimit: 300,
    // ... starter limits
  };
```

#### 3.2 API Endpoint: /api/user/tier-info

Update the response to use normalized tier:

```typescript
app.get('/api/user/tier-info', async (req, res) => {
  // ... existing auth check
  
  const rawTier = user.subscriptionTier || 'free';
  const normalizedTier = normalizeTierName(rawTier); // 'free' or 'starter'
  const config = getTierConfig(normalizedTier);
  
  res.json({
    authenticated: true,
    tier: {
      tierName: normalizedTier,
      tierDisplay: getTierDisplayName(normalizedTier),
      maxFileSize: config.maxFileSize,
      maxRawFileSize: config.maxRawFileSize,
      operationsLimit: config.monthlyOperations,
      bgRemovalLimit: config.bgRemovalLimit,
      enhancementLimit: config.enhancementLimit,
    },
    subscription: user.subscriptionStatus === 'active' ? {
      status: user.subscriptionStatus,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
    } : null,
  });
});
```

#### 3.3 API Endpoint: /api/ai/bg-removal/limits

```typescript
app.get('/api/ai/bg-removal/limits', async (req, res) => {
  const tier = normalizeTierName(user?.subscriptionTier || 'free');
  const config = getTierConfig(tier);
  const used = user?.bgRemovalUsedThisMonth || 0;
  
  res.json({
    limit: config.bgRemovalLimit,
    remaining: Math.max(0, config.bgRemovalLimit - used),
    tier: tier,
  });
});
```

#### 3.4 API Endpoint: /api/ai/enhance/limits

```typescript
app.get('/api/ai/enhance/limits', async (req, res) => {
  const tier = normalizeTierName(user?.subscriptionTier || 'free');
  const config = getTierConfig(tier);
  const used = user?.enhancementUsedThisMonth || 0;
  
  res.json({
    limit: config.enhancementLimit,
    remaining: Math.max(0, config.enhancementLimit - used),
    tier: tier,
  });
});
```

#### 3.5 Razorpay Webhook Handler

Update to use new tier mapping:

```typescript
import { getTierFromRazorpayPlan } from '../shared/tierConfig';

// In webhook handler:
const planId = payload.subscription.entity.plan_id;
const tierName = getTierFromRazorpayPlan(planId); // Returns 'starter'

await db.user.update({
  where: { email },
  data: {
    subscriptionTier: tierName, // 'starter'
    subscriptionStatus: 'active',
    // ... other fields
  }
});
```

---

## Razorpay Configuration

### Plans to Keep Active
- `plan_Rkbt8vVdqEAWtB` → Starter Monthly ($9)
- `plan_RkdJ0gPYJrRvtH` → Starter Yearly ($49)

### Plans to Deactivate (optional, for cleanup)
- `plan_RlaBnfeyayAq2V` → Pro Monthly
- `plan_RlaGdSwbmfKxfO` → Pro Yearly
- `plan_RlaI1OibtE9gaB` → Business Monthly
- `plan_RlaJ3zyeHm24ML` → Business Yearly

### Button IDs
- Monthly: `pl_RlaSYlOEgnhvGu`
- Yearly: `pl_RlwkI8y1JWtyrV`

---

## Database Considerations

### Existing Users with Pro/Business Tiers

Users who already have `pro`, `pro-monthly`, `business`, etc. as their `subscriptionTier` will automatically be treated as `starter` tier due to the `normalizeTierName()` function.

**No database migration required** - the normalization happens at runtime.

### Optional: Clean Up Old Tier Names

If you want to standardize the database:

```sql
-- Update all paid tiers to 'starter'
UPDATE users 
SET subscription_tier = 'starter'
WHERE subscription_tier IN (
  'pro', 'pro-monthly', 'pro-yearly',
  'business', 'business-monthly', 'business-yearly',
  'premium', 'starter-m', 'starter-y'
);

-- Update all free variants to 'free'
UPDATE users 
SET subscription_tier = 'free'
WHERE subscription_tier IN (
  'free_registered', 'free_anonymous', 'free-registered'
);
```

---

## Testing Checklist

### Frontend Tests
- [ ] Free user sees Free plan as "Current Plan" on pricing page
- [ ] Free user sees only Starter as upgrade option
- [ ] Paid user sees "Premium Tools" in header
- [ ] "Premium Tools" links to /compress
- [ ] Checkout page shows correct Razorpay buttons
- [ ] PayPal payment works and redirects to /compress
- [ ] Upgrade prompt shows correct limits

### Backend Tests
- [ ] `/api/user/tier-info` returns correct tier
- [ ] `/api/ai/bg-removal/limits` returns 10 for free, 300 for starter
- [ ] `/api/ai/enhance/limits` returns 10 for free, 300 for starter
- [ ] File size validation uses correct limits
- [ ] Razorpay webhook updates user to 'starter' tier
- [ ] API access blocked for free users

### User Flow Tests
- [ ] New user → Free tier → 30 compressions work
- [ ] Free user → hits limit → upgrade prompt appears
- [ ] Free user → checkout → payment → redirected to /compress
- [ ] Paid user → can access /compress directly
- [ ] Paid user → unlimited compressions work
- [ ] Paid user → 300 AI operations work

---

## Rollback Plan

If issues arise:

1. Revert frontend files to previous versions
2. Remove `tierConfig.ts`
3. Revert `tierMiddleware.ts`
4. The `normalizeTierName()` function is backward compatible, so existing data won't be affected

---

## Summary

This migration simplifies your pricing from 4 tiers to 2 tiers:

| Before | After |
|--------|-------|
| Free | Free |
| Starter ($9) | Starter ($9) |
| Pro ($19) | → maps to Starter |
| Business ($49) | → maps to Starter |

**Key Benefits:**
1. Simpler user decision (Free or Paid)
2. Less code to maintain
3. Clearer value proposition
4. $9/month is impulse purchase territory
5. Existing pro/business users get same features (no downgrade)
