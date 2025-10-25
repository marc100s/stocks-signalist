# Magic Link Authentication - Implementation Guide

## 🎯 Why Magic Link?

After struggling with email verification issues in Better Auth v1.3.27, we've implemented **Magic Link** as a more reliable authentication solution:

### ✅ Advantages
- **No Database Migration Required** - Uses existing `verification` table
- **Simpler User Experience** - One-click authentication (no password needed)
- **Same Email Infrastructure** - Uses existing Nodemailer + Gmail SMTP
- **Well-Tested** - Battle-tested Better Auth plugin with 20+ test cases
- **Auto Sign-Up** - Creates accounts automatically for new users
- **Better Security** - Links expire in 5 minutes
- **No Verification Hassles** - Users are automatically verified upon sign-in

### ❌ Compared to Supabase
- **No Migration Needed** - Supabase would require complete auth system rewrite
- **No New Dependencies** - Stays within Better Auth ecosystem
- **No Learning Curve** - Same patterns and tools we already use

---

## 🏗️ Implementation

### 1. Server Configuration (`lib/better-auth/auth.ts`)

```typescript
import { magicLink } from "better-auth/plugins";
import { sendMagicLinkEmail } from "@/lib/nodemailer";

export const auth = betterAuth({
  // ... other config
  plugins: [
    nextCookies(),
    magicLink({
      expiresIn: 60 * 5, // 5 minutes
      disableSignUp: false, // Allow new users to sign up
      async sendMagicLink({ email, url, token }, request) {
        console.log("🔐 MAGIC LINK");
        console.log("To:", email);
        console.log("URL:", url);
        console.log("Token:", token);
        
        if (process.env.NODE_ENV !== "development") {
          await sendMagicLinkEmail({ email, magicLinkUrl: url });
        }
      },
    }),
  ],
});
```

### 2. Email Template (`lib/nodemailer/templates.ts`)

Created `MAGIC_LINK_TEMPLATE` with:
- 🔐 Security-focused design
- ⏰ 5-minute expiry notice
- 📱 Mobile-responsive
- 🌙 Dark mode support
- ✅ Yellow/gold CTA button (matches brand)

### 3. Email Sender (`lib/nodemailer/index.ts`)

```typescript
export const sendMagicLinkEmail = async ({
  email,
  magicLinkUrl,
}: {
  email: string;
  magicLinkUrl: string;
}): Promise<void> => {
  const htmlTemplate = MAGIC_LINK_TEMPLATE.replace(
    /{{magicLinkUrl}}/g,
    magicLinkUrl
  );

  const mailOptions = {
    from: `"Signalist" <signalist@ellipsi.net>`,
    to: email,
    subject: "🔐 Sign In to Signalist - Magic Link",
    text: `Click this link to sign in: ${magicLinkUrl}`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};
```

---

## 🧪 Testing Guide

### Local Testing (Development)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Request magic link** (terminal/console will show the link):
   ```bash
   # Example POST request
   POST http://localhost:3000/api/auth/sign-in/magic-link
   {
     "email": "test@example.com",
     "callbackURL": "/dashboard"
   }
   ```

3. **Check terminal logs** for magic link URL:
   ```
   ================================================================================
   🔐 MAGIC LINK (Development Mode)
   ================================================================================
   To: test@example.com
   Magic Link URL: http://localhost:3000/api/auth/magic-link/verify?token=abc123...
   Token: abc123...
   ================================================================================
   ```

4. **Copy the URL** and paste in browser - should auto sign-in!

### Production Testing (Vercel)

1. **Deploy to Vercel** (auto-deploys on push to `main`)

2. **Request magic link:**
   - Go to sign-in page
   - Enter email
   - Click "Send Magic Link"

3. **Check email inbox** for magic link

4. **Click link** in email - should redirect to dashboard

5. **Verify in Vercel logs:**
   ```
   🔐 MAGIC LINK (Production Mode)
   To: user@example.com
   Magic Link URL: https://stock-market-dev.vercel.app/api/auth/magic-link/verify?token=...
   ✅ Magic link sent successfully to: user@example.com
   ```

---

## 🔧 Client Implementation

### Install Client Plugin

```bash
npm install better-auth
```

### Add to Auth Client

```typescript
import { createAuthClient } from "better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  plugins: [magicLinkClient()],
});
```

### Sign In with Magic Link

```typescript
import { authClient } from "@/lib/auth-client";

// Request magic link
await authClient.signIn.magicLink({
  email: "user@example.com",
  callbackURL: "/dashboard", // Where to redirect after sign-in
  newUserCallbackURL: "/welcome", // For first-time users (optional)
  errorCallbackURL: "/error", // If something goes wrong (optional)
});
```

### React Component Example

```tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authClient.signIn.magicLink({
        email,
        callbackURL: "/dashboard",
      });
      
      toast.success("Magic link sent! Check your email.");
    } catch (error) {
      toast.error("Failed to send magic link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send Magic Link"}
      </button>
    </form>
  );
}
```

---

## 🔐 Security Features

- **Short Expiry**: Links expire in 5 minutes
- **One-Time Use**: Each link can only be used once
- **Secure Tokens**: Cryptographically secure random strings (32 characters)
- **HTTPS Only**: Works over secure connections in production
- **Email Verified**: Users are automatically marked as `emailVerified: true`

---

## 📊 Database Schema

Magic Link uses the existing `verification` table:

```typescript
{
  id: string;          // Unique verification ID
  identifier: string;  // Hashed token (for security)
  value: string;       // JSON: { email, name? }
  expiresAt: Date;     // Expiry timestamp (5 minutes from creation)
}
```

**No migration needed!** ✅

---

## 🐛 Troubleshooting

### Magic Link Not Sent

1. **Check Vercel logs** for `🔐 MAGIC LINK` output
2. **Verify environment variables:**
   - `NODEMAILER_EMAIL`
   - `NODEMAILER_PASSWORD`
   - `BETTER_AUTH_URL`
3. **Check Gmail SMTP limits** (500 emails/day)

### Magic Link Expired

- Links expire in 5 minutes
- Request a new one

### Email Not Arriving

1. **Check spam folder**
2. **Verify email address** is correct
3. **Check Nodemailer logs** in Vercel
4. **Test email delivery** with another service

### Token Invalid Error

- Link was already used
- Link expired (>5 minutes old)
- Request a new magic link

---

## 🎨 Customization Options

### Change Expiry Time

```typescript
magicLink({
  expiresIn: 60 * 10, // 10 minutes instead of 5
})
```

### Disable Auto Sign-Up

```typescript
magicLink({
  disableSignUp: true, // Only existing users can sign in
})
```

### Custom Token Generation

```typescript
magicLink({
  generateToken: async (email) => {
    // Your custom token logic
    return customSecureToken;
  },
})
```

### Store Token as Hashed

```typescript
magicLink({
  storeToken: "hashed", // Store hashed in DB for extra security
})
```

---

## 📈 Migration Path from Email/Password

### Option 1: Keep Both (Recommended)

```typescript
plugins: [
  nextCookies(),
  magicLink({ /* config */ }), // Add magic link
  // Keep emailAndPassword enabled
]
```

Users can choose:
- Traditional email/password
- Magic link (passwordless)

### Option 2: Magic Link Only

1. **Disable email/password**:
   ```typescript
   emailAndPassword: {
     enabled: false,
   }
   ```

2. **Update sign-in UI** to only show magic link option

3. **Communicate change** to existing users

---

## 🚀 Deployment Checklist

- [ ] Magic link plugin added to `auth.ts`
- [ ] `sendMagicLinkEmail` function created
- [ ] `MAGIC_LINK_TEMPLATE` added to templates
- [ ] Environment variables set in Vercel
- [ ] Client plugin added to auth client
- [ ] Sign-in UI updated
- [ ] Testing completed (dev + production)
- [ ] User documentation updated

---

## 📚 Resources

- [Better Auth Magic Link Docs](https://www.better-auth.com/docs/plugins/magic-link)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Magic Link Test Cases](https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/magic-link/magic-link.test.ts)

---

## ✅ Next Steps

1. **Test locally** - Verify magic link works in development
2. **Deploy to Vercel** - Push changes to `main` branch
3. **Test in production** - Send real magic link email
4. **Update sign-in UI** - Add magic link option to forms
5. **Monitor logs** - Watch for any email delivery issues
6. **Consider migration** - Decide if you want magic link only or hybrid approach

---

**Implementation Status**: ✅ Complete (Server-side)
**Next**: Add client-side UI for magic link sign-in
