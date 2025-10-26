# Dynamic Email URLs Fix

## Problem
All email templates (Welcome, Password Reset, Magic Link, News Summary) were hardcoded to use the old production URL: `https://stock-market-dev.vercel.app/`

This caused users who received emails to be redirected to the old domain instead of the new production domain: `https://stocks-signalist.vercel.app/`

## Solution
Replaced all hardcoded URLs with a dynamic `{{baseUrl}}` placeholder that gets replaced at runtime using the `NEXT_PUBLIC_BASE_URL` environment variable.

## Changes Made

### 1. Email Templates (`lib/nodemailer/templates.ts`)
Updated all templates to use `{{baseUrl}}` placeholder instead of hardcoded URLs:

- **WELCOME_EMAIL_TEMPLATE**:
  - Line 144: CTA button "Log In & Go to Dashboard"
  - Line 155: Footer link "Visit Signalist"
  
- **PASSWORD_RESET_TEMPLATE**:
  - Line 486: CTA button "View Dashboard"
  
- **MAGIC_LINK_TEMPLATE**:
  - Line 695: CTA button "View Dashboard"
  
- **NEWS_SUMMARY_EMAIL_TEMPLATE**:
  - Line 908: CTA button "View Dashboard"

### 2. Email Sender Functions (`lib/nodemailer/index.ts`)
Updated all email sending functions to inject the base URL dynamically:

```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
```

Then replace the placeholder in the template:
```typescript
.replace(/{{baseUrl}}/g, baseUrl)
```

**Updated Functions**:
- `sendWelcomeEmail()` - Welcome email after verification
- `sendNewsSummaryEmail()` - Daily market news summary
- `sendPasswordResetEmail()` - Password reset flow
- `sendMagicLinkEmail()` - Passwordless sign-in

## Environment Variables Required

### Development (`.env.local`)
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Production (Vercel)
**IMPORTANT**: You must update this in Vercel dashboard:

```env
NEXT_PUBLIC_BASE_URL=https://stocks-signalist.vercel.app
```

**Steps to Update in Vercel**:
1. Go to Vercel Dashboard → Your Project
2. Navigate to Settings → Environment Variables
3. Find `NEXT_PUBLIC_BASE_URL` (or add it if missing)
4. Set value to: `https://stocks-signalist.vercel.app`
5. Select "Production" environment
6. Click "Save"
7. Redeploy the application

## Verification

### Build Status
✅ Build completed successfully with no errors

### Old URLs Removed
✅ Searched codebase for `stock-market-dev.vercel.app` → 0 matches found

### Test Checklist (After Deployment)
- [ ] Sign up for a new account
- [ ] Verify email
- [ ] Receive welcome email
- [ ] Click "Log In & Go to Dashboard" button → Should go to `https://stocks-signalist.vercel.app/`
- [ ] Click "Visit Signalist" footer link → Should go to `https://stocks-signalist.vercel.app/`
- [ ] Test password reset email links
- [ ] Test magic link email links
- [ ] Test news summary email links (if applicable)

## Related Documentation
- [EMAIL_VERIFICATION_FIX_v2.md](./EMAIL_VERIFICATION_FIX_v2.md) - Email verification flow fixes
- [VERIFICATION_FIXES.md](./VERIFICATION_FIXES.md) - Better Auth verification implementation

## Notes
- All email templates now dynamically use the correct production URL
- No hardcoded URLs remain in the codebase
- Falls back to `http://localhost:3000` for local development
- **CRITICAL**: Remember to update `BETTER_AUTH_URL` in Vercel as well (see previous documentation)
