"use server";

// biome-ignore assist/source/organizeImports: <biome-ignore lint: false positive>
import { getDateRange, validateArticle, formatArticle } from "@/lib/utils";
import { POPULAR_STOCK_SYMBOLS } from "@/lib/constants";
import { cache } from "react";

// -----------------------------
//  Constants & Config
// -----------------------------
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY =
  process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

type FetchOptions = RequestInit & { next?: { revalidate?: number } };

// -----------------------------
//  Generic JSON Fetcher
// -----------------------------
export async function fetchJSON<T>(
  url: string,
  revalidateSeconds?: number
): Promise<T> {
  const options: FetchOptions = revalidateSeconds
    ? { cache: "force-cache", next: { revalidate: revalidateSeconds } }
    : { cache: "no-store" };

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch failed ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}

// -----------------------------
//  Get News (Personalized or General)
// -----------------------------
export async function getNews(
  symbols?: string[]
): Promise<MarketNewsArticle[]> {
  try {
    if (!FINNHUB_API_KEY) {
      console.error("FINNHUB API key is missing");
      return [];
    }

    const range = getDateRange(5);
    const cleanSymbols = (symbols || [])
      .map((s) => s?.trim().toUpperCase())
      .filter((s): s is string => Boolean(s));

    const maxArticles = 6;

    // ---- Company-specific News ----
    if (cleanSymbols.length > 0) {
      const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

      await Promise.all(
        cleanSymbols.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(
              sym
            )}&from=${range.from}&to=${range.to}&token=${FINNHUB_API_KEY}`;
            const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
            perSymbolArticles[sym] = (articles || []).filter(validateArticle);
          } catch {
            // Silently handle individual news fetch errors
            perSymbolArticles[sym] = [];
          }
        })
      );

      const collected: MarketNewsArticle[] = [];

      // Round-robin collection
      for (let round = 0; round < maxArticles; round++) {
        for (const sym of cleanSymbols) {
          const list = perSymbolArticles[sym] || [];
          if (list.length === 0) continue;
          const article = list.shift();
          if (!article || !validateArticle(article)) continue;

          collected.push(formatArticle(article, true, sym, round));
          if (collected.length >= maxArticles) break;
        }
        if (collected.length >= maxArticles) break;
      }

      if (collected.length > 0) {
        collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
        return collected.slice(0, maxArticles);
      }
    }

    // ---- General Market News Fallback ----
    const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`;
    const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

    const seen = new Set<string>();
    const unique: RawNewsArticle[] = [];

    for (const art of general || []) {
      if (!validateArticle(art)) continue;
      const key = `${art.id}-${art.url}-${art.headline}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(art);
      if (unique.length >= 20) break;
    }

    return unique
      .slice(0, maxArticles)
      .map((a, idx) => formatArticle(a, false, undefined, idx));
  } catch (err) {
    console.error("getNews error:", err);
    throw new Error("Failed to fetch news");
  }
}

// -----------------------------
//  Search Stocks
// -----------------------------
export const searchStocks = cache(
  async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
      if (!FINNHUB_API_KEY) {
        console.error("FINNHUB API key is missing");
        return [];
      }

      const trimmed = query?.trim() || "";
      const maxResults = 15;

      let results: FinnhubSearchResult[] = [];

      if (!trimmed) {
        // Popular stocks fallback
        const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
        const profiles = await Promise.all(
          top.map(async (sym) => {
            try {
              const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(
                sym
              )}&token=${FINNHUB_API_KEY}`;
              const profile = await fetchJSON<any>(url, 3600);
              return { sym, profile };
            } catch {
              // Silently handle API errors to prevent blocking other stocks
              return { sym, profile: null };
            }
          })
        );

        results = profiles
          .map(({ sym, profile }) => {
            const symbol = sym.toUpperCase();
            const name = profile?.name || profile?.ticker;
            const exchange = profile?.exchange;
            if (!name) return undefined;

            const r: FinnhubSearchResult = {
              symbol,
              description: name,
              displaySymbol: symbol,
              type: "Common Stock",
            };
            (r as any).__exchange = exchange;
            return r;
          })
          .filter((x): x is FinnhubSearchResult => Boolean(x));
      } else {
        const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(
          trimmed
        )}&token=${FINNHUB_API_KEY}`;
        const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
        results = Array.isArray(data?.result) ? data.result : [];
      }

      return results
        .map((r) => {
          const symbol = r.symbol?.toUpperCase() || "";
          const name = r.description || symbol;
          const exchange =
            (r.displaySymbol as string) || (r as any).__exchange || "US";
          return {
            symbol,
            name,
            exchange,
            type: r.type || "Stock",
            isInWatchlist: false,
          };
        })
        .slice(0, maxResults);
    } catch {
      // Silently handle search errors
      return [];
    }
  }
);

// -----------------------------
//  Get Stock Quote
// -----------------------------
export async function getStockQuote(symbol: string) {
  try {
    if (!FINNHUB_API_KEY) {
      throw new Error("FINNHUB API key is missing");
    }

    const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(
      symbol.toUpperCase()
    )}&token=${FINNHUB_API_KEY}`;
    const quote = await fetchJSON<{
      c?: number; // current price
      d?: number; // change
      dp?: number; // percent change
      h?: number; // high
      l?: number; // low
      o?: number; // open
      pc?: number; // previous close
    }>(url, 300);

    return {
      price: quote.c || 0,
      change: quote.d || 0,
      changePercent: quote.dp || 0,
    };
  } catch {
    // Silently handle quote fetch errors
    return {
      price: 0,
      change: 0,
      changePercent: 0,
    };
  }
}

// -----------------------------
//  Get Company Profile
// -----------------------------
export async function getCompanyProfile(symbol: string) {
  try {
    if (!FINNHUB_API_KEY) {
      throw new Error("FINNHUB API key is missing");
    }

    const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(
      symbol.toUpperCase()
    )}&token=${FINNHUB_API_KEY}`;
    const profile = await fetchJSON<{
      name?: string;
      marketCapitalization?: number;
    }>(url, 3600);

    return {
      name: profile.name || symbol,
      marketCap: (profile.marketCapitalization || 0) * 1000000, // Convert from millions
    };
  } catch {
    // Silently handle profile fetch errors
    return {
      name: symbol,
      marketCap: 0,
    };
  }
}

// -----------------------------
//  Get Basic Financials (includes P/E ratio)
// -----------------------------
export async function getBasicFinancials(symbol: string) {
  try {
    if (!FINNHUB_API_KEY) {
      throw new Error("FINNHUB API key is missing");
    }

    const url = `${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(
      symbol.toUpperCase()
    )}&metric=all&token=${FINNHUB_API_KEY}`;
    const data = await fetchJSON<{
      metric?: {
        peBasicExclExtraTTM?: number;
        peNormalizedAnnual?: number;
        peTTM?: number;
      };
    }>(url, 3600);

    // Try different P/E ratio fields (Finnhub provides multiple)
    const peRatio =
      data.metric?.peBasicExclExtraTTM ||
      data.metric?.peNormalizedAnnual ||
      data.metric?.peTTM ||
      null;

    return {
      peRatio: peRatio && peRatio > 0 ? Number(peRatio.toFixed(2)) : null,
    };
  } catch {
    // Silently handle financials fetch errors
    return {
      peRatio: null,
    };
  }
}
