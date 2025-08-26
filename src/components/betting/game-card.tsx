import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Game } from "@shared/schema";

interface GameCardProps {
  game: Game;
  onPlaceBet: (game: Game, betType: string, selection: string, odds: string) => void;
}

export default function GameCard({ game, onPlaceBet }: GameCardProps) {
  const formatDate = (date: Date | string) => {
    const gameDate = new Date(date);
    return gameDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-orange-100 text-orange-800" data-testid={`badge-status-live-${game.id}`}>Live</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800" data-testid={`badge-status-completed-${game.id}`}>Final</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800" data-testid={`badge-status-upcoming-${game.id}`}>Upcoming</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow" data-testid={`card-game-${game.id}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900" data-testid={`text-matchup-${game.id}`}>
              {game.team1} vs {game.team2}
            </h3>
            <p className="text-sm text-gray-500" data-testid={`text-datetime-${game.id}`}>
              {formatDate(game.gameDate)}
            </p>
            <p className="text-sm text-gray-600" data-testid={`text-location-${game.id}`}>
              {game.location}
            </p>
          </div>
          {getStatusBadge(game.status || "upcoming")}
        </div>

        {/* Team Scores */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900" data-testid={`text-team1-name-${game.id}`}>
              {game.team1}
            </div>
            <div className="text-2xl font-bold text-ga-red" data-testid={`text-team1-score-${game.id}`}>
              {game.team1Score || "-"}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900" data-testid={`text-team2-name-${game.id}`}>
              {game.team2}
            </div>
            <div className="text-2xl font-bold text-ga-red" data-testid={`text-team2-score-${game.id}`}>
              {game.team2Score || "-"}
            </div>
          </div>
        </div>

        {/* Betting Options */}
        {game.status !== "completed" && (
          <div className="space-y-3">
            {game.moneylineTeam1 && game.moneylineTeam2 && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700" data-testid={`text-moneyline-label-${game.id}`}>
                  Moneyline
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onPlaceBet(game, "moneyline", game.team1, game.moneylineTeam1 || "")}
                    className="bg-ga-red hover:bg-ga-red/80 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    data-testid={`button-moneyline-team1-${game.id}`}
                  >
                    {game.moneylineTeam1}
                  </Button>
                  <Button
                    onClick={() => onPlaceBet(game, "moneyline", game.team2, game.moneylineTeam2 || "")}
                    className="bg-ga-navy hover:bg-ga-navy/80 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    data-testid={`button-moneyline-team2-${game.id}`}
                  >
                    {game.moneylineTeam2}
                  </Button>
                </div>
              </div>
            )}

            {game.spread && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700" data-testid={`text-spread-label-${game.id}`}>
                  Spread ({game.spread})
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onPlaceBet(game, "spread", `${game.team1} ${game.spread}`, game.spreadOdds || "")}
                    className="bg-ga-red hover:bg-ga-red/80 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    data-testid={`button-spread-team1-${game.id}`}
                  >
                    {game.spreadOdds}
                  </Button>
                  <Button
                    onClick={() => onPlaceBet(game, "spread", `${game.team2} +${Math.abs(parseFloat(game.spread || "0"))}`, game.spreadOdds || "")}
                    className="bg-ga-navy hover:bg-ga-navy/80 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    data-testid={`button-spread-team2-${game.id}`}
                  >
                    {game.spreadOdds}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
