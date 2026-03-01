"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import {
  Activity,
  AidRecord,
  AidStatus,
  Beneficiary,
  Campaign,
  Donation,
  DonationSource,
  Expense,
  Notification,
  Request,
  RequestStatus,
  RequestType,
  AuditEntry,
  FundingSummary,
  User,
} from "./types";
import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";
import { generateId } from "./utils";

// ===== Store Interface =====
interface StoreContextType {
  // Data
  activities: Activity[];
  aidRecords: AidRecord[];
  beneficiaries: Beneficiary[];
  campaigns: Campaign[];
  donations: Donation[];
  expenses: Expense[];
  notifications: Notification[];
  requests: Request[];
  auditLog: AuditEntry[];
  users: User[];

  // Loading
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;

  // Urdu data map for td()
  dataUrduMap: Record<string, string>;

  // Computed
  getFundingSummary: () => FundingSummary;

  // Expense Actions
  approveExpense: (id: string, approverUserId: string) => void;
  rejectExpense: (id: string) => void;

  // Aid Actions
  verifyAid: (id: string) => void;
  approveAid: (id: string, approverUserId: string) => void;
  deliverAid: (id: string) => void;

  // Request Actions
  submitRequest: (data: {
    type: RequestType;
    name?: string;
    phone?: string;
    description: string;
    urgency?: "low" | "medium" | "high";
    anonymous: boolean;
  }) => void;
  reviewRequest: (id: string) => void;
  approveRequest: (id: string, adminUserId: string) => void;
  rejectRequest: (id: string, adminUserId: string) => void;
  convertRequestToAid: (id: string, adminUserId: string) => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Donation Actions
  recordDonation: (data: {
    amount: number;
    source: DonationSource;
    donorName?: string;
    anonymous: boolean;
    campaignId?: string;
    notes?: string;
    recordedBy: string;
    receiverName?: string;
  }) => void;
  approveDonation: (id: string, approverUserId: string) => void;
  rejectDonation: (id: string) => void;

  // Campaign Actions
  createCampaign: (data: {
    title: string;
    purpose: string;
    targetAmount: number;
    startDate: string;
    endDate?: string;
    userId: string;
  }) => void;

  // Activity Actions
  addActivity: (data: {
    title: string;
    description: string;
    whyItMatters: string;
    date: string;
    location: string;
    status: "planned" | "ongoing" | "completed";
    userId: string;
  }) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

// Build a flat map of "entityId.field" -> Urdu text from all loaded data
function buildUrduMap(
  activities: Activity[],
  campaigns: Campaign[],
  expenses: Expense[],
  aidRecords: AidRecord[],
  requests: Request[],
  notifications: Notification[],
  auditLog: AuditEntry[],
  beneficiaries: Beneficiary[],
): Record<string, string> {
  const map: Record<string, string> = {};

  for (const a of activities) {
    if (a.title_ur) map[`${a.id}.title`] = a.title_ur;
    if (a.description_ur) map[`${a.id}.description`] = a.description_ur;
    if (a.whyItMatters_ur) map[`${a.id}.whyItMatters`] = a.whyItMatters_ur;
    if (a.location_ur) map[`${a.id}.location`] = a.location_ur;
  }

  for (const c of campaigns) {
    if (c.title_ur) map[`${c.id}.title`] = c.title_ur;
    if (c.purpose_ur) map[`${c.id}.purpose`] = c.purpose_ur;
    for (const e of c.expenses) {
      if (e.description_ur) map[`${e.id}.description`] = e.description_ur;
    }
    for (const u of c.updates) {
      if (u.message_ur) map[`${u.id}.message`] = u.message_ur;
    }
  }

  for (const e of expenses) {
    if (e.description_ur) map[`${e.id}.description`] = e.description_ur;
  }

  for (const a of aidRecords) {
    if (a.description_ur) map[`${a.id}.description`] = a.description_ur;
  }

  for (const r of requests) {
    if (r.description_ur) map[`${r.id}.description`] = r.description_ur;
  }

  for (const n of notifications) {
    if (n.title_ur) map[`${n.id}.title`] = n.title_ur;
    if (n.message_ur) map[`${n.id}.message`] = n.message_ur;
  }

  for (const a of auditLog) {
    if (a.details_ur) map[`${a.id}.details`] = a.details_ur;
  }

  for (const b of beneficiaries) {
    if (b.verificationNotes_ur) map[`${b.id}.verificationNotes`] = b.verificationNotes_ur;
  }

  return map;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [aidRecords, setAidRecords] = useState<AidRecord[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [acts, camps, dons, exps, bens, aids, reqs, notifs, audits, usrs] = await Promise.all([
        apiGet<Activity[]>("/api/activities"),
        apiGet<Campaign[]>("/api/campaigns"),
        apiGet<Donation[]>("/api/donations"),
        apiGet<Expense[]>("/api/expenses"),
        apiGet<Beneficiary[]>("/api/beneficiaries"),
        apiGet<AidRecord[]>("/api/aid-records"),
        apiGet<Request[]>("/api/requests"),
        apiGet<Notification[]>("/api/notifications"),
        apiGet<AuditEntry[]>("/api/audit-log"),
        apiGet<User[]>("/api/users"),
      ]);
      setActivities(acts);
      setCampaigns(camps);
      setDonations(dons);
      setExpenses(exps);
      setBeneficiaries(bens);
      setAidRecords(aids);
      setRequests(reqs);
      // Filter dismissed notifications
      setNotifications(notifs.filter((n) => n.link !== "__dismissed__"));
      setAuditLog(audits);
      setUsers(usrs);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build Urdu map from loaded data
  const dataUrduMap = useMemo(
    () => buildUrduMap(activities, campaigns, expenses, aidRecords, requests, notifications, auditLog, beneficiaries),
    [activities, campaigns, expenses, aidRecords, requests, notifications, auditLog, beneficiaries]
  );

  // ===== Expense Actions =====
  const approveExpense = useCallback(async (id: string, approverUserId: string) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: "approved" as const, approvedBy: approverUserId, approvedAt: new Date().toISOString().split("T")[0] }
          : e
      )
    );
    try {
      await apiPatch(`/api/expenses/${id}`, { action: "approve", approverUserId });
    } catch {
      loadData(); // Rollback by reloading
    }
  }, [loadData]);

  const rejectExpense = useCallback(async (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "rejected" as const } : e))
    );
    try {
      await apiPatch(`/api/expenses/${id}`, { action: "reject" });
    } catch {
      loadData();
    }
  }, [loadData]);

  // ===== Aid Actions =====
  const verifyAid = useCallback(async (id: string) => {
    setAidRecords((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "verified" as AidStatus, verifiedDate: new Date().toISOString().split("T")[0] }
          : a
      )
    );
    try {
      await apiPatch(`/api/aid-records/${id}`, { action: "verify" });
    } catch {
      loadData();
    }
  }, [loadData]);

  const approveAid = useCallback(async (id: string, approverUserId: string) => {
    setAidRecords((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "approved" as AidStatus, approvedDate: new Date().toISOString().split("T")[0], approvedBy: approverUserId }
          : a
      )
    );
    try {
      await apiPatch(`/api/aid-records/${id}`, { action: "approve", approverUserId });
    } catch {
      loadData();
    }
  }, [loadData]);

  const deliverAid = useCallback(async (id: string) => {
    setAidRecords((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "delivered" as AidStatus, deliveredDate: new Date().toISOString().split("T")[0] }
          : a
      )
    );
    try {
      await apiPatch(`/api/aid-records/${id}`, { action: "deliver" });
    } catch {
      loadData();
    }
  }, [loadData]);

  // ===== Request Actions =====
  const submitRequest = useCallback(async (data: {
    type: RequestType;
    name?: string;
    phone?: string;
    description: string;
    urgency?: "low" | "medium" | "high";
    anonymous: boolean;
  }) => {
    const tempId = generateId();
    const newRequest: Request = {
      id: tempId,
      type: data.type,
      name: data.anonymous ? undefined : data.name,
      phone: data.anonymous ? undefined : data.phone,
      anonymous: data.anonymous,
      description: data.description,
      urgency: data.urgency,
      status: "submitted",
      submittedAt: new Date().toISOString().split("T")[0],
    };
    setRequests((prev) => [newRequest, ...prev]);
    try {
      const result = await apiPost<Request>("/api/requests", data);
      setRequests((prev) => prev.map((r) => (r.id === tempId ? result : r)));
    } catch {
      setRequests((prev) => prev.filter((r) => r.id !== tempId));
    }
  }, []);

  const reviewRequest = useCallback(async (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "reviewing" as RequestStatus } : r))
    );
    try {
      await apiPatch(`/api/requests/${id}`, { action: "review" });
    } catch {
      loadData();
    }
  }, [loadData]);

  const approveRequest = useCallback(async (id: string, adminUserId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "approved" as RequestStatus, reviewedAt: new Date().toISOString().split("T")[0], reviewedBy: adminUserId }
          : r
      )
    );
    try {
      await apiPatch(`/api/requests/${id}`, { action: "approve", adminUserId });
    } catch {
      loadData();
    }
  }, [loadData]);

  const rejectRequest = useCallback(async (id: string, adminUserId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "rejected" as RequestStatus, reviewedAt: new Date().toISOString().split("T")[0], reviewedBy: adminUserId }
          : r
      )
    );
    try {
      await apiPatch(`/api/requests/${id}`, { action: "reject", adminUserId });
    } catch {
      loadData();
    }
  }, [loadData]);

  const convertRequestToAid = useCallback(async (id: string, adminUserId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "converted" as RequestStatus, reviewedAt: new Date().toISOString().split("T")[0], reviewedBy: adminUserId }
          : r
      )
    );
    try {
      await apiPatch(`/api/requests/${id}`, { action: "convert", adminUserId });
      loadData(); // Reload to get new aid record
    } catch {
      loadData();
    }
  }, [loadData]);

  // ===== Notification Actions =====
  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await apiPatch(`/api/notifications/${id}`, {});
    } catch {
      // Optimistic update is fine even if it fails
    }
  }, []);

  const dismissNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiDelete(`/api/notifications/${id}`);
    } catch {
      loadData();
    }
  }, [loadData]);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await apiPatch("/api/notifications", {});
    } catch {
      // Optimistic update is fine
    }
  }, []);

  // ===== Donation Actions =====
  const recordDonation = useCallback(async (data: {
    amount: number;
    source: DonationSource;
    donorName?: string;
    anonymous: boolean;
    campaignId?: string;
    notes?: string;
    recordedBy: string;
    receiverName?: string;
  }) => {
    const tempId = generateId();
    const newDonation: Donation = {
      id: tempId,
      amount: data.amount,
      source: data.source,
      donorName: data.anonymous ? undefined : data.donorName,
      anonymous: data.anonymous,
      date: new Date().toISOString().split("T")[0],
      campaignId: data.campaignId,
      notes: data.notes,
      recordedBy: data.recordedBy,
      receiverName: data.receiverName,
      status: "pending",
    };
    setDonations((prev) => [newDonation, ...prev]);
    try {
      const result = await apiPost<Donation>("/api/donations", data);
      setDonations((prev) => prev.map((d) => (d.id === tempId ? result : d)));
    } catch {
      loadData();
    }
  }, [loadData]);

  const approveDonation = useCallback(async (id: string, approverUserId: string) => {
    const donation = donations.find((d) => d.id === id);
    setDonations((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: "approved" as const, approvedBy: approverUserId, approvedAt: new Date().toISOString().split("T")[0] }
          : d
      )
    );
    if (donation?.campaignId) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === donation.campaignId
            ? { ...c, collectedAmount: c.collectedAmount + donation.amount }
            : c
        )
      );
    }
    try {
      await apiPatch(`/api/donations/${id}`, { action: "approve", approverUserId });
    } catch {
      loadData();
    }
  }, [donations, loadData]);

  const rejectDonation = useCallback(async (id: string) => {
    setDonations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "rejected" as const } : d))
    );
    try {
      await apiPatch(`/api/donations/${id}`, { action: "reject" });
    } catch {
      loadData();
    }
  }, [loadData]);

  // ===== Campaign Actions =====
  const createCampaign = useCallback(async (data: {
    title: string;
    purpose: string;
    targetAmount: number;
    startDate: string;
    endDate?: string;
    userId: string;
  }) => {
    const authorName = users.find((u) => u.id === data.userId)?.name || "Admin";
    const tempId = generateId();
    const newCampaign: Campaign = {
      id: tempId,
      title: data.title,
      purpose: data.purpose,
      targetAmount: data.targetAmount,
      collectedAmount: 0,
      spentAmount: 0,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "active",
      expenses: [],
      updates: [{
        id: generateId(),
        date: new Date().toISOString().split("T")[0],
        message: `Campaign "${data.title}" launched!`,
        author: authorName,
      }],
      createdBy: data.userId,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    try {
      const result = await apiPost<Campaign>("/api/campaigns", { ...data, authorName });
      setCampaigns((prev) => prev.map((c) => (c.id === tempId ? result : c)));
    } catch {
      loadData();
    }
  }, [users, loadData]);

  // ===== Activity Actions =====
  const addActivity = useCallback(async (data: {
    title: string;
    description: string;
    whyItMatters: string;
    date: string;
    location: string;
    status: "planned" | "ongoing" | "completed";
    userId: string;
  }) => {
    const tempId = generateId();
    const newActivity: Activity = {
      id: tempId,
      title: data.title,
      description: data.description,
      whyItMatters: data.whyItMatters,
      date: data.date,
      location: data.location,
      status: data.status,
      volunteers: [],
      createdBy: data.userId,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setActivities((prev) => [newActivity, ...prev]);
    try {
      const result = await apiPost<Activity>("/api/activities", data);
      setActivities((prev) => prev.map((a) => (a.id === tempId ? result : a)));
    } catch {
      loadData();
    }
  }, [loadData]);

  // ===== Computed =====
  const getFundingSummary = useCallback((): FundingSummary => {
    const approvedDonations = donations.filter((d) => d.status === "approved");
    const totalCollected = approvedDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalSpent = expenses
      .filter((e) => e.status === "approved")
      .reduce((sum, e) => sum + e.amount, 0);

    const now = new Date();
    const thisMonth = approvedDonations
      .filter((d) => {
        const date = new Date(d.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, d) => sum + d.amount, 0);

    const thisMonthSpent = expenses
      .filter((e) => {
        const date = new Date(e.date);
        return e.status === "approved" && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const thisYear = approvedDonations
      .filter((d) => new Date(d.date).getFullYear() === now.getFullYear())
      .reduce((sum, d) => sum + d.amount, 0);

    const thisYearSpent = expenses
      .filter((e) => e.status === "approved" && new Date(e.date).getFullYear() === now.getFullYear())
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalCollected,
      totalSpent,
      balance: totalCollected - totalSpent,
      thisMonth: { collected: thisMonth, spent: thisMonthSpent },
      thisYear: { collected: thisYear, spent: thisYearSpent },
    };
  }, [donations, expenses]);

  return (
    <StoreContext.Provider
      value={{
        activities,
        aidRecords,
        beneficiaries,
        campaigns,
        donations,
        expenses,
        notifications,
        requests,
        auditLog,
        users,
        isLoading,
        error,
        refreshData: loadData,
        dataUrduMap,
        getFundingSummary,
        approveExpense,
        rejectExpense,
        verifyAid,
        approveAid,
        deliverAid,
        submitRequest,
        reviewRequest,
        approveRequest,
        rejectRequest,
        convertRequestToAid,
        markNotificationRead,
        dismissNotification,
        markAllNotificationsRead,
        recordDonation,
        approveDonation,
        rejectDonation,
        createCampaign,
        addActivity,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
