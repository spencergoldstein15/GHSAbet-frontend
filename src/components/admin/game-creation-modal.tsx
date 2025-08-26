import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface GameCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GameCreationModal({ isOpen, onClose, onSuccess }: GameCreationModalProps) {
  const { toast } = useToast();
  const [gameForm, setGameForm] = useState({
    sport: "",
    team1: "",
    team2: "",
    gameDate: "",
    location: "",
    moneylineTeam1: "",
    moneylineTeam2: "",
    spread: "",
    spreadOdds: "-110",
  });

  const createGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      return await apiRequest("POST", "/api/games", gameData);
    },
    onSuccess: () => {
      toast({
        title: "Game created successfully!",
        description: `${gameForm.team1} vs ${gameForm.team2} has been added.`,
      });
      setGameForm({
        sport: "",
        team1: "",
        team2: "",
        gameDate: "",
        location: "",
        moneylineTeam1: "",
        moneylineTeam2: "",
        spread: "",
        spreadOdds: "-110",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create game",
        description: error.message || "An error occurred while creating the game.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameForm.sport) {
      toast({
        title: "Sport required",
        description: "Please select a sport.",
        variant: "destructive",
      });
      return;
    }

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

    if (!gameForm.gameDate) {
      toast({
        title: "Date required",
        description: "Please select a game date and time.",
        variant: "destructive",
      });
      return;
    }

    const gameData = {
      ...gameForm,
      gameDate: new Date(gameForm.gameDate).toISOString(),
      moneylineTeam1: gameForm.moneylineTeam1 || null,
      moneylineTeam2: gameForm.moneylineTeam2 || null,
      spread: gameForm.spread || null,
      spreadOdds: gameForm.spreadOdds || null,
    };

    createGameMutation.mutate(gameData);
  };

  const sports = ["football", "basketball", "golf", "soccer", "lacrosse", "baseball"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-create-game">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900 text-center" data-testid="text-create-game">
            Create New Game
          </DialogTitle>
          <p className="text-gray-600 mt-2 text-center" data-testid="text-create-game-description">
            Add a new game to the GHSAbet platform
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-create-game">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Sport
            </Label>
            <Select value={gameForm.sport} onValueChange={(value) => setGameForm(prev => ({ ...prev, sport: value }))}>
              <SelectTrigger data-testid="select-create-sport">
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
                data-testid="input-create-team1"
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
                data-testid="input-create-team2"
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
                data-testid="input-create-game-date"
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
                data-testid="input-create-location"
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
                data-testid="input-create-moneyline1"
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
                data-testid="input-create-moneyline2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Spread (Team 1)
              </Label>
              <Input
                type="text"
                value={gameForm.spread}
                onChange={(e) => setGameForm(prev => ({ ...prev, spread: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="-3.5"
                data-testid="input-create-spread"
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
                data-testid="input-create-spread-odds"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              data-testid="button-cancel-create-game"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGameMutation.isPending}
              className="flex-1 bg-ga-red hover:bg-ga-red/80 text-white font-semibold py-3 rounded-lg transition-colors"
              data-testid="button-submit-create-game"
            >
              {createGameMutation.isPending ? "Creating..." : "Create Game"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}