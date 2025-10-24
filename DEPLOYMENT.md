# Production Deployment Checklist

## Environment Variables

When deploying to production (Vercel, Netlify, etc.), ensure these environment variables are properly configured:

### Critical for Authentication & Emails

- [ ] `NODE_ENV=production` - Vercel sets this automatically, **do not override**
- [ ] `BETTER_AUTH_URL` - **CRITICAL:** Set to your actual production domain
  - ❌ Wrong: `https://your-production-domain.com` (placeholder)
  - ✅ Right: `https://stock-market-dev.vercel.app` (or your actual domain)
  - This is used for email verification and password reset links
- [ ] `NEXT_PUBLIC_BASE_URL` - Set to your production domain (same as BETTER_AUTH_URL)
- [ ] `BETTER_AUTH_SECRET` - Use a strong secret (different from development)

### Database

- [ ] `MONGODB_URI` - **CRITICAL: Must include database name in connection string**
  - Correct format: `mongodb+srv://user:pass@cluster.mongodb.net/SignalisticsDB?retryWrites=true&w=majority`
  - ❌ Wrong: `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority` (defaults to 'test' database)
  - ✅ Right: `mongodb+srv://user:pass@cluster.mongodb.net/SignalisticsDB?retryWrites=true&w=majority`
- [ ] Use separate production database (recommended: `SignalisticsDB`)
- [ ] Ensure database has proper indexes for performance
- [ ] Backup strategy in place
- [ ] **Note:** Better Auth uses singular collection names: `user`, `account`, `session`, `verification` (not plural)

### Email Configuration

- [ ] `NODEMAILER_EMAIL` - Gmail account for sending emails
- [ ] `NODEMAILER_PASSWORD` - Gmail app password (not regular password)
- [ ] Test email delivery in production environment

### API Keys

- [ ] `NEXT_PUBLIC_FINNHUB_API_KEY` - Production API key
- [ ] `GEMINI_API_KEY` - Production API key
- [ ] `INNGEST_EVENT_KEY` - Production event key

## Common Issues & Solutions

### Database Migration from 'test' to 'SignalisticsDB'

**If you previously had users in the 'test' database:**

1. **Migration completed:** Watchlists have been migrated to `SignalisticsDB`
2. **User accounts:** Existing users will need to re-register (old accounts in 'test' database won't work)
3. **Watchlists preserved:** All 7 watchlists successfully copied to new database
4. **Collections structure:** Better Auth will create: `user`, `account`, `session`, `verification` (singular names)

**To verify migration:**
```bash
# Check SignalisticsDB has watchlists
MONGODB_URI="your-connection-string/SignalisticsDB?options" npx tsx scripts/list-collections.ts
```

**Clean up old test database (optional):**
```bash
# After confirming SignalisticsDB works in production
# You can drop the 'test' database from MongoDB Atlas UI
```

### Email Reset Links Point to Localhost

**Problem:** Password reset or verification emails contain `http://localhost:3000` URLs

**Solution:**
1. Set `BETTER_AUTH_URL` to your production domain in your hosting platform's environment variables
2. Set `NODE_ENV=production`
3. Redeploy the application

### Email Verification Not Working

**Problem:** Users not receiving verification emails or emails going to spam

**Solutions:**
1. Verify `NODEMAILER_EMAIL` and `NODEMAILER_PASSWORD` are correct
2. Use a Gmail app password, not your regular password
3. Check spam folder
4. Consider using a dedicated email service (SendGrid, AWS SES) for production

### Database Connection Issues

**Problem:** Can't connect to MongoDB in production or users ending up in wrong database

**Solutions:**
1. **CRITICAL:** Verify `MONGODB_URI` includes the database name: `/SignalisticsDB?` in the URL
2. Check MongoDB Atlas allows connections from your hosting provider's IPs (add `0.0.0.0/0` for Vercel)
3. Use separate production database cluster for better isolation
4. Better Auth creates collections automatically: `user`, `account`, `session`, `verification` (all singular)
5. If you migrated from 'test' database, ensure all watchlists data was copied

**How to verify correct database:**
```bash
# Run list-collections script to check which database is being used
npx tsx scripts/list-collections.ts
```

## Testing Before Launch

- [ ] Sign up with a new account and verify email delivery
- [ ] Test password reset flow with production URL
- [ ] Verify all emails contain correct production URLs
- [ ] Test sign in/sign out functionality
- [ ] Check that user sessions persist correctly
- [ ] Verify middleware redirects work as expected

## Monitoring

After deployment, monitor:
- Email delivery success rate
- Authentication errors in logs
- Database connection stability
- API rate limits and usage

## Rollback Plan

If issues occur:
1. Keep previous environment variable values
2. Have database backup ready
3. Document all changes made during deployment
4. Be prepared to revert `BETTER_AUTH_URL` if needed
