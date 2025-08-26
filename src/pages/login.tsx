import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { auth } from "@/lib/auth";
import AdminLoginModal from "@/components/admin/admin-login-modal";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [userForm, setUserForm] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", userForm);
      const data = await response.json();
      
      auth.setCurrentUser(data.user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });
      
      setLocation("/user");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ga-red to-ga-navy flex items-center justify-center p-4">
      {/* Admin Login Corner Button */}
      <Button
        onClick={() => setShowAdminModal(true)}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white border-0"
        variant="outline"
        data-testid="button-admin-login"
      >
        Admin Login
      </Button>

      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <h1 className="font-georgia text-5xl font-bold text-white mb-2" data-testid="text-logo">
            GHSAbet
          </h1>
          <p className="text-white/80 text-lg" data-testid="text-tagline">
            Georgia High School Sports Betting
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-white rounded-2xl shadow-xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center" data-testid="text-welcome">
              Welcome Back
            </h2>
            
            <form onSubmit={handleUserLogin} className="space-y-6" data-testid="form-user-login">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </Label>
                <Input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ga-red focus:border-transparent"
                  placeholder="Enter your username"
                  required
                  data-testid="input-username"
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
                  placeholder="Enter your password"
                  required
                  data-testid="input-password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-ga-red hover:bg-ga-red/80 text-white font-semibold py-3 rounded-lg transition-colors"
                data-testid="button-sign-in"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>

      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={() => {
          setShowAdminModal(false);
          setLocation("/admin");
        }}
      />
    </div>
  );
}
