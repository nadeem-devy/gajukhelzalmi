import { google } from "googleapis";

// ===== Auth =====
let authClient: ReturnType<typeof google.auth.JWT.prototype.authorize> extends Promise<infer T> ? T : never;

function getAuth() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/cloud-translation",
    ],
  });
  return auth;
}

function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

// ===== Generic Helpers =====

export async function readAllRows(tabName: string): Promise<string[][]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A:ZZ`,
  });
  const rows = res.data.values || [];
  // First row is headers, return data rows
  return rows.length > 1 ? rows.slice(1) : [];
}

export async function readHeaders(tabName: string): Promise<string[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!1:1`,
  });
  return res.data.values?.[0] || [];
}

export async function appendRow(tabName: string, values: (string | number | boolean)[]): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A:ZZ`,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });
}

export async function updateRow(tabName: string, rowIndex: number, values: (string | number | boolean)[]): Promise<void> {
  const sheets = getSheets();
  // rowIndex is 0-based for data rows, +2 for header row + 1-based indexing
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A${rowIndex + 2}`,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });
}

export async function findRowIndex(tabName: string, id: string): Promise<number> {
  const rows = await readAllRows(tabName);
  return rows.findIndex((row) => row[0] === id);
}

export async function batchAppend(tabName: string, rows: (string | number | boolean)[][]): Promise<void> {
  if (rows.length === 0) return;
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A:ZZ`,
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });
}

// ===== Row <-> Object Mappers =====

import type {
  User, Activity, Campaign, CampaignExpense, CampaignUpdate,
  Donation, Expense, Beneficiary, AidRecord, Request,
  Notification, AuditEntry,
} from "./types";

// --- Users ---
// Columns: id, name, role, phone, village, joinedAt, password
export function rowToUser(row: string[]): User {
  return {
    id: row[0] || "",
    name: row[1] || "",
    role: (row[2] as User["role"]) || "public",
    phone: row[3] || undefined,
    village: row[4] || undefined,
    joinedAt: row[5] || "",
  };
}

export function userToRow(u: User & { password?: string }): (string | number | boolean)[] {
  return [u.id, u.name, u.role, u.phone || "", u.village || "", u.joinedAt, u.password || ""];
}

// --- Activities ---
// Columns: id, title_en, title_ur, description_en, description_ur, whyItMatters_en, whyItMatters_ur, date, location_en, location_ur, status, volunteers, createdBy, createdAt
export function rowToActivity(row: string[]): Activity {
  return {
    id: row[0] || "",
    title: row[1] || "",
    title_ur: row[2] || undefined,
    description: row[3] || "",
    description_ur: row[4] || undefined,
    whyItMatters: row[5] || "",
    whyItMatters_ur: row[6] || undefined,
    date: row[7] || "",
    location: row[8] || "",
    location_ur: row[9] || undefined,
    status: (row[10] as Activity["status"]) || "planned",
    volunteers: row[11] ? JSON.parse(row[11]) : [],
    createdBy: row[12] || "",
    createdAt: row[13] || "",
  };
}

export function activityToRow(a: Activity): (string | number | boolean)[] {
  return [
    a.id, a.title, a.title_ur || "", a.description, a.description_ur || "",
    a.whyItMatters, a.whyItMatters_ur || "", a.date, a.location, a.location_ur || "",
    a.status, JSON.stringify(a.volunteers), a.createdBy, a.createdAt,
  ];
}

// --- Campaigns ---
// Columns: id, title_en, title_ur, purpose_en, purpose_ur, targetAmount, collectedAmount, spentAmount, startDate, endDate, status, createdBy, createdAt
export function rowToCampaign(row: string[], expenses: CampaignExpense[], updates: CampaignUpdate[]): Campaign {
  return {
    id: row[0] || "",
    title: row[1] || "",
    title_ur: row[2] || undefined,
    purpose: row[3] || "",
    purpose_ur: row[4] || undefined,
    targetAmount: Number(row[5]) || 0,
    collectedAmount: Number(row[6]) || 0,
    spentAmount: Number(row[7]) || 0,
    startDate: row[8] || "",
    endDate: row[9] || undefined,
    status: (row[10] as Campaign["status"]) || "active",
    createdBy: row[11] || "",
    createdAt: row[12] || "",
    expenses,
    updates,
  };
}

export function campaignToRow(c: Campaign): (string | number | boolean)[] {
  return [
    c.id, c.title, c.title_ur || "", c.purpose, c.purpose_ur || "",
    c.targetAmount, c.collectedAmount, c.spentAmount,
    c.startDate, c.endDate || "", c.status, c.createdBy, c.createdAt,
  ];
}

// --- Campaign Expenses ---
// Columns: id, campaignId, description_en, description_ur, amount, date, approvedBy, category, receiptUrl
export function rowToCampaignExpense(row: string[]): CampaignExpense {
  return {
    id: row[0] || "",
    description: row[2] || "",
    description_ur: row[3] || undefined,
    amount: Number(row[4]) || 0,
    date: row[5] || "",
    approvedBy: row[6] || "",
    category: row[7] || "",
    receiptUrl: row[8] || undefined,
  };
}

export function campaignExpenseToRow(e: CampaignExpense & { campaignId?: string }): (string | number | boolean)[] {
  return [
    e.id, e.campaignId || "", e.description, e.description_ur || "",
    e.amount, e.date, e.approvedBy, e.category, e.receiptUrl || "",
  ];
}

// --- Campaign Updates ---
// Columns: id, campaignId, message_en, message_ur, date, author
export function rowToCampaignUpdate(row: string[]): CampaignUpdate {
  return {
    id: row[0] || "",
    date: row[2] || "",
    message: row[3] || "",
    message_ur: row[4] || undefined,
    author: row[5] || "",
  };
}

export function campaignUpdateToRow(u: CampaignUpdate & { campaignId?: string }): (string | number | boolean)[] {
  return [u.id, u.campaignId || "", u.date, u.message, u.message_ur || "", u.author];
}

// --- Donations ---
// Columns: id, donorName, amount, source, date, anonymous, campaignId, notes, recordedBy, status, approvedBy, approvedAt
export function rowToDonation(row: string[]): Donation {
  return {
    id: row[0] || "",
    donorName: row[1] || undefined,
    amount: Number(row[2]) || 0,
    source: (row[3] as Donation["source"]) || "cash",
    date: row[4] || "",
    anonymous: row[5] === "TRUE" || row[5] === "true",
    campaignId: row[6] || undefined,
    notes: row[7] || undefined,
    recordedBy: row[8] || "",
    status: (row[9] as Donation["status"]) || "approved",
    approvedBy: row[10] || undefined,
    approvedAt: row[11] || undefined,
  };
}

export function donationToRow(d: Donation): (string | number | boolean)[] {
  return [d.id, d.donorName || "", d.amount, d.source, d.date, d.anonymous, d.campaignId || "", d.notes || "", d.recordedBy, d.status, d.approvedBy || "", d.approvedAt || ""];
}

// --- Expenses ---
// Columns: id, description_en, description_ur, amount, category, date, campaignId, status, submittedBy, submittedAt, approvedBy, approvedAt, notes, receiptUrl
export function rowToExpense(row: string[]): Expense {
  return {
    id: row[0] || "",
    description: row[1] || "",
    description_ur: row[2] || undefined,
    amount: Number(row[3]) || 0,
    category: row[4] || "",
    date: row[5] || "",
    campaignId: row[6] || undefined,
    status: (row[7] as Expense["status"]) || "pending",
    submittedBy: row[8] || "",
    submittedAt: row[9] || "",
    approvedBy: row[10] || undefined,
    approvedAt: row[11] || undefined,
    notes: row[12] || undefined,
    receiptUrl: row[13] || undefined,
  };
}

export function expenseToRow(e: Expense): (string | number | boolean)[] {
  return [
    e.id, e.description, e.description_ur || "", e.amount, e.category, e.date,
    e.campaignId || "", e.status, e.submittedBy, e.submittedAt,
    e.approvedBy || "", e.approvedAt || "", e.notes || "", e.receiptUrl || "",
  ];
}

// --- Beneficiaries ---
// Columns: id, fullName, maskedName, initials, village, familySize, verificationNotes_en, verificationNotes_ur, createdAt
export function rowToBeneficiary(row: string[], aidHistory: AidRecord[]): Beneficiary {
  return {
    id: row[0] || "",
    fullName: row[1] || "",
    maskedName: row[2] || "",
    initials: row[3] || "",
    village: row[4] || "",
    familySize: row[5] ? Number(row[5]) : undefined,
    verificationNotes: row[6] || undefined,
    verificationNotes_ur: row[7] || undefined,
    aidHistory,
    createdAt: row[8] || "",
  };
}

export function beneficiaryToRow(b: Beneficiary): (string | number | boolean)[] {
  return [
    b.id, b.fullName, b.maskedName, b.initials, b.village,
    b.familySize || "", b.verificationNotes || "", b.verificationNotes_ur || "", b.createdAt,
  ];
}

// --- Aid Records ---
// Columns: id, beneficiaryId, aidType, description_en, description_ur, amount, status, appliedDate, verifiedDate, approvedDate, deliveredDate, closedDate, approvedBy, notes, campaignId
export function rowToAidRecord(row: string[]): AidRecord {
  return {
    id: row[0] || "",
    beneficiaryId: row[1] || "",
    aidType: (row[2] as AidRecord["aidType"]) || "other",
    description: row[3] || "",
    description_ur: row[4] || undefined,
    amount: row[5] ? Number(row[5]) : undefined,
    status: (row[6] as AidRecord["status"]) || "applied",
    appliedDate: row[7] || "",
    verifiedDate: row[8] || undefined,
    approvedDate: row[9] || undefined,
    deliveredDate: row[10] || undefined,
    closedDate: row[11] || undefined,
    approvedBy: row[12] || undefined,
    notes: row[13] || undefined,
    campaignId: row[14] || undefined,
  };
}

export function aidRecordToRow(a: AidRecord): (string | number | boolean)[] {
  return [
    a.id, a.beneficiaryId, a.aidType, a.description, a.description_ur || "",
    a.amount || "", a.status, a.appliedDate,
    a.verifiedDate || "", a.approvedDate || "", a.deliveredDate || "",
    a.closedDate || "", a.approvedBy || "", a.notes || "", a.campaignId || "",
  ];
}

// --- Requests ---
// Columns: id, type, name, anonymous, phone, description_en, description_ur, urgency, status, submittedAt, reviewedAt, reviewedBy, adminNotes, convertedTo
export function rowToRequest(row: string[]): Request {
  return {
    id: row[0] || "",
    type: (row[1] as Request["type"]) || "aid",
    name: row[2] || undefined,
    anonymous: row[3] === "TRUE" || row[3] === "true",
    phone: row[4] || undefined,
    description: row[5] || "",
    description_ur: row[6] || undefined,
    urgency: (row[7] as Request["urgency"]) || undefined,
    status: (row[8] as Request["status"]) || "submitted",
    submittedAt: row[9] || "",
    reviewedAt: row[10] || undefined,
    reviewedBy: row[11] || undefined,
    adminNotes: row[12] || undefined,
    convertedTo: row[13] || undefined,
  };
}

export function requestToRow(r: Request): (string | number | boolean)[] {
  return [
    r.id, r.type, r.name || "", r.anonymous, r.phone || "",
    r.description, r.description_ur || "", r.urgency || "",
    r.status, r.submittedAt, r.reviewedAt || "", r.reviewedBy || "",
    r.adminNotes || "", r.convertedTo || "",
  ];
}

// --- Notifications ---
// Columns: id, title_en, title_ur, message_en, message_ur, type, date, read, link
export function rowToNotification(row: string[]): Notification {
  return {
    id: row[0] || "",
    title: row[1] || "",
    title_ur: row[2] || undefined,
    message: row[3] || "",
    message_ur: row[4] || undefined,
    type: (row[5] as Notification["type"]) || "system",
    date: row[6] || "",
    read: row[7] === "TRUE" || row[7] === "true",
    link: row[8] || undefined,
  };
}

export function notificationToRow(n: Notification): (string | number | boolean)[] {
  return [n.id, n.title, n.title_ur || "", n.message, n.message_ur || "", n.type, n.date, n.read, n.link || ""];
}

// --- Audit Log ---
// Columns: id, action, entityType, entityId, userId, userName, details_en, details_ur, timestamp, previousValue, newValue
export function rowToAuditEntry(row: string[]): AuditEntry {
  return {
    id: row[0] || "",
    action: row[1] || "",
    entityType: row[2] || "",
    entityId: row[3] || "",
    userId: row[4] || "",
    userName: row[5] || "",
    details: row[6] || "",
    details_ur: row[7] || undefined,
    timestamp: row[8] || "",
    previousValue: row[9] || undefined,
    newValue: row[10] || undefined,
  };
}

export function auditEntryToRow(a: AuditEntry): (string | number | boolean)[] {
  return [
    a.id, a.action, a.entityType, a.entityId, a.userId, a.userName,
    a.details, a.details_ur || "", a.timestamp, a.previousValue || "", a.newValue || "",
  ];
}

// ===== High-Level Data Loaders =====

export async function loadUsers(): Promise<User[]> {
  const rows = await readAllRows("Users");
  return rows.map(rowToUser);
}

export async function loadActivities(): Promise<Activity[]> {
  const rows = await readAllRows("Activities");
  return rows.map(rowToActivity);
}

export async function loadCampaigns(): Promise<Campaign[]> {
  const [campRows, expRows, updRows] = await Promise.all([
    readAllRows("Campaigns"),
    readAllRows("CampaignExpenses"),
    readAllRows("CampaignUpdates"),
  ]);
  return campRows.map((row) => {
    const id = row[0];
    const expenses = expRows.filter((r) => r[1] === id).map(rowToCampaignExpense);
    const updates = updRows.filter((r) => r[1] === id).map(rowToCampaignUpdate);
    return rowToCampaign(row, expenses, updates);
  });
}

export async function loadDonations(): Promise<Donation[]> {
  const rows = await readAllRows("Donations");
  return rows.map(rowToDonation);
}

export async function loadExpenses(): Promise<Expense[]> {
  const rows = await readAllRows("Expenses");
  return rows.map(rowToExpense);
}

export async function loadBeneficiaries(): Promise<Beneficiary[]> {
  const [benRows, aidRows] = await Promise.all([
    readAllRows("Beneficiaries"),
    readAllRows("AidRecords"),
  ]);
  const allAidRecords = aidRows.map(rowToAidRecord);
  return benRows.map((row) => {
    const id = row[0];
    const aidHistory = allAidRecords.filter((a) => a.beneficiaryId === id);
    return rowToBeneficiary(row, aidHistory);
  });
}

export async function loadAidRecords(): Promise<AidRecord[]> {
  const rows = await readAllRows("AidRecords");
  return rows.map(rowToAidRecord);
}

export async function loadRequests(): Promise<Request[]> {
  const rows = await readAllRows("Requests");
  return rows.map(rowToRequest);
}

export async function loadNotifications(): Promise<Notification[]> {
  const rows = await readAllRows("Notifications");
  return rows.map(rowToNotification);
}

export async function loadAuditLog(): Promise<AuditEntry[]> {
  const rows = await readAllRows("AuditLog");
  return rows.map(rowToAuditEntry);
}
