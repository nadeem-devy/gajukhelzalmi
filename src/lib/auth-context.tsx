"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { User, UserRole } from "./types";
import { apiPost } from "./api-client";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (name: string, password: string) => Promise<string | null>;
  logout: () => void;
  loginLoading: boolean;
  // Role checks
  isSuperAdmin: boolean;
  isVolunteer: boolean;
  isEndUser: boolean;
  isLoggedIn: boolean;
  // Capability checks
  canManageCampaigns: boolean;
  canApproveExpenses: boolean;
  canSubmitExpenses: boolean;
  canManageAid: boolean;
  canManageRequests: boolean;
  canRecordDonations: boolean;
  canApproveDonations: boolean;
  canContribute: boolean;
  canViewAdminPanel: boolean;
  canViewFullNames: boolean;
  canViewAuditTrail: boolean;
  canGenerateReports: boolean;
  // Backward compat
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "public",
  login: async () => null,
  logout: () => {},
  loginLoading: false,
  isSuperAdmin: false,
  isVolunteer: false,
  isEndUser: false,
  isLoggedIn: false,
  canManageCampaigns: false,
  canApproveExpenses: false,
  canSubmitExpenses: false,
  canManageAid: false,
  canManageRequests: false,
  canRecordDonations: false,
  canApproveDonations: false,
  canContribute: false,
  canViewAdminPanel: false,
  canViewFullNames: false,
  canViewAuditTrail: false,
  canGenerateReports: false,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [restored, setRestored] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gz_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setRestored(true);
  }, []);

  // Persist session changes to localStorage
  useEffect(() => {
    if (!restored) return;
    if (user) {
      localStorage.setItem("gz_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("gz_user");
    }
  }, [user, restored]);

  const login = useCallback(async (name: string, password: string): Promise<string | null> => {
    setLoginLoading(true);
    try {
      const result = await apiPost<User>("/api/auth/login", { name, password });
      setUser(result);
      return null; // success
    } catch (err) {
      return err instanceof Error ? err.message : "Login failed";
    } finally {
      setLoginLoading(false);
    }
  }, []);

  const logout = () => setUser(null);

  const role: UserRole = user?.role || "public";
  const isSuperAdmin = role === "super_admin";
  const isVolunteer = role === "volunteer";
  const isEndUser = role === "user";
  const isLoggedIn = !!user;

  // Derived capabilities
  const canManageCampaigns = isSuperAdmin || isVolunteer;
  const canApproveExpenses = isSuperAdmin;
  const canSubmitExpenses = isSuperAdmin || isVolunteer;
  const canManageAid = isSuperAdmin;
  const canManageRequests = isSuperAdmin || isVolunteer;
  const canRecordDonations = isSuperAdmin || isVolunteer;
  const canApproveDonations = isSuperAdmin || isVolunteer;
  const canContribute = isLoggedIn;
  const canViewAdminPanel = isSuperAdmin || isVolunteer;
  const canViewFullNames = isSuperAdmin || isVolunteer;
  const canViewAuditTrail = isSuperAdmin;
  const canGenerateReports = isSuperAdmin || isVolunteer;
  const isAdmin = isSuperAdmin;

  return (
    <AuthContext.Provider value={{
      user, role, login, logout, loginLoading,
      isSuperAdmin, isVolunteer, isEndUser, isLoggedIn,
      canManageCampaigns, canApproveExpenses, canSubmitExpenses,
      canManageAid, canManageRequests, canRecordDonations, canApproveDonations,
      canContribute, canViewAdminPanel, canViewFullNames,
      canViewAuditTrail, canGenerateReports, isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
