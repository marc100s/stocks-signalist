// biome-ignore assist/source/organizeImports: <A suppression shouldn't have an <explanation> placeholder. Example of suppression: // biome-ignore lint: false positive>
import { inngest } from "@/lib/inngest/client";
import { serve } from "inngest/next";
import {
  sendDailyNewsSummary,
  sendSignUpEmail,
} from "../../../lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendSignUpEmail, sendDailyNewsSummary],
});
