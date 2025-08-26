import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { auth } from "@/lib/auth";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const { toast } = useToast();
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", adminForm);
      const data = await response.json();
      
      if (!data.user.isAdmin) {
        throw new Error("Access denied - Admin privileges required");
      }
      
      auth.setCurrentUser(data.user);
      
      toast({
        title: "Admin login successful",
        description: `Welcome, ${data.user.username}!`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Admin login failed",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-admin-login">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900 text-center" data-testid="text-admin-access">
            Admin Access
          </DialogTitle>
          <p className="text-gray-600 mt-2 text-center" data-testid="text-admin-description">
            Enter administrator credentials
          </p>
        </DialogHeader>

        <form onSubmit={handleAdminLogin} className="space-y-6" data-testid="form-admin-login">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Username
            </Label>
            <Input
              type="text"
              value={adminForm.username}
              onChange={(e) => setAdminForm(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ga-navy focus:border-transparent"
              placeholder="Enter admin username"
              required
              data-testid="input-admin-username"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </Label>
            <Input
              type="password"
              value={adminForm.password}
              onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ga-navy focus:border-transparent"
              placeholder="Enter admin password"
              required
              data-testid="input-admin-password"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-ga-navy hover:bg-ga-navy/80 text-white font-semibold py-3 rounded-lg transition-colors"
              data-testid="button-admin-sign-in"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
