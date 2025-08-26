import { User } from "@shared/schema";

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

let currentUser: User | null = null;

export const auth = {
  getCurrentUser: () => currentUser,
  setCurrentUser: (user: User | null) => {
    currentUser = user;
  },
  isAdmin: () => currentUser?.isAdmin || false,
  logout: () => {
    currentUser = null;
  }
};
