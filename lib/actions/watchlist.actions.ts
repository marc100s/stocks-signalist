"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";
import { revalidatePath } from "next/cache";
import {
  getStockQuote,
  getCompanyProfile,
  getBasicFinancials,
} from "./finnhub.actions";

export async function getWatchlistSymbolsByEmail(
  email: string
): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    // Better Auth stores users in the "user" collection
    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || "");
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error("getWatchlistSymbolsByEmail error:", err);
    return [];
  }
}

export async function getWatchlistWithQuotes(
  email: string
): Promise<WatchlistStockData[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    // Get user
    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || "");
    if (!userId) return [];

    // Get watchlist items
    const items = await Watchlist.find({ userId }).lean();

    if (items.length === 0) return [];

    // Fetch real-time data for each stock with some rate limiting
    const stocksWithData = await Promise.allSettled(
      items.map(async (item, index) => {
        try {
          // Add small delay to avoid rate limiting (50ms per stock)
          if (index > 0) {
            await new Promise((resolve) => setTimeout(resolve, 50 * index));
          }

          const [quote, profile, financials] = await Promise.all([
            getStockQuote(item.symbol),
            getCompanyProfile(item.symbol),
            getBasicFinancials(item.symbol),
          ]);

          return {
            symbol: item.symbol,
            company: profile.name || item.company,
            addedAt: item.addedAt,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            marketCap: profile.marketCap,
            peRatio: financials.peRatio,
          };
        } catch (error) {
          console.error(`Error fetching data for ${item.symbol}:`, error);
          // Return basic data if API call fails
          return {
            symbol: item.symbol,
            company: item.company,
            addedAt: item.addedAt,
            price: 0,
            change: 0,
            changePercent: 0,
            marketCap: 0,
            peRatio: null,
          };
        }
      })
    );

    // Filter successful results and extract values
    return stocksWithData
      .filter((result) => result.status === "fulfilled")
      .map(
        (result) => (result as PromiseFulfilledResult<WatchlistStockData>).value
      );
  } catch (err) {
    console.error("getWatchlistWithQuotes error:", err);
    return [];
  }
}

export async function addToWatchlist(
  email: string,
  symbol: string,
  company: string
): Promise<{ success: boolean; message: string }> {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    // Get user
    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const userId = (user.id as string) || String(user._id || "");
    if (!userId) {
      return { success: false, message: "Invalid user ID" };
    }

    // Try to add to watchlist
    await Watchlist.create({
      userId,
      symbol: symbol.toUpperCase(),
      company,
    });

    // Revalidate pages that might show watchlist data
    revalidatePath("/watchlist");
    revalidatePath(`/stocks/${symbol.toUpperCase()}`);

    return { success: true, message: "Added to watchlist" };
  } catch (err: unknown) {
    console.error("addToWatchlist error:", err);

    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      return { success: false, message: "Stock already in watchlist" };
    }

    return { success: false, message: "Failed to add to watchlist" };
  }
}

export async function removeFromWatchlist(
  email: string,
  symbol: string
): Promise<{ success: boolean; message: string }> {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    // Get user
    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const userId = (user.id as string) || String(user._id || "");
    if (!userId) {
      return { success: false, message: "Invalid user ID" };
    }

    // Remove from watchlist
    const result = await Watchlist.deleteOne({
      userId,
      symbol: symbol.toUpperCase(),
    });

    if (result.deletedCount === 0) {
      return { success: false, message: "Stock not found in watchlist" };
    }

    // Revalidate pages that might show watchlist data
    revalidatePath("/watchlist");
    revalidatePath(`/stocks/${symbol.toUpperCase()}`);

    return { success: true, message: "Removed from watchlist" };
  } catch (err) {
    console.error("removeFromWatchlist error:", err);
    return { success: false, message: "Failed to remove from watchlist" };
  }
}
