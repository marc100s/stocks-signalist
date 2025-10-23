# Production Deployment Checklist

Complete guide for deploying Stocks Signalist to production (Vercel recommended).

---

## Table of Contents

- [Environment Variables](#environment-variables)
- [Database Configuration](#database-configuration)
- [Vercel Deployment Steps](#vercel-deployment-steps)
- [Common Issues & Solutions](#common-issues--solutions)
- [Testing Checklist](#testing-checklist)
- [Post-Deployment Monitoring](#post-deployment-monitoring)

---

## Environment Variables

When deploying to production, configure these environment variables in your hosting platform's dashboard.

### Critical for Authentication & Emails

```bash
NODE_ENV=production

# Must use your production domain (no trailing slash)
BETTER_AUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Generate new secret for production: openssl rand -base64 32
BETTER_AUTH_SECRET=your_production_secret_here
```

⚠️ **Important:** 
- Use the **same URL** for both `BETTER_AUTH_URL` and `NEXT_PUBLIC_BASE_URL`
- Use your **custom domain** if you have one, otherwise use the Vercel-provided domain
- **No trailing slash** at the end of URLs
- Generate a **new secret** for production (don't reuse development secret)

### Database Configuration

```bash
# CRITICAL: Include database name in the connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority&appName=Cluster0
```

**Important Database Notes:**

1. **Always specify a database name** in the URI (e.g., `/signalist_prod`)
2. **Without a database name, MongoDB defaults to the `test` database** - this is a common mistake!
3. The database name goes AFTER the cluster address and BEFORE the ? query parameters
4. Better Auth uses **singular** collection names:
   - `user` (not `users`)
   - `account` (not `accounts`)
   - `session` (not `sessions`)
   - `verification` (not `verifications`)

**Recommended Setup:**
- Development: `mongodb+srv://user:pass@cluster.mongodb.net/signalist_dev?options`
- Production: `mongodb+srv://user:pass@cluster.mongodb.net/signalist_prod?options`

**Verify Your Configuration:**
```bash
# Check database configuration and connection
npm run db:check-config

# List collections in your database
npm run db:list-collections
```

### Email Configuration

```bash
NODEMAILER_EMAIL=your_email@gmail.com
NODEMAILER_PASSWORD=your_16_character_app_password
```

**Getting Gmail App Password:**
1. Enable 2-Factor Authentication on Gmail
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Use this 16-character password (not your regular Gmail password)

### API Keys

```bash
# Stock Market Data (Required)
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key

# AI Features (Optional)
GEMINI_API_KEY=your_gemini_api_key

# Event Processing (Optional)
INNGEST_EVENT_KEY=your_inngest_event_key
```

---

## Database Configuration

### Setting Up Production Database

**Option 1: Separate Production Database (Recommended)**

Create a dedicated database for production:
```
Development: mongodb://...cluster.mongodb.net/signalist_dev
Production:  mongodb://...cluster.mongodb.net/signalist_prod
```

Benefits:
- Isolate test data from production
- Easier to reset development data
- Better security and monitoring

**Option 2: Single Database**

If using one database:
- Be careful not to mix development and production data
- Run `npm run db:clear-users` before going live
- Consider environment-specific collections

### MongoDB Atlas Configuration

1. **Whitelist Vercel IPs:**
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allow all) for Vercel
   - Or use Vercel's specific IP ranges

2. **Create Database User:**
   - Strong password (avoid special characters that need URL encoding)
   - Read and write permissions

3. **Connection String Format:**
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DATABASE_NAME?options
   ```

---

## Vercel Deployment Steps

### 1. Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

### 3. Configure Environment Variables

In Vercel Dashboard → **Settings** → **Environment Variables**:

Click **"Add New"** and add each variable:

| Key | Value | Environment |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` | Production |
| `NEXT_PUBLIC_BASE_URL` | `https://your-app.vercel.app` | Production |
| `BETTER_AUTH_SECRET` | `your_secret` | Production |
| `MONGODB_URI` | `mongodb+srv://...` | Production |
| `NODEMAILER_EMAIL` | `your@gmail.com` | Production |
| `NODEMAILER_PASSWORD` | `app_password` | Production |
| `NEXT_PUBLIC_FINNHUB_API_KEY` | `your_key` | Production |

💡 **Tip:** You can also set variables for Development/Preview environments separately.

### 4. Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Vercel will provide a deployment URL

### 5. Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_BASE_URL` to use custom domain
5. Redeploy

---

## Common Issues & Solutions

### 1. Email Links Point to Localhost

**Symptom:** Password reset or verification emails contain `http://localhost:3000` URLs

**Root Cause:** `BETTER_AUTH_URL` not set or pointing to localhost

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Set `BETTER_AUTH_URL` to your production domain (e.g., `https://your-app.vercel.app`)
3. Ensure `NODE_ENV=production`
4. Redeploy the application

### 2. Build Fails with "Cannot apply unknown utility class"

**Symptom:** 
```
Error: Cannot apply unknown utility class `focus:`
CssSyntaxError: tailwindcss: /vercel/path0/app/globals.css
```

**Root Cause:** Invalid Tailwind CSS syntax with spaces between modifiers and classes

**Solution:**
- Ensure no spaces in modifier syntax:
  - ❌ Wrong: `focus: !border-yellow-500`
  - ✅ Correct: `focus:!border-yellow-500`
- Check `app/globals.css` for proper syntax
- Build locally first: `npm run build`

### 3. Users Can't Sign In After Password Reset

**Symptom:** "Email not verified" error after successful password reset

**Root Cause:** Old user accounts created before email verification was implemented

**Solution:**
1. Clear all users from database:
   ```bash
   npm run db:clear-users
   ```
2. Or manually delete users from MongoDB Atlas
3. Have users create new accounts
4. New accounts will have proper `emailVerified` status

### 4. Database Connection Issues

**Symptom:** Can't connect to MongoDB in production

**Common Causes & Solutions:**

**a) Missing Database Name (MOST COMMON ISSUE):**
```bash
# ❌ Wrong - defaults to 'test' database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?options

# ❌ Also wrong - no database name
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net?options

# ✅ Correct - specifies database name
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/signalist_prod?options
```

**How to identify this issue:**
- Check MongoDB Atlas → Browse Collections
- If you see a database named "test" with your data, this is the problem
- Your users and collections are in the wrong database

**How to fix:**
1. Add database name to your `MONGODB_URI` (between cluster address and ?)
2. Run `npm run db:check-config` to verify configuration
3. Old data will remain in the `test` database
4. Options:
   - Start fresh (recommended): Users re-register in the correct database
   - Migrate data: Use MongoDB Atlas data migration tools

**b) IP Whitelist:**
- MongoDB Atlas → Network Access
- Add `0.0.0.0/0` to allow Vercel connections
- Or whitelist specific Vercel IP ranges

**c) Wrong Credentials:**
- Verify username and password are correct
- Check for special characters that need URL encoding
- Test connection string in MongoDB Compass or with `npm run db:check-config`

### 5. Email Verification Not Working

**Symptom:** Users not receiving verification emails

**Solutions:**

1. **Check Gmail App Password:**
   - Must be 16-character app password (not regular password)
   - Regenerate if needed

2. **Verify Environment Variables:**
   ```bash
   NODEMAILER_EMAIL=correct_email@gmail.com
   NODEMAILER_PASSWORD=16_char_app_password
   ```

3. **Check Spam Folder:**
   - Emails might be marked as spam
   - Add sender to safe list

4. **Production Mode Check:**
   - Ensure `NODE_ENV=production`
   - Development mode only logs to console

### 6. 404 Error on Password Reset Link

**Symptom:** Clicking reset link shows 404 page

**Root Cause:** Missing Better Auth API route

**Solution:**
Ensure `/app/api/auth/[...all]/route.ts` exists with:
```typescript
import { auth } from "@/lib/better-auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### 7. Wrong Database Collections

**Symptom:** Users created but not showing in expected database

**Root Cause:** Better Auth uses singular collection names

**Check These Collections:**
- `user` (not `users`)
- `account` (not `accounts`)  
- `session` (not `sessions`)
- `verification` (not `verifications`)

**Also check database name in connection string!**

### 8. Users Created in 'test' Database Instead of Named Database

**For complete troubleshooting guide, see [MongoDB Configuration Guide](./docs/MONGODB_CONFIGURATION.md)**

**Symptom:** 
- Users are being created in MongoDB's default 'test' database
- Your application can't find users even though they exist in MongoDB Atlas

**Root Cause:** 
MongoDB URI missing database name, causing MongoDB to use the default 'test' database

**How to Identify:**
```bash
# Run the database configuration checker
npm run db:check-config
```

This will show:
- Which database you're connected to
- Whether database name is in the URI
- What collections exist and where

**Solution:**

1. **Update your MongoDB URI** to include the database name:
   ```bash
   # Add your database name between cluster address and query parameters
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/YOUR_DB_NAME?options
   ```

2. **Verify the configuration:**
   ```bash
   npm run db:check-config
   ```

3. **Choose how to handle existing data:**

   **Option A - Start Fresh (Recommended):**
   - Delete users from the 'test' database in MongoDB Atlas
   - Or ignore them - they won't be accessed once URI is fixed
   - Have users re-register (they'll be created in the correct database)

   **Option B - Migrate Data:**
   - Use MongoDB Atlas data migration tools
   - Export from 'test' database, import to your named database
   - More complex but preserves existing user data

4. **Update environment variables in Vercel:**
   - Go to Vercel → Settings → Environment Variables
   - Update `MONGODB_URI` with the correct database name
   - Redeploy the application

**Prevention:**
- Always include database name in `MONGODB_URI`
- Use the `.env.example` file as a reference
- Run `npm run db:check-config` before deploying
- Use separate databases for dev and prod (e.g., `signalist_dev`, `signalist_prod`)

**Understanding the Issue:**
MongoDB's connection string format is:
```
mongodb+srv://username:password@cluster.mongodb.net/DATABASE_NAME?options
                                                               ^^^^^^^^^^^^
                                                               This part is crucial!
```

Without the database name:
- MongoDB connects successfully (no error)
- But uses the default 'test' database
- Your data ends up in the wrong place
- Application can't find users/data

---

## Testing Checklist

Before launching to production, test these critical flows:

### Authentication Flow

- [ ] **Sign Up:**
  - [ ] Form validation works
  - [ ] User receives verification email
  - [ ] Email contains correct production URL
  - [ ] Verification link works
  - [ ] User is created in correct database

- [ ] **Sign In:**
  - [ ] Verified users can sign in
  - [ ] Unverified users are blocked (production mode)
  - [ ] Wrong credentials show error toast
  - [ ] Sessions persist correctly

- [ ] **Password Reset:**
  - [ ] Request reset email
  - [ ] Email contains correct production URL
  - [ ] Reset link works (not 404)
  - [ ] Can set new password
  - [ ] Can sign in with new password
  - [ ] Old password no longer works

- [ ] **Account Settings:**
  - [ ] Can access settings page
  - [ ] Can change password
  - [ ] Current password required
  - [ ] Toast notifications work

### Email Functionality

- [ ] **Email Delivery:**
  - [ ] Emails arrive within 1-2 minutes
  - [ ] Not in spam folder
  - [ ] Formatting looks correct
  - [ ] Links are clickable
  - [ ] Branding is correct

- [ ] **Email URLs:**
  - [ ] Verification links point to production domain
  - [ ] Password reset links point to production domain
  - [ ] No `localhost` URLs in emails

### Database

- [ ] **Connection:**
  - [ ] App connects to correct database
  - [ ] Collections are created properly
  - [ ] Data persists between deployments

- [ ] **Data Integrity:**
  - [ ] Users are saved correctly
  - [ ] Sessions work across page reloads
  - [ ] Watchlists persist
  - [ ] Alerts are stored properly

### UI/UX

- [ ] **Navigation:**
  - [ ] Protected routes redirect to sign-in
  - [ ] Auth routes redirect to dashboard when signed in
  - [ ] Middleware works correctly

- [ ] **Notifications:**
  - [ ] Toast messages appear correctly
  - [ ] Positioned at top-center
  - [ ] Readable text and colors
  - [ ] Auto-dismiss after timeout

- [ ] **Responsive Design:**
  - [ ] Works on mobile
  - [ ] Works on tablet
  - [ ] Works on desktop

---

## Post-Deployment Monitoring

### Immediate Checks (First Hour)

1. **Authentication:**
   - Monitor sign-up success rate
   - Check for authentication errors in logs
   - Verify email delivery

2. **Database:**
   - Connection stability
   - Query performance
   - Collection structure

3. **Email Service:**
   - Delivery success rate
   - Bounce rate
   - Check spam reports

### Ongoing Monitoring

**Vercel Dashboard:**
- Build success rate
- Deployment frequency
- Error logs
- Performance metrics

**MongoDB Atlas:**
- Connection count
- Query performance
- Storage usage
- Backup status

**Email (Gmail):**
- Daily send limits (500/day for free Gmail)
- Bounce rate
- Delivery issues

### Key Metrics to Track

- User sign-up rate
- Email verification rate
- Password reset requests
- Authentication errors
- API rate limits
- Database query times
- Email delivery success rate

---

## Rollback Plan

If critical issues occur after deployment:

### Quick Rollback (Vercel)

1. Go to Vercel Dashboard → Deployments
2. Find the last stable deployment
3. Click **"..."** menu → **"Promote to Production"**
4. Previous version is now live

### Environment Variable Rollback

1. Keep a backup of working environment variables
2. If new values cause issues, revert to previous values
3. Redeploy with old values

### Database Rollback

1. Have regular backups (MongoDB Atlas automatic backups)
2. Can restore to point-in-time if needed
3. Document all database changes before deployment

### Communication Plan

- Notify users of any downtime
- Provide status updates
- Document issues for post-mortem

---

## Production Maintenance

### Regular Tasks

**Daily:**
- Check error logs
- Monitor email delivery
- Review authentication metrics

**Weekly:**
- Database backup verification
- Performance review
- Security updates

**Monthly:**
- Update dependencies
- Review and rotate secrets
- Analyze usage patterns
- Cost optimization

### Security Best Practices

- Rotate `BETTER_AUTH_SECRET` periodically
- Use different secrets for dev/prod
- Keep dependencies updated
- Monitor for security advisories
- Use environment-specific API keys
- Enable MongoDB Atlas monitoring

---

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Nodemailer Documentation](https://nodemailer.com/about/)

---

## Support

If you encounter issues not covered here:

1. Check [GitHub Issues](https://github.com/marc100s/stocks-signalist/issues)
2. Review Vercel deployment logs
3. Check MongoDB Atlas logs
4. Create a new issue with detailed error messages

---

**Last Updated:** October 2025  
**Deployment Platform:** Vercel  
**Database:** MongoDB Atlas  
**Authentication:** Better Auth
