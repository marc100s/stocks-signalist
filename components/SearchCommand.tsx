"use client";

// biome-ignore assist/source/organizeImports: <biome-ignore lint: false positive>
import { useEffect, useState, useCallback, useRef } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Loader2, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "@/lib/actions/watchlist.actions";

export default function SearchCommand({
  renderAs = "button",
  label = "Add stock",
  initialStocks,
  userEmail,
}: SearchCommandProps & { userEmail?: string }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] =
    useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();
  // Remove duplicates based on symbol and exchange to avoid key conflicts
  const uniqueStocks =
    stocks?.filter(
      (stock, index, arr) =>
        arr.findIndex(
          (s) => s.symbol === stock.symbol && s.exchange === stock.exchange
        ) === index
    ) || [];
  const displayStocks = isSearchMode
    ? uniqueStocks
    : uniqueStocks?.slice(0, 10);

  // Open dialog with Cmd/Ctrl + K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Use a ref to store the timeout
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setStocks(initialStocks);
        return;
      }

      setLoading(true);
      try {
        const results = await searchStocks(term.trim());
        setStocks(results);
      } catch {
        setStocks([]);
      } finally {
        setLoading(false);
      }
    },
    [initialStocks]
  );

  // Debounce search term changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, performSearch]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  };

  const handleWatchlistToggle = async (stock: StockWithWatchlistStatus) => {
    if (!userEmail) {
      console.log("No user logged in");
      return;
    }

    try {
      if (stock.isInWatchlist) {
        const result = await removeFromWatchlist({
          email: userEmail,
          symbol: stock.symbol,
        });
        if (result.success) {
          // Update local state
          setStocks((prev) =>
            prev.map((s) =>
              s.symbol === stock.symbol ? { ...s, isInWatchlist: false } : s
            )
          );
        }
      } else {
        const result = await addToWatchlist({
          email: userEmail,
          symbol: stock.symbol,
          company: stock.name,
        });
        if (result.success) {
          // Update local state
          setStocks((prev) =>
            prev.map((s) =>
              s.symbol === stock.symbol ? { ...s, isInWatchlist: true } : s
            )
          );
        }
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    }
  };

  return (
    <>
      {renderAs === "text" ? (
        // biome-ignore lint/a11y/noStaticElementInteractions: <biome-ignore lint: false positive>
        // biome-ignore lint/a11y/useKeyWithClickEvents: <biome-ignore lint: false positive>
        <span
          onClick={() => setOpen(true)}
          className="search-text cursor-pointer"
        >
          {label}
        </span>
      ) : (
        <Button onClick={() => setOpen(true)} className="search-btn">
          {label}
        </Button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="search-dialog"
      >
        <div className="search-field relative">
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search stocks..."
            className="search-input"
            autoFocus
            aria-label="Search for stocks"
          />
          {loading && (
            <Loader2 className="animate-spin absolute right-4 top-3 text-gray-400" />
          )}
        </div>

        <CommandList className="search-list max-h-[400px] overflow-y-auto">
          {loading ? (
            <CommandEmpty className="search-list-empty">
              Loading stocks...
            </CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div className="search-list-indicator">
              {isSearchMode ? "No results found" : "No stocks available"}
            </div>
          ) : (
            <div>
              <div className="search-count text-sm text-gray-500 mb-2">
                {isSearchMode ? "Search results" : "Popular stocks"} (
                {displayStocks?.length || 0})
              </div>
              <ul>
                {displayStocks.map((stock, index) => (
                  <li
                    key={`${stock.symbol}-${stock.exchange}-${index}`}
                    className="search-item"
                  >
                    <div className="search-item-link flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <Link
                        href={`/stocks/${stock.symbol}`}
                        onClick={handleSelectStock}
                        className="flex-1"
                      >
                        <div className="font-medium">{stock.name}</div>
                        <div className="text-sm text-gray-500">
                          {stock.symbol} | {stock.exchange} | {stock.type}
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleWatchlistToggle(stock);
                        }}
                        className="p-1 hover:bg-gray-700 rounded"
                        aria-label={
                          stock.isInWatchlist
                            ? "Remove from watchlist"
                            : "Add to watchlist"
                        }
                      >
                        <Star
                          className={`h-4 w-4 ${
                            stock.isInWatchlist
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
