import { inngest } from "@/lib/inngest/client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompts";
import { sendWelcomeEmail } from "../nodemailer";
import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews } from "../actions/finnhub.actions";
import { sendNewsSummaryEmail } from "../nodemailer";
import { getFormattedTodayDate } from "../utils";

export const sendSignUpEmail = inngest.createFunction(
  { id: "sign-up-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    const userProfile = `
      - Country: ${event.data.country}
      - Investment goals: ${event.data.investmentGoals}
      - Risk tolerance: ${event.data.riskTolerance}
      - Preferred industry: ${event.data.preferredIndustry}
    `;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile
    );

    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
      body: {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
    });
    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining Signalist. You now have the tools to track markets and make smarter investment decisions.";

      const {
        data: { email, name },
      } = event;

      return await sendWelcomeEmail({
        email,
        name,
        intro: introText,
      });
    });
    return {
      success: true,
      message: "Welcome email sent",
    };
  }
);

export const sendDailyNewsSummary = inngest.createFunction(
  { id: "daily-news-summary" },
  [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
  async ({ step }) => {
    // Step #1 : Get all users fro news delivery
    const users = await step.run("get-all-users", getAllUsersForNewsEmail);
    if (!users || !Array.isArray(users) || users.length === 0) {
      console.log("No users found for news email");
      return { success: false, message: "No users found for news email" };
    }
    // Step #2 : Fetch personalized news from news API
    const results = await step.run("fetch-user-news", async () => {
      const perUser: Array<{
        user: UserForNewsEmail;
        articles: MarketNewsArticle[];
      }> = [];
      for (const user of users as UserForNewsEmail[]) {
        try {
          const symbols = await getWatchlistSymbolsByEmail(user.email);
          let articles = await getNews(symbols);
          // Enforce max 6 articles per user
          articles = (articles || []).slice(0, 6);
          // If still empty, fallback to general
          if (!articles || articles.length === 0) {
            articles = await getNews();
            articles = (articles || []).slice(0, 6);
          }
          perUser.push({ user, articles });
        } catch (e) {
          console.error("daily-news: error preparing user news", user.email, e);
          perUser.push({ user, articles: [] });
        }
      }
      return perUser;
    });
    // Step #3 : Summarize news using AI for each user
    const userNewsSummaries: {
      user: UserForNewsEmail;
      newsContent: string | null;
    }[] = [];

    for (const { user, articles } of results as Array<{
      user: UserForNewsEmail;
      articles: MarketNewsArticle[];
    }>) {
      if (!articles || articles.length === 0) {
        userNewsSummaries.push({ user, newsContent: null });
        continue;
      }

      const articlesList = articles
        .map((a, idx) => `${idx + 1}. ${a.headline} (${a.source}) - ${a.url}`)
        .join("\n");

      const summaryPrompt = `You are a financial news assistant. Summarize the following news articles into a concise and engaging newsletter format for the user. Include the headline, source, and a brief description. Use a friendly and professional tone.

User details:
- Name: ${user.name}
- Country: ${user.country || "Not specified"}

News Articles:
${articlesList}

Provide the summary in markdown format.`;

      try {
        const aiResponse = await step.ai.infer("summarize-news", {
          model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
          body: {
            contents: [
              {
                role: "user",
                parts: [{ text: summaryPrompt }],
              },
            ],
          },
        });

        const part = aiResponse.candidates?.[0]?.content?.parts?.[0];
        const newsContent =
          (part && "text" in part ? part.text : null) ||
          "Here is your daily news summary.";

        userNewsSummaries.push({ user, newsContent });
      } catch (e) {
        console.error("daily-news: error summarizing news for", user.email, e);
        userNewsSummaries.push({ user, newsContent: null });
      }
    }
    // Step #4 : Send email to users with news summary

    await step.run("send-news-emails", async () => {
      await Promise.all(
        userNewsSummaries.map(async ({ user, newsContent }) => {
          if (!newsContent) return false;

          return await sendNewsSummaryEmail({
            email: user.email,
            date: getFormattedTodayDate(),
            newsContent,
          });
        })
      );
    });

    return {
      success: true,
      message: "Daily news summary emails sent successfully",
    };
  }
);
