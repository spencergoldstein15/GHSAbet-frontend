import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface UserCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserCreationModal({ isOpen, onClose, onSuccess }: UserCreationModalProps) {
  const { toast } = useToast();
  const [userForm, setUserForm] = useState({ 
    username: "", 
    password: "", 
    balance: "500.00" 
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      toast({
        title: "User created successfully!",
        description: `User ${userForm.username} has been created with $${userForm.balance} balance.`,
      });
      setUserForm({ username: "", password: "", balance: "500.00" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create user",
        description: error.message || "An error occurred while creating the user.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username.",
        variant: "destructive",
      });
      return;
    }

    if (!userForm.password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter a password.",
        variant: "destructive",
      });
      return;
    }

    const balance = parseFloat(userForm.balance);
    if (isNaN(balance) || balance < 0) {
      toast({
        title: "Invalid balance",
        description: "Please enter a valid balance amount.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(userForm);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-create-user">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900 text-center" data-testid="text-create-user">
            Create New User
          </DialogTitle>
          <p className="text-gray-600 mt-2 text-center" data-testid="text-create-user-description">
            Add a new user to the GHSAbet platform
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-create-user">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </Label>
            <Input
              type="text"
              value={userForm.username}
              onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ga-red focus:border-transparent"
              placeholder="Enter username"
              required
              data-testid="input-new-username"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </Label>
            <Input
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ga-red focus:border-transparent"
              placeholder="Enter password"
              required
              data-testid="input-new-password"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Balance
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={userForm.balance}
                onChange={(e) => setUserForm(prev => ({ ...prev, balance: e.target.value }))}
                className="block w-full pl-7 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ga-red focus:border-transparent"
                placeholder="500.00"
                required
                data-testid="input-new-balance"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              data-testid="button-cancel-create-user"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className="flex-1 bg-ga-red hover:bg-ga-red/80 text-white font-semibold py-3 rounded-lg transition-colors"
              data-testid="button-submit-create-user"
            >
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}