import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { auth } from "@/lib/auth";
import { Game } from "@shared/schema";

interface BetPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  betType: string;
  selection: string;
  odds: string;
  onBetPlaced: () => void;
}

export default function BetPlacementModal({
  isOpen,
  onClose,
  game,
  betType,
  selection,
  odds,
  onBetPlaced,
}: BetPlacementModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [potentialPayout, setPotentialPayout] = useState(0);
  const [potentialProfit, setPotentialProfit] = useState(0);

  const calculatePayout = (betAmount: string, oddsStr: string) => {
    const betAmountNum = parseFloat(betAmount) || 0;
    const oddsNum = parseFloat(oddsStr) || 0;
    
    let payout = 0;
    if (oddsNum > 0) {
      payout = betAmountNum + (betAmountNum * oddsNum / 100);
    } else if (oddsNum < 0) {
      payout = betAmountNum + (betAmountNum * 100 / Math.abs(oddsNum));
    }
    
    return payout;
  };

  useEffect(() => {
    const payout = calculatePayout(amount, odds);
    setPotentialPayout(payout);
    setPotentialProfit(payout - (parseFloat(amount) || 0));
  }, [amount, odds]);

  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      return await apiRequest("POST", "/api/bets", betData);
    },
    onSuccess: () => {
      toast({
        title: "Bet placed successfully!",
        description: `Your ${betType} bet on ${selection} has been placed.`,
      });
      onBetPlaced();
      queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to place bet",
        description: error.message || "An error occurred while placing your bet.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to place a bet.",
        variant: "destructive",
      });
      return;
    }

    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid bet amount.",
        variant: "destructive",
      });
      return;
    }

    const userBalance = parseFloat(currentUser.balance || "0");
    if (betAmount > userBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds to place this bet.",
        variant: "destructive",
      });
      return;
    }

    placeBetMutation.mutate({
      userId: currentUser.id,
      gameId: game.id,
      betType,
      selection,
      amount: amount,
      odds,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-place-bet">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900 text-center" data-testid="text-place-bet">
            Place Bet
          </DialogTitle>
          <p className="text-gray-600 mt-2 text-center" data-testid="text-bet-selection">
            {selection} ({odds})
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-place-bet">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Bet Amount
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-7 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ga-red focus:border-transparent"
                placeholder="0.00"
                required
                data-testid="input-bet-amount"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Potential Payout:</span>
              <span className="font-semibold text-gray-900" data-testid="text-potential-payout">
                ${potentialPayout.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Potential Profit:</span>
              <span className="font-semibold text-ga-green" data-testid="text-potential-profit">
                ${potentialProfit.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              data-testid="button-cancel-bet"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={placeBetMutation.isPending}
              className="flex-1 bg-ga-red hover:bg-ga-red/80 text-white font-semibold py-3 rounded-lg transition-colors"
              data-testid="button-place-bet"
            >
              {placeBetMutation.isPending ? "Placing..." : "Place Bet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
