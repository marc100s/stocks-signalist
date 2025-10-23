# Stocks Signalist 📈

A modern web application for tracking stock signals, managing watchlists, and receiving real-time alerts to make informed investment decisions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

---

## Table of Contents

- [Stocks Signalist 📈](#stocks-signalist-)
  - [Table of Contents](#table-of-contents)
  - [About The Project](#about-the-project)
  - [Key Features](#key-features)
    - [📊 **Market Analysis**](#-market-analysis)
    - [📝 **Watchlist Management**](#-watchlist-management)
    - [🔔 **Alert System**](#-alert-system)
    - [🔐 **Authentication \& Security**](#-authentication--security)
    - [🎨 **User Experience**](#-user-experience)
  - [Built With](#built-with)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Environment Variables](#environment-variables)
    - [Required Variables](#required-variables)
    - [Optional Variables](#optional-variables)
    - [Environment-Specific Configuration](#environment-specific-configuration)
    - [Getting API Keys](#getting-api-keys)
  - [Authentication Features](#authentication-features)
    - [Email Verification](#email-verification)
    - [Password Reset](#password-reset)
    - [Account Management](#account-management)
  - [Scripts](#scripts)
  - [Deployment](#deployment)
    - [Deploy to Vercel](#deploy-to-vercel)
  - [Contributing](#contributing)
    - [How to Contribute](#how-to-contribute)
    - [Development Guidelines](#development-guidelines)
  - [License](#license)
  - [Contact](#contact)
  - [Acknowledgments](#acknowledgments)
  - [Project Structure](#project-structure)

---

## About The Project

**Stocks Signalist** is a comprehensive stock market tracking platform built with [Next.js](https://nextjs.org/). It provides users with real-time market data, personalized watchlists, and intelligent alerts to help make informed investment decisions. The application features secure authentication, email verification, password management, and a modern dark-themed interface.

---

## Key Features

### 📊 **Market Analysis**
* **Real-time Stock Data:** Live price updates powered by Finnhub API
* **Interactive Charts:** TradingView widget integration for advanced technical analysis
* **Company Profiles:** Detailed information about stocks and companies
* **Market News:** AI-powered news summaries and market insights

### 📝 **Watchlist Management**
* **Custom Watchlists:** Create and manage personalized stock watchlists
* **Quick Actions:** Add/remove stocks with a single click
* **Portfolio Tracking:** Monitor your selected stocks in one place

### 🔔 **Alert System**
* **Price Alerts:** Set custom alerts for price targets
* **Email Notifications:** Receive alerts via email when conditions are met
* **Alert Management:** Easy-to-use interface for creating and managing alerts

### 🔐 **Authentication & Security**
* **Email/Password Authentication:** Secure sign-up and sign-in with Better Auth
* **Email Verification:** Verify user accounts via email (production mode)
* **Password Reset:** Complete password recovery flow with secure tokens
* **Account Settings:** Change password and manage account preferences
* **Session Management:** Secure session handling with cookies

### 🎨 **User Experience**
* **Dark Mode Interface:** Modern, eye-friendly dark theme
* **Responsive Design:** Optimized for desktop and mobile devices
* **Toast Notifications:** Clear feedback for user actions
* **Search Functionality:** Quick stock search with autocomplete

---

## Built With

This project leverages a modern tech stack for optimal performance and developer experience:

**Frontend:**
* **[Next.js 15.5](https://nextjs.org/)** - React framework with App Router
* **[React 19](https://reactjs.org/)** - UI library
* **[TypeScript 5.9](https://www.typescriptlang.org/)** - Type-safe JavaScript
* **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
* **[Shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
* **[TradingView Widgets](https://www.tradingview.com/)** - Professional charting

**Backend & Database:**
* **[MongoDB](https://www.mongodb.com/)** - NoSQL database via MongoDB Atlas
* **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling
* **[Better Auth](https://www.better-auth.com/)** - Modern authentication library

**APIs & Services:**
* **[Finnhub API](https://finnhub.io/)** - Real-time stock market data
* **[Google Gemini](https://deepmind.google/technologies/gemini/)** - AI-powered news analysis
* **[Inngest](https://www.inngest.com/)** - Event-driven workflows
* **[Nodemailer](https://nodemailer.com/)** - Email delivery (Gmail SMTP)

**Development Tools:**
* **[React Hook Form](https://react-hook-form.com/)** - Form handling
* **[Zod](https://zod.dev/)** - Schema validation
* **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
* **[Lucide Icons](https://lucide.dev/)** - Icon library

---

## Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

* **Node.js** (v18 or later)
* **npm** (comes with Node.js)
* **MongoDB Atlas Account** (or local MongoDB instance)
* **API Keys:**
  - [Finnhub API Key](https://finnhub.io/) (free tier available)
  - [Google Gemini API Key](https://ai.google.dev/) (optional for AI features)
  - Gmail account with app password for email functionality

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/marc100s/stocks-signalist.git
   cd stocks-signalist
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Then fill in your credentials in the `.env` file. See [Environment Variables](#environment-variables) section for details.

   **⚠️ IMPORTANT: MongoDB Configuration**
   
   Make sure your `MONGODB_URI` includes a database name:
   ```bash
   # ❌ Wrong - will use 'test' database
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?options
   
   # ✅ Correct - includes database name
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/signalist_dev?options
   ```

4. **Verify database configuration:**
   ```bash
   npm run db:check-config
   ```
   
   This will check for common configuration issues and verify your connection.

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Variables

```bash
# Application
NODE_ENV="development"
NEXT_PUBLIC_BASE_URL=http://localhost:3000
PORT=3000

# Database
# ⚠️ CRITICAL: Always include a database name in your MongoDB URI!
# Format: mongodb+srv://username:password@cluster/DATABASE_NAME?options
# Without a database name, MongoDB will default to 'test' database
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/signalist_dev?retryWrites=true&w=majority"

# Authentication
BETTER_AUTH_SECRET="generate_with_openssl_rand_base64_32"
BETTER_AUTH_URL=http://localhost:3000

# Email (Gmail SMTP)
NODEMAILER_EMAIL="your_email@gmail.com"
NODEMAILER_PASSWORD="your_gmail_app_password"

# Stock Market API
NEXT_PUBLIC_FINNHUB_API_KEY="your_finnhub_api_key"
```

### Optional Variables

```bash
# AI Features
GEMINI_API_KEY="your_gemini_api_key"

# Event Processing
INNGEST_EVENT_KEY="your_inngest_key"
```

### Environment-Specific Configuration

**Development (`NODE_ENV=development`):**
- Email verification is **disabled** (auto sign-in)
- Verification and reset URLs are **logged to console**
- Uses `NEXT_PUBLIC_BASE_URL` for base URL

**Production (`NODE_ENV=production`):**
- Email verification is **required**
- Emails are **sent via Nodemailer**
- Uses `BETTER_AUTH_URL` for base URL
- **Important:** Set `BETTER_AUTH_URL` to your production domain (e.g., `https://stocks-signalist.vercel.app`)

### Getting API Keys

1. **Finnhub API:** 
   - Sign up at [https://finnhub.io/](https://finnhub.io/)
   - Get your free API key from the dashboard

2. **Gmail App Password:**
   - Enable 2-Factor Authentication on your Gmail account
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Generate a new app password for "Mail"
   - Use this password in `NODEMAILER_PASSWORD`

3. **Better Auth Secret:**
   ```bash
   openssl rand -base64 32
   ```

---

## Authentication Features

### Email Verification
- **Development:** Automatic sign-in, verification URLs logged to console
- **Production:** Email sent with verification link (24-hour expiration)

### Password Reset
- Request reset via email
- Secure token-based reset flow
- Reset links expire after 1 hour
- Development mode logs URLs to console

### Account Management
- Change password (requires current password)
- Settings page for account preferences
- Secure session management

---

## Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Build
npm run build        # Create production build

# Production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint

# Database
npm run test:db              # Test database connection
npm run db:check-config      # Verify database configuration and check for issues
npm run db:list-collections  # List all collections in your database
npm run db:clear-users       # Clear all users from database (development only)
```

**Important Database Scripts:**

- **`db:check-config`**: Run this BEFORE deploying to verify your MongoDB configuration is correct. It will warn you if:
  - Database name is missing from the URI
  - You're using the default 'test' database
  - Collections have incorrect names
  - There are any connection issues

- **`db:list-collections`**: Quickly see what collections exist in your database and how many documents are in each

- **`db:clear-users`**: Development helper to clear all users, sessions, accounts, and verification tokens

---

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import project in Vercel:**
   - Go to [vercel.com](https://vercel.com/)
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables:**
   
   In Vercel dashboard → Settings → Environment Variables, add:
   
   ```bash
   NODE_ENV=production
   BETTER_AUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
   MONGODB_URI=your_mongodb_connection_string
   BETTER_AUTH_SECRET=your_secret
   NODEMAILER_EMAIL=your_email@gmail.com
   NODEMAILER_PASSWORD=your_app_password
   NEXT_PUBLIC_FINNHUB_API_KEY=your_api_key
   # ... add other variables
   ```

4. **Deploy:**
   - Vercel will automatically deploy on push to main branch
   - Check build logs for any errors

5. **Verify:**
   - Test authentication flow
   - Verify email links contain correct production URL
   - Test password reset flow

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Troubleshooting

### Database Issues

**Problem: Users created in 'test' database instead of my named database**

This happens when the MongoDB URI doesn't include a database name. MongoDB then defaults to using the 'test' database.

**Solution:**
1. Check your `MONGODB_URI` includes a database name:
   ```bash
   # Format: mongodb+srv://user:pass@cluster/DATABASE_NAME?options
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/signalist_dev?options
   ```

2. Verify with the configuration checker:
   ```bash
   npm run db:check-config
   ```

3. The checker will tell you:
   - If database name is missing
   - Which database you're actually connected to
   - What collections exist

**Problem: Can't find users even though they exist in MongoDB Atlas**

Check if your users are in the 'test' database:
1. Go to MongoDB Atlas → Browse Collections
2. Look for a database named "test"
3. If you see your users there, update your `MONGODB_URI` to include a database name
4. Users will need to re-register in the correct database (or you can migrate data)

**Problem: Wrong collection names (plural vs singular)**

Better Auth uses **singular** collection names:
- ✅ `user`, `account`, `session`, `verification`
- ❌ NOT `users`, `accounts`, `sessions`, `verifications`

If you see plural collection names, they were likely created by a different system and won't be used by Better Auth.

### Authentication Issues

**Problem: Email verification not working in development**

Development mode skips email verification by default:
- Users are auto-signed in after registration
- Verification URLs are logged to console
- Set `NODE_ENV=production` to test actual email sending

**Problem: Password reset link shows 404**

Ensure the Better Auth API route exists at `/app/api/auth/[...all]/route.ts`

### API Issues

**Problem: Finnhub API rate limit exceeded**

Free tier has rate limits:
- 60 API calls/minute
- Consider upgrading or implementing caching

For more troubleshooting help, see [DEPLOYMENT.md](./DEPLOYMENT.md) or check [GitHub Issues](https://github.com/marc100s/stocks-signalist/issues).

---

## Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact

**Ellipsis Technologies**

- Twitter: [@EllipsisTechno1](https://x.com/EllipsisTechno1)
- Email: privacyellipsis@ellipsis-email.awsapps.com
- GitHub: [@marc100s](https://github.com/marc100s)

**Project Link:** [https://github.com/marc100s/stocks-signalist](https://github.com/marc100s/stocks-signalist)

---

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth](https://www.better-auth.com/)
- [Finnhub API](https://finnhub.io/)
- [TradingView](https://www.tradingview.com/)
- [Vercel](https://vercel.com/) for hosting

---

## Project Structure

```
stocks-signalist/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (sign-in, sign-up, reset-password)
│   ├── (root)/              # Main app pages (dashboard, watchlist, settings)
│   ├── api/                 # API routes
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Shadcn/ui components
│   └── forms/               # Form components
├── lib/                     # Utility functions
│   ├── actions/             # Server actions
│   ├── better-auth/         # Authentication configuration
│   ├── inngest/             # Event workflows
│   └── nodemailer/          # Email templates and functions
├── database/                # Database models and connection
├── middleware/              # Next.js middleware
├── public/                  # Static assets
└── scripts/                 # Utility scripts

```

---

**Made with ❤️ by Ellipsis Technologies**