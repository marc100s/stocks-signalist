# Production Deployment Checklist

## Environment Variables

When deploying to production (Vercel, Netlify, etc.), ensure these environment variables are properly configured:

### Critical for Authentication & Emails

- [ ] `NODE_ENV=production`
- [ ] `BETTER_AUTH_URL` - Set to your production domain (e.g., `https://stocks-signalist.com`)
- [ ] `NEXT_PUBLIC_BASE_URL` - Set to your production domain
- [ ] `BETTER_AUTH_SECRET` - Use a strong secret (different from development)

### Database

- [ ] `MONGODB_URI` - Consider using a separate production database
- [ ] Ensure database has proper indexes for performance
- [ ] Backup strategy in place

### Email Configuration

- [ ] `NODEMAILER_EMAIL` - Gmail account for sending emails
- [ ] `NODEMAILER_PASSWORD` - Gmail app password (not regular password)
- [ ] Test email delivery in production environment

### API Keys

- [ ] `NEXT_PUBLIC_FINNHUB_API_KEY` - Production API key
- [ ] `GEMINI_API_KEY` - Production API key
- [ ] `INNGEST_EVENT_KEY` - Production event key

## Common Issues & Solutions

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

**Problem:** Can't connect to MongoDB in production

**Solutions:**
1. Verify `MONGODB_URI` is correct for production
2. Check MongoDB Atlas allows connections from your hosting provider's IPs
3. Consider using a separate production database cluster

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
