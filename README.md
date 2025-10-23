# Stocks Signalist 📈

A modern web application for tracking stock signals, managing watchlists, and receiving real-time alerts to make informed investment decisions.



---

## Table of Contents

- [Stocks Signalist 📈](#stocks-signalist-)
  - [Table of Contents](#table-of-contents)
  - [About The Project](#about-the-project)
  - [Key Features](#key-features)
  - [Built With](#built-with)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

---

## About The Project

**Stocks Signalist** is a [Next.js](https://nextjs.org/) application designed to provide users with a powerful and intuitive platform for monitoring the stock market. It solves the problem of information overload by delivering curated signals and alerts, allowing users to focus on what matters most.

---

## Key Features

* **Real-time Stock Data:** Live price updates and market information.
* **Customizable Watchlists:** Create and manage personal watchlists to track your favorite stocks.
* **Alert System:** Set up custom alerts for price targets and significant market movements.
* **Data Visualization:** Interactive charts and graphs to analyze stock performance.
* **Secure Authentication:** User accounts are protected with modern authentication practices.

---

## Built With

This project leverages a modern tech stack to deliver a fast, scalable, and responsive experience.

* **[Next.js](https://nextjs.org/)** - React Framework
* **[React](https://reactjs.org/)** - UI Library
* **[TypeScript](https://www.typescriptlang.org/)** - Typed JavaScript
* **[Tailwind CSS](https://tailwindcss.com/)** - Utility-First CSS Framework
* **[Shadcn/ui](https://ui.shadcn.com/)** - Re-usable components
* **[Prisma](https://www.prisma.io/)** - Next-generation ORM
* **[Finnhub API](https://finnhub.io/)** - Real-time Stock Market Data

---

## Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

Make sure you have the latest version of Node.js and a package manager installed.
* **Node.js** (v18 or later)
* **npm, yarn, pnpm, or bun**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/stocks-signalist.git](https://github.com/your-username/stocks-signalist.git)
    cd stocks-signalist
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project by copying the example file. See the [Environment Variables](#environment-variables) section for more details.
    ```bash
    cp .env.example .env.local
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## Environment Variables

This project requires certain environment variables to be set for full functionality. Fill in the values in your `.env.local` file.

* `DATABASE_URL`: Your database connection string (e.g., from MongoDB).
* `FINNHUB_API_KEY`: Your API key from [Finnhub](https://finnhub.io/) for stock data.
* `BETTER_AUTH_URL`: The base URL of your application. 
  - **Development**: Set to `http://localhost:3000` or leave empty (will use `NEXT_PUBLIC_BASE_URL`)
  - **Production**: Set to your actual domain (e.g., `https://yourdomain.com`)
* `BETTER_AUTH_SECRET`: A secret key for Better Auth. You can generate one using `openssl rand -base64 32`.
* `NODEMAILER_EMAIL`: Your Gmail address for sending emails.
* `NODEMAILER_PASSWORD`: Your Gmail app password (not your regular password).

**Important: Production Configuration**

When deploying to production, make sure to:
1. Set `NODE_ENV=production`
2. Update `BETTER_AUTH_URL` to your production domain (e.g., `https://stocks-signalist.com`)
3. This ensures that email verification and password reset links use the correct domain

**Email Verification in Development:**

In development mode (`NODE_ENV=development`), email verification is **disabled** for easier testing:
- Users are automatically signed in after registration
- Verification URLs are logged to the console instead of being sent via email
- No need to configure email credentials for local development

In production, email verification is **required**:
- Users must verify their email before signing in
- Verification emails are sent via nodemailer (Gmail SMTP)
- Verification links expire after 24 hours

To test email verification in development, check your terminal console for the verification URL after signing up.

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact

Ellipsis Technologies - 

[@EllipsisTechno1](https://x.com/EllipsisTechno1) - privacyellipsis@ellipsis-email.awsapps.com 

Project Link: [https://github.com/marc100s/stocks-signalist](https://github.com/marc100s/stocks-signalist)