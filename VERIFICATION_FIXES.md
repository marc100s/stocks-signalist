# URGENT: Fix Vercel Environment Variables

## Problem 1: Wrong Base URL ❌

Your Vercel logs show:
```
Verification URL: https://stock-market-dev.vercel.app/api/auth/verify-email?token=...
```

This is **WRONG**! It should be:
```
https://stocks-signalist.vercel.app/verify-email?token=...
```

## Fix in Vercel Dashboard

1. Go to: https://vercel.com/marc100s-projects/stocks-signalist/settings/environment-variables

2. Find `BETTER_AUTH_URL` variable

3. **Update it from:**
   ```
   https://stock-market-dev.vercel.app
   ```

4. **To:**
   ```
   https://stocks-signalist.vercel.app
   ```

5. Click "Save"

6. **Redeploy** your app:
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

## Problem 2: Welcome Email Sent Before Verification ❌

### What Was Wrong

The Inngest welcome email was being sent **immediately** after sign-up, even before email verification.

### What I Fixed

1. **Created `UserProfile` model** to store sign-up data temporarily
2. **Modified `signUpWithEmail`** to save profile data without triggering Inngest
3. **Updated Better Auth callback** `onEmailVerification` to:
   - Trigger Inngest `app/user.created` event **ONLY after verification**
   - Clean up temporary profile data

### New Flow

1. User signs up → Profile data saved to `UserProfile` collection
2. Verification email sent
3. User clicks link → Email verified
4. `onEmailVerification` callback fires:
   - Fetches profile from `UserProfile`
   - Sends Inngest event → Welcome email triggered
   - Deletes temporary profile data
5. ✅ User receives welcome email ONLY after verification!

## Testing

### Development

```bash
# Sign up locally
npm run dev
# Go to http://localhost:3000/sign-up
# Fill form and submit
# Copy verification URL from console
# Paste in browser
# Check logs for: "✅ Welcome email triggered for verified user"
```

### Production (After Vercel Fix)

1. Deploy the changes:
   ```bash
   git add .
   git commit -m "fix: send welcome email only after verification + correct baseURL"
   git push
   ```

2. Update `BETTER_AUTH_URL` in Vercel (see above)

3. Test:
   - Go to https://stocks-signalist.vercel.app/sign-up
   - Sign up with real email
   - **Check inbox for verification email only** (no welcome email yet)
   - Click verification link
   - **Now check inbox for welcome email** (should arrive after verification)

## Expected Vercel Logs After Fix

### Sign-Up
```
📧 EMAIL VERIFICATION (Production Mode)
To: test@example.com
Verification URL: https://stocks-signalist.vercel.app/verify-email?token=...
✅ Verification email sent
✅ User signed up, profile saved. Awaiting email verification.
```

### After Click Verification Link
```
✅ Email verified successfully for: test@example.com
✅ Welcome email triggered for verified user: test@example.com
[Inngest] sign-up-email function running...
```

## Database Collections

After these changes, you'll have:

1. **`user`** - Better Auth's user collection
   - `emailVerified: false` initially
   - `emailVerified: true` after verification

2. **`userprofile`** (NEW) - Temporary profile data
   - Created on sign-up
   - Deleted after verification + welcome email sent

3. **`verification`** - Better Auth's verification tokens
   - Created when verification email sent
   - Validated and deleted when user clicks link

## Verification Token Issue

Your log said: "the db verification folder, there's nothing in there"

This is **normal** and **correct**! Here's why:

- Better Auth stores verification tokens in memory or with a short TTL
- After the token is verified, it's immediately deleted
- Tokens should NOT persist in the database after verification
- Check the `user` collection → `emailVerified` field should be `true`

If `emailVerified` is still `false` after clicking the link, that's because:
1. The link URL was wrong (old domain issue - now fixed)
2. Or the GET vs POST issue (already fixed in previous commit)

## Summary of All Fixes

| Issue | Status | Solution |
|-------|--------|----------|
| Welcome email sent before verification | ✅ Fixed | Moved Inngest trigger to `onEmailVerification` callback |
| Wrong base URL in verification emails | ⚠️  **ACTION REQUIRED** | Update `BETTER_AUTH_URL` in Vercel to `https://stocks-signalist.vercel.app` |
| Verification page using POST instead of GET | ✅ Fixed | Already fixed in previous commit |
| No data in verification collection | ✅ Expected | Tokens are ephemeral; check `user.emailVerified` instead |

## Next Steps

1. ✅ Code is fixed - commit and push
2. ⚠️  **Update Vercel env var** (see top of this doc)
3. ✅ Redeploy
4. ✅ Test end-to-end flow
5. ✅ Verify logs show correct URL and timing

---

**CRITICAL**: Don't forget to update `BETTER_AUTH_URL` in Vercel! Without this, verification links will still point to the wrong domain.
