import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import GameCard from "@/components/betting/game-card";
import BetPlacementModal from "@/components/betting/bet-placement-modal";
import { queryClient } from "@/lib/queryClient";
import { Game, Bet } from "@shared/schema";

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const [currentSport, setCurrentSport] = useState("football");
  const [selectedBet, setSelectedBet] = useState<{
    game: Game;
    betType: string;
    selection: string;
    odds: string;
  } | null>(null);

  useEffect(() => {
    if (!auth.getCurrentUser()) {
      setLocation("/");
    }
  }, [setLocation]);

  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ["/api/games", currentSport],
    queryFn: async () => {
      const response = await fetch(`/api/games?sport=${currentSport}`);
      return response.json();
    },
  });

  const { data: userBets = [] } = useQuery<Bet[]>({
    queryKey: ["/api/bets", auth.getCurrentUser()?.id],
    queryFn: async () => {
      const userId = auth.getCurrentUser()?.id;
      if (!userId) return [];
      const response = await fetch(`/api/bets?userId=${userId}`);
      return response.json();
    },
  });

  const handleLogout = () => {
    auth.logout();
    setLocation("/");
  };

  const handlePlaceBet = (game: Game, betType: string, selection: string, odds: string) => {
    setSelectedBet({ game, betType, selection, odds });
  };

  const currentUser = auth.getCurrentUser();
  const sports = ["football", "basketball", "golf", "soccer", "lacrosse", "baseball"];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-user-dashboard">
      {/* User Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="font-georgia text-2xl font-bold text-ga-red" data-testid="text-logo">
                GHSAbet
              </h1>
              <span className="ml-4 text-sm text-gray-500" data-testid="text-tagline">
                Georgia High School Sports
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-ga-gold text-gray-900 px-4 py-2 rounded-lg font-medium" data-testid="text-balance">
                Balance: <span data-testid="text-balance-amount">${currentUser?.balance || "0.00"}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sports Navigation */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="p-6">
            <div className="flex flex-wrap gap-3" data-testid="nav-sports">
              {sports.map((sport) => (
                <Button
                  key={sport}
                  onClick={() => setCurrentSport(sport)}
                  variant={currentSport === sport ? "default" : "outline"}
                  className={
                    currentSport === sport
                      ? "bg-ga-red text-white hover:bg-ga-red/80"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }
                  data-testid={`button-sport-${sport}`}
                >
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Games Section */}
        <div data-testid={`section-sport-${currentSport}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900" data-testid={`text-games-title-${currentSport}`}>
              {currentSport.charAt(0).toUpperCase() + currentSport.slice(1)} Games
            </h2>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12" data-testid={`grid-games-${currentSport}`}>
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPlaceBet={handlePlaceBet}
              />
            ))}
            {games.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500" data-testid="text-no-games">
                No games available for {currentSport}
              </div>
            )}
          </div>
        </div>

        {/* My Bets Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="text-my-bets">
            My Active Bets
          </h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" data-testid="table-user-bets">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Game
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Potential Win
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userBets.map((bet) => (
                    <tr key={bet.id} className="hover:bg-gray-50" data-testid={`row-bet-${bet.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`text-bet-game-${bet.id}`}>
                        Game #{bet.gameId.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-bet-selection-${bet.id}`}>
                        {bet.selection} ({bet.betType})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-bet-amount-${bet.id}`}>
                        ${bet.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-bet-payout-${bet.id}`}>
                        ${bet.potentialPayout}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={
                            bet.status === "won" ? "bg-green-100 text-green-800" :
                            bet.status === "lost" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }
                          data-testid={`badge-bet-status-${bet.id}`}
                        >
                          {bet.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {userBets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500" data-testid="text-no-bets">
                        No active bets. Place your first bet on a game above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedBet && (
        <BetPlacementModal
          isOpen={!!selectedBet}
          onClose={() => setSelectedBet(null)}
          game={selectedBet.game}
          betType={selectedBet.betType}
          selection={selectedBet.selection}
          odds={selectedBet.odds}
          onBetPlaced={() => {
            setSelectedBet(null);
            queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
          }}
        />
      )}
    </div>
  );
}
