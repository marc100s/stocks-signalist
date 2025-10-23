import { z } from "zod";

// -----------------------------
// Stock & Finnhub API Schemas
// -----------------------------

export const stockSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  name: z.string().min(1, "Name is required"),
  exchange: z.string().min(1, "Exchange is required"),
  type: z.string().default("Stock"),
});

export const stockWithWatchlistStatusSchema = stockSchema.extend({
  isInWatchlist: z.boolean().default(false),
});

export const finnhubSearchResultSchema = z.object({
  symbol: z.string(),
  description: z.string(),
  displaySymbol: z.string().optional(),
  type: z.string(),
});

export const finnhubSearchResponseSchema = z.object({
  count: z.number(),
  result: z.array(finnhubSearchResultSchema),
});

// Validate and transform Finnhub quote response
export const finnhubQuoteSchema = z.object({
  c: z.number().optional(), // current price
  d: z.number().optional(), // change
  dp: z.number().optional(), // percent change
  h: z.number().optional(), // high
  l: z.number().optional(), // low
  o: z.number().optional(), // open
  pc: z.number().optional(), // previous close
});

// Validate Finnhub profile response
export const finnhubProfileSchema = z.object({
  name: z.string().optional(),
  marketCapitalization: z.number().optional(),
  exchange: z.string().optional(),
  ticker: z.string().optional(),
});

// Validate Finnhub financials response
export const finnhubFinancialsSchema = z.object({
  metric: z.record(z.string(), z.number()).optional(),
});

// -----------------------------
// Watchlist Schemas
// -----------------------------

export const watchlistStockDataSchema = z.object({
  symbol: z.string(),
  company: z.string(),
  addedAt: z.coerce.date(), // Coerce string dates to Date objects
  price: z.number().nonnegative().default(0),
  change: z.number().default(0),
  changePercent: z.number().default(0),
  marketCap: z.number().nonnegative().default(0),
  peRatio: z.number().positive().nullable().default(null),
});

export const addToWatchlistSchema = z.object({
  email: z.string().email("Invalid email"),
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  company: z.string().min(1, "Company name is required"),
});

export const removeFromWatchlistSchema = z.object({
  email: z.string().email("Invalid email"),
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
});

// -----------------------------
// News Schemas
// -----------------------------

export const rawNewsArticleSchema = z.object({
  id: z.number(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  source: z.string().optional(),
  url: z.string().url().optional(),
  datetime: z.number().optional(),
  image: z.string().url().optional().nullable(),
  category: z.string().optional(),
  related: z.string().optional(),
});

export const marketNewsArticleSchema = z.object({
  id: z.number(),
  headline: z.string(),
  summary: z.string(),
  source: z.string(),
  url: z.string().url(),
  datetime: z.number(),
  category: z.string().default("general"),
  related: z.string().default(""),
  image: z.string().url().optional(),
});

// -----------------------------
// Type Inference from Schemas
// -----------------------------

export type Stock = z.infer<typeof stockSchema>;
export type StockWithWatchlistStatus = z.infer<
  typeof stockWithWatchlistStatusSchema
>;
export type FinnhubSearchResult = z.infer<typeof finnhubSearchResultSchema>;
export type FinnhubSearchResponse = z.infer<typeof finnhubSearchResponseSchema>;
export type FinnhubQuote = z.infer<typeof finnhubQuoteSchema>;
export type FinnhubProfile = z.infer<typeof finnhubProfileSchema>;
export type FinnhubFinancials = z.infer<typeof finnhubFinancialsSchema>;
export type WatchlistStockData = z.infer<typeof watchlistStockDataSchema>;
export type RawNewsArticle = z.infer<typeof rawNewsArticleSchema>;
export type MarketNewsArticle = z.infer<typeof marketNewsArticleSchema>;
