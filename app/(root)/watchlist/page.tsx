import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import WatchlistTable from "@/components/WatchlistTable";
import { getWatchlistWithQuotes } from "@/lib/actions/watchlist.actions";

export default async function WatchlistPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const watchlistStocks = await getWatchlistWithQuotes(session.user.email);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
        <p className="text-gray-400">
          Track your favorite stocks and monitor their performance
        </p>
      </div>

      {watchlistStocks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-16 w-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Empty watchlist"
            >
              <title>Empty watchlist</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Your watchlist is empty
            </h3>
            <p className="text-gray-500">
              Start by searching and adding stocks to track their performance
            </p>
          </div>
        </div>
      ) : (
        <WatchlistTable
          stocks={watchlistStocks}
          userEmail={session.user.email}
        />
      )}
    </div>
  );
}
