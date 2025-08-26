import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { auth } from "@/lib/auth";
import StatsCard from "@/components/admin/stats-card";
import UserCreationModal from "@/components/admin/user-creation-modal";
import GameEditModal from "@/components/admin/game-edit-modal";
import GameCreationModal from "@/components/admin/game-creation-modal";
import { Game, User } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSport, setActiveSport] = useState("all");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!auth.isAdmin()) {
      setLocation("/");
    }
  }, [setLocation]);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ["/api/games", activeSport],
    queryFn: async () => {
      const response = await fetch(`/api/games?sport=${activeSport}`);
      return response.json();
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const handleLogout = () => {
    auth.logout();
    setLocation("/");
  };

  const deleteGameMutation = useMutation({
    mutationFn: async (gameId: string) => {
      return await apiRequest("DELETE", `/api/games/${gameId}`);
    },
    onSuccess: () => {
      toast({
        title: "Game deleted successfully!",
        description: "The game has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete game",
        description: error.message || "An error occurred while deleting the game.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteGame = (gameId: string) => {
    if (window.confirm("Are you sure you want to delete this game? This action cannot be undone.")) {
      deleteGameMutation.mutate(gameId);
    }
  };

  const currentUser = auth.getCurrentUser();
  const sports = ["all", "football", "basketball", "golf", "soccer", "lacrosse", "baseball"];
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "games", label: "Manage Games" },
    { id: "users", label: "Manage Users" },
    { id: "reports", label: "Reports" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-admin-dashboard">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="font-georgia text-2xl font-bold text-ga-red" data-testid="text-logo">
                GHSAbet
              </h1>
              <Badge className="ml-4 bg-ga-navy text-white" data-testid="badge-admin">
                Admin
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600" data-testid="text-welcome">
                Welcome, <span data-testid="text-admin-name">{currentUser?.username}</span>
              </span>
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
        {/* Admin Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8" data-testid="nav-admin-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 font-medium py-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-ga-red text-ga-red"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                data-testid={`button-tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div data-testid="tab-overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Active Games"
                value={(stats as any)?.activeGames || 0}
                color="bg-ga-red"
                testId="stat-active-games"
              />
              <StatsCard
                title="Total Users"
                value={(stats as any)?.totalUsers || 0}
                color="bg-ga-gold"
                testId="stat-total-users"
              />
              <StatsCard
                title="Active Bets"
                value={(stats as any)?.activeBets || 0}
                color="bg-ga-navy"
                testId="stat-active-bets"
              />
              <StatsCard
                title="Total Volume"
                value={`$${(stats as any)?.totalVolume || "0.00"}`}
                color="bg-ga-green"
                testId="stat-total-volume"
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900" data-testid="text-recent-activity">
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-ga-red rounded-full mr-3"></div>
                    <span className="text-gray-900" data-testid="text-activity-sample">
                      System monitoring active - No recent activity
                    </span>
                  </div>
                  <span className="text-sm text-gray-500" data-testid="text-activity-time">
                    Just now
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Games Management Tab */}
        {activeTab === "games" && (
          <div data-testid="tab-games">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900" data-testid="text-game-management">
                Game Management
              </h2>
              <Button
                onClick={() => setShowGameModal(true)}
                className="bg-ga-red hover:bg-ga-red/80 text-white"
                data-testid="button-create-game"
              >
                Create New Game
              </Button>
            </div>

            {/* Sports Filter */}
            <div className="bg-white rounded-xl shadow-sm border mb-6">
              <div className="p-6">
                <div className="flex flex-wrap gap-3" data-testid="filter-sports">
                  {sports.map((sport) => (
                    <Button
                      key={sport}
                      onClick={() => setActiveSport(sport)}
                      variant={activeSport === sport ? "default" : "outline"}
                      className={
                        activeSport === sport
                          ? "bg-ga-red text-white hover:bg-ga-red/80"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }
                      data-testid={`button-filter-${sport}`}
                    >
                      {sport === "all" ? "All Sports" : sport.charAt(0).toUpperCase() + sport.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Games Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" data-testid="table-games">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Game
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sport
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {games.map((game) => (
                      <tr key={game.id} className="hover:bg-gray-50" data-testid={`row-game-${game.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900" data-testid={`text-game-matchup-${game.id}`}>
                            {game.team1} vs {game.team2}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-orange-100 text-orange-800" data-testid={`badge-sport-${game.id}`}>
                            {game.sport}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-game-date-${game.id}`}>
                          {new Date(game.gameDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={
                              game.status === "live" ? "bg-red-100 text-red-800" :
                              game.status === "completed" ? "bg-gray-100 text-gray-800" :
                              "bg-green-100 text-green-800"
                            }
                            data-testid={`badge-status-${game.id}`}
                          >
                            {game.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => setEditingGame(game)}
                            variant="ghost"
                            className="text-ga-red hover:text-red-700 mr-3"
                            data-testid={`button-edit-game-${game.id}`}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteGame(game.id)}
                            variant="ghost"
                            className="text-red-600 hover:text-red-800"
                            data-testid={`button-delete-game-${game.id}`}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === "users" && (
          <div data-testid="tab-users">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900" data-testid="text-user-management">
                User Management
              </h2>
              <Button
                onClick={() => setShowUserModal(true)}
                className="bg-ga-red hover:bg-ga-red/80 text-white"
                data-testid="button-create-user"
              >
                Add New User
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" data-testid="table-users">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50" data-testid={`row-user-${user.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-ga-red text-white rounded-full flex items-center justify-center font-medium">
                              {user.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900" data-testid={`text-user-name-${user.id}`}>
                                {user.username}
                              </div>
                              {user.isAdmin && (
                                <Badge className="bg-ga-navy text-white mt-1" data-testid={`badge-admin-${user.id}`}>
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`text-user-balance-${user.id}`}>
                          ${user.balance}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                            data-testid={`badge-user-status-${user.id}`}
                          >
                            {user.isActive ? "Active" : "Suspended"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="ghost"
                            className="text-ga-red hover:text-red-700 mr-3"
                            data-testid={`button-edit-balance-${user.id}`}
                          >
                            Edit Balance
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-red-600 hover:text-red-800"
                            data-testid={`button-suspend-user-${user.id}`}
                          >
                            {user.isActive ? "Suspend" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div data-testid="tab-reports">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6" data-testid="text-reports-title">
              Reports & Analytics
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-betting-volume">
                  Betting Volume by Sport
                </h3>
                <div className="bg-gray-100 rounded-lg w-full h-48 flex items-center justify-center">
                  <p className="text-gray-500">Chart visualization will be displayed here</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-user-activity">
                  User Activity Trends
                </h3>
                <div className="bg-gray-100 rounded-lg w-full h-48 flex items-center justify-center">
                  <p className="text-gray-500">Analytics charts will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <UserCreationModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSuccess={() => {
          setShowUserModal(false);
        }}
      />

      <GameCreationModal
        isOpen={showGameModal}
        onClose={() => setShowGameModal(false)}
        onSuccess={() => {
          setShowGameModal(false);
        }}
      />

      <GameEditModal
        isOpen={!!editingGame}
        onClose={() => setEditingGame(null)}
        game={editingGame}
        onSuccess={() => {
          setEditingGame(null);
        }}
      />
    </div>
  );
}
