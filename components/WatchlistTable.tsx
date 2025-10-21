"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeFromWatchlist } from "@/lib/actions/watchlist.actions";
interface WatchlistTableProps {
  stocks: WatchlistStockData[];
  userEmail: string;
}

export default function WatchlistTable({
  stocks: initialStocks,
  userEmail,
}: WatchlistTableProps) {
  const [stocks, setStocks] = useState(initialStocks);
  const [loading, setLoading] = useState<string | null>(null);

  const handleRemoveStock = async (symbol: string) => {
    if (!userEmail) return;

    setLoading(symbol);
    try {
      const result = await removeFromWatchlist(userEmail, symbol);

      if (result.success) {
        setStocks((prev) => prev.filter((stock) => stock.symbol !== symbol));
      } else {
        console.error("Failed to remove stock:", result.message);
      }
    } catch (error) {
      console.error("Error removing stock:", error);
    } finally {
      setLoading(null);
    }
  };

  const formatCurrency = (value: number) => {
    if (value === 0) return "--";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatMarketCap = (value: number) => {
    if (value === 0) return "--";
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return formatCurrency(value);
  };

  const formatPercentage = (value: number) => {
    if (value === 0) return "--";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableCaption>Your stock watchlist</TableCaption>
        <TableHeader>
          <TableRow>
            {WATCHLIST_TABLE_HEADER.map((header) => (
              <TableHead key={header} className="text-left">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((stock) => (
            <TableRow key={stock.symbol}>
              <TableCell className="text-left">
                <div>
                  <div className="font-medium text-white">{stock.company}</div>
                  <div className="text-sm text-gray-400">
                    Added {new Date(stock.addedAt).toLocaleDateString()}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-left">
                <span className="font-mono text-white">{stock.symbol}</span>
              </TableCell>
              <TableCell className="text-left">
                <span className="font-medium text-white">
                  {formatCurrency(stock.price)}
                </span>
              </TableCell>
              <TableCell className="text-left">
                <div className="flex items-center gap-1">
                  {stock.change !== 0 ? (
                    <>
                      {stock.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`font-medium ${
                          stock.change >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {formatCurrency(stock.change)} (
                        {formatPercentage(stock.changePercent)})
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-left">
                <span className="text-gray-300">
                  {formatMarketCap(stock.marketCap)}
                </span>
              </TableCell>
              <TableCell className="text-left">
                <span className="text-gray-300">
                  {stock.peRatio ? stock.peRatio.toFixed(2) : "--"}
                </span>
              </TableCell>
              <TableCell className="text-left">
                <span className="text-gray-400">--</span>
              </TableCell>
              <TableCell className="text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStock(stock.symbol)}
                  disabled={loading === stock.symbol}
                  className="text-red-400 hover:text-red-300 hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
