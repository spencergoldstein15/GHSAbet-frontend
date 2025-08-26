import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Game } from "@shared/schema";

interface GameEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
  onSuccess: () => void;
}

export default function GameEditModal({ isOpen, onClose, game, onSuccess }: GameEditModalProps) {
  const { toast } = useToast();
  const [gameForm, setGameForm] = useState({
    sport: "",
    team1: "",
    team2: "",
    team1Score: 0,
    team2Score: 0,
    gameDate: "",
    location: "",
    status: "upcoming",
    moneylineTeam1: "",
    moneylineTeam2: "",
    spread: "",
    spreadOdds: "-110",
  });

  useEffect(() => {
    if (game) {
      setGameForm({
        sport: game.sport,
        team1: game.team1,
        team2: game.team2,
        team1Score: game.team1Score || 0,
        team2Score: game.team2Score || 0,
        gameDate: new Date(game.gameDate).toISOString().slice(0, 16),
        location: game.location,
        status: game.status || "upcoming",
        moneylineTeam1: game.moneylineTeam1 || "",
        moneylineTeam2: game.moneylineTeam2 || "",
        spread: game.spread || "",
        spreadOdds: game.spreadOdds || "-110",
      });
    }
  }, [game]);

  const updateGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      if (!game) throw new Error("No game selected");
      return await apiRequest("PATCH", `/api/games/${game.id}`, gameData);
    },
    onSuccess: () => {
      toast({
        title: "Game updated successfully!",
        description: `${gameForm.team1} vs ${gameForm.team2} has been updated.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update game",
        description: error.message || "An error occurred while updating the game.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameForm.team1.trim() || !gameForm.team2.trim()) {
      toast({
        title: "Teams required",
        description: "Please enter both team names.",
        variant: "destructive",
      });
      return;
    }

    if (!gameForm.location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter a game location.",
        variant: "destructive",
      });
      return;
    }

    const updateData = {
      ...gameForm,
      gameDate: new Date(gameForm.gameDate).toISOString(),
      team1Score: parseInt(gameForm.team1Score.toString()) || 0,
      team2Score: parseInt(gameForm.team2Score.toString()) || 0,
      moneylineTeam1: gameForm.moneylineTeam1 || null,
      moneylineTeam2: gameForm.moneylineTeam2 || null,
      spread: gameForm.spread || null,
      spreadOdds: gameForm.spreadOdds || null,
    };

    updateGameMutation.mutate(updateData);
  };

  const sports = ["football", "basketball", "golf", "soccer", "lacrosse", "baseball"];
  const statuses = ["upcoming", "live", "completed"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-edit-game">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900 text-center" data-testid="text-edit-game">
            Edit Game
          </DialogTitle>
          <p className="text-gray-600 mt-2 text-center" data-testid="text-edit-game-description">
            Update game information and betting odds
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-edit-game">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Sport
              </Label>
              <Select value={gameForm.sport} onValueChange={(value) => setGameForm(prev => ({ ...prev, sport: value }))}>
                <SelectTrigger data-testid="select-edit-sport">
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport.charAt(0).toUpperCase() + sport.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </Label>
              <Select value={gameForm.status} onValueChange={(value) => setGameForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger data-testid="select-edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Team 1
              </Label>
              <Input
                type="text"
                value={gameForm.team1}
                onChange={(e) => setGameForm(prev => ({ ...prev, team1: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter team 1 name"
                required
                data-testid="input-edit-team1"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Team 2
              </Label>
              <Input
                type="text"
                value={gameForm.team2}
                onChange={(e) => setGameForm(prev => ({ ...prev, team2: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter team 2 name"
                required
                data-testid="input-edit-team2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Team 1 Score
              </Label>
              <Input
                type="number"
                min="0"
                value={gameForm.team1Score}
                onChange={(e) => setGameForm(prev => ({ ...prev, team1Score: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="0"
                data-testid="input-edit-team1-score"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Team 2 Score
              </Label>
              <Input
                type="number"
                min="0"
                value={gameForm.team2Score}
                onChange={(e) => setGameForm(prev => ({ ...prev, team2Score: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="0"
                data-testid="input-edit-team2-score"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Game Date & Time
              </Label>
              <Input
                type="datetime-local"
                value={gameForm.gameDate}
                onChange={(e) => setGameForm(prev => ({ ...prev, gameDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
                data-testid="input-edit-game-date"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </Label>
              <Input
                type="text"
                value={gameForm.location}
                onChange={(e) => setGameForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter game location"
                required
                data-testid="input-edit-location"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Team 1 Moneyline
              </Label>
              <Input
                type="text"
                value={gameForm.moneylineTeam1}
                onChange={(e) => setGameForm(prev => ({ ...prev, moneylineTeam1: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="-110"
                data-testid="input-edit-moneyline1"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Team 2 Moneyline
              </Label>
              <Input
                type="text"
                value={gameForm.moneylineTeam2}
                onChange={(e) => setGameForm(prev => ({ ...prev, moneylineTeam2: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="+110"
                data-testid="input-edit-moneyline2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Spread
              </Label>
              <Input
                type="text"
                value={gameForm.spread}
                onChange={(e) => setGameForm(prev => ({ ...prev, spread: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="-3.5"
                data-testid="input-edit-spread"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Spread Odds
              </Label>
              <Input
                type="text"
                value={gameForm.spreadOdds}
                onChange={(e) => setGameForm(prev => ({ ...prev, spreadOdds: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="-110"
                data-testid="input-edit-spread-odds"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              data-testid="button-cancel-edit-game"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateGameMutation.isPending}
              className="flex-1 bg-ga-red hover:bg-ga-red/80 text-white font-semibold py-3 rounded-lg transition-colors"
              data-testid="button-submit-edit-game"
            >
              {updateGameMutation.isPending ? "Updating..." : "Update Game"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}