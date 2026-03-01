// ==========================================
// Gajukhel Zalmi — Core Type Definitions
// ==========================================

// --- Roles & Users ---
export type UserRole = "public" | "user" | "volunteer" | "super_admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  village?: string;
  joinedAt: string;
  avatar?: string;
}

// --- Activities ---
export type ActivityStatus = "planned" | "ongoing" | "completed";

export interface Activity {
  id: string;
  title: string;
  title_ur?: string;
  description: string;
  description_ur?: string;
  whyItMatters: string;
  whyItMatters_ur?: string;
  date: string;
  location: string;
  location_ur?: string;
  status: ActivityStatus;
  volunteers: string[];
  photosBefore?: string[];
  photosAfter?: string[];
  photos?: string[];
  createdBy: string;
  createdAt: string;
}

// --- Campaigns ---
export interface CampaignExpense {
  id: string;
  description: string;
  description_ur?: string;
  amount: number;
  date: string;
  approvedBy: string;
  receiptUrl?: string;
  category: string;
}

export interface CampaignUpdate {
  id: string;
  date: string;
  message: string;
  message_ur?: string;
  author: string;
}

export interface Campaign {
  id: string;
  title: string;
  title_ur?: string;
  purpose: string;
  purpose_ur?: string;
  targetAmount: number;
  collectedAmount: number;
  spentAmount: number;
  startDate: string;
  endDate?: string;
  status: "active" | "completed" | "upcoming";
  expenses: CampaignExpense[];
  updates: CampaignUpdate[];
  createdBy: string;
  createdAt: string;
  coverImage?: string;
}

// --- Donations / Funding ---
export type DonationSource = "cash" | "bank" | "online" | "other";

export interface Donation {
  id: string;
  amount: number;
  source: DonationSource;
  donorName?: string;
  anonymous: boolean;
  date: string;
  campaignId?: string;
  notes?: string;
  recordedBy: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
}

export interface Expense {
  id: string;
  description: string;
  description_ur?: string;
  amount: number;
  category: string;
  date: string;
  campaignId?: string;
  approvedBy?: string;
  status: "pending" | "approved" | "rejected";
  receiptUrl?: string;
  submittedBy: string;
  submittedAt: string;
  approvedAt?: string;
  notes?: string;
}

// --- Aid & Beneficiaries ---
export type AidStatus = "applied" | "verified" | "approved" | "delivered" | "closed";
export type AidType = "food" | "medical" | "education" | "financial" | "housing" | "clothing" | "other";

export interface Beneficiary {
  id: string;
  fullName: string;
  initials: string;
  maskedName: string;
  familySize?: number;
  village: string;
  aidHistory: AidRecord[];
  verificationNotes?: string;
  verificationNotes_ur?: string;
  createdAt: string;
}

export interface AidRecord {
  id: string;
  beneficiaryId: string;
  aidType: AidType;
  description: string;
  description_ur?: string;
  amount?: number;
  status: AidStatus;
  appliedDate: string;
  verifiedDate?: string;
  approvedDate?: string;
  deliveredDate?: string;
  closedDate?: string;
  approvedBy?: string;
  notes?: string;
  campaignId?: string;
}

// --- Requests ---
export type RequestType = "aid" | "work";
export type RequestStatus = "submitted" | "reviewing" | "verified" | "approved" | "rejected" | "converted";

export interface Request {
  id: string;
  type: RequestType;
  name?: string;
  anonymous: boolean;
  phone?: string;
  description: string;
  description_ur?: string;
  urgency?: "low" | "medium" | "high";
  status: RequestStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
  convertedTo?: string; // campaignId or aidRecordId
}

// --- Reports ---
export interface Report {
  id: string;
  title: string;
  type: "monthly_funding" | "campaign_summary" | "aid_distribution" | "volunteer_contributions";
  period: string;
  generatedAt: string;
  generatedBy: string;
  data: Record<string, unknown>;
}

// --- Audit Log ---
export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
  details_ur?: string;
  previousValue?: string;
  newValue?: string;
}

// --- Notifications ---
export interface Notification {
  id: string;
  title: string;
  title_ur?: string;
  message: string;
  message_ur?: string;
  type: "campaign" | "aid" | "funding" | "activity" | "system";
  date: string;
  read: boolean;
  link?: string;
}

// --- Funding Summary ---
export interface FundingSummary {
  totalCollected: number;
  totalSpent: number;
  balance: number;
  thisMonth: {
    collected: number;
    spent: number;
  };
  thisYear: {
    collected: number;
    spent: number;
  };
}
