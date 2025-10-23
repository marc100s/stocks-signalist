# MongoDB Configuration Quick Reference

## The 'test' Database Issue

### What Happens

When you don't specify a database name in your MongoDB connection string, MongoDB automatically uses a database called 'test'. This is MongoDB's default behavior and causes your application data to be stored in the wrong place.

### Why It's a Problem

1. **Your application expects a named database** but MongoDB is using 'test'
2. **Data isolation fails** - dev and prod data might mix
3. **Hard to debug** - connection succeeds, but data is in the wrong place
4. **Users can't sign in** - the app looks in the configured database, but users are in 'test'

### How to Identify

Run the configuration checker:
```bash
npm run db:check-config
```

You'll see warnings like:
- "No database name specified in MONGODB_URI"
- "You are using the 'test' database"
- "Database name mismatch"

Or check MongoDB Atlas → Browse Collections:
- If you see a database named "test" with your collections, you have this issue

### The Fix

**Step 1: Update your MongoDB URI**

Add your database name between the cluster address and the `?` query parameters:

```bash
# ❌ Wrong - no database name
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?options

# ❌ Also wrong - still no database name
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net?options

# ✅ Correct - includes database name
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/YOUR_DB_NAME?options
```

**Examples:**
- Development: `mongodb+srv://user:pass@cluster.mongodb.net/signalist_dev?retryWrites=true&w=majority`
- Production: `mongodb+srv://user:pass@cluster.mongodb.net/signalist_prod?retryWrites=true&w=majority`

**Step 2: Verify the fix**

```bash
npm run db:check-config
```

This should now show:
- ✓ Database name is in the URI
- ✓ Connected to your named database (not 'test')

**Step 3: Handle existing data**

You have two options:

**Option A - Start Fresh (Recommended)**
- Leave the old data in 'test' database (it won't be accessed)
- Or delete it manually from MongoDB Atlas
- Have users re-register (they'll be created in the correct database)

**Option B - Migrate Data**
- Use MongoDB Atlas tools to export from 'test' and import to your named database
- More complex but preserves existing user data

**Step 4: Update deployment**

If you're using Vercel or another hosting platform:
1. Update the `MONGODB_URI` environment variable
2. Make sure it includes your database name
3. Redeploy the application

### Prevention Checklist

Before deploying:
- [ ] Check `.env` file has database name in `MONGODB_URI`
- [ ] Run `npm run db:check-config` to verify
- [ ] Use separate databases for dev and prod
- [ ] Add database name validation to your CI/CD pipeline

### URI Format Reference

```
mongodb+srv://username:password@cluster.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
                                                      ^^^^^^^^^^^^
                                                      This is required!
```

**Parts breakdown:**
- `mongodb+srv://` - Protocol
- `username:password` - Credentials (from MongoDB Atlas)
- `@cluster.mongodb.net` - Your cluster address
- `/DATABASE_NAME` - **YOUR DATABASE NAME** (required!)
- `?retryWrites=true&w=majority` - Options

## Better Auth Collections

Better Auth uses **singular** collection names:

| Collection | Purpose | Note |
|------------|---------|------|
| `user` | User accounts | NOT `users` |
| `account` | Auth providers | NOT `accounts` |
| `session` | User sessions | NOT `sessions` |
| `verification` | Email verification | NOT `verifications` |

If you see plural names (`users`, `accounts`, etc.), they're not being used by Better Auth.

## Helpful Commands

```bash
# Check database configuration
npm run db:check-config

# List collections in your database
npm run db:list-collections

# Clear all users (development only)
npm run db:clear-users

# Test database connection
npm run test:db
```

## Common Errors

### "Can't find users even though they exist"
- Check if users are in 'test' database
- Update `MONGODB_URI` to include database name

### "Email not verified" after password reset
- Old users from before verification was implemented
- Clear database and have users re-register

### "Connection successful but no data"
- Data is in 'test', app is looking in named database
- Fix `MONGODB_URI` or migrate data

## Need More Help?

- See [DEPLOYMENT.md](../DEPLOYMENT.md) for full deployment guide
- See [README.md](../README.md) for general setup
- Check [GitHub Issues](https://github.com/marc100s/stocks-signalist/issues)
