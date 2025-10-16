import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "signalist",
  ai: { gemini: { api: process.env.GEMINI_API_KEY } },
});
