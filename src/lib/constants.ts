// Enum-like value sets + human labels. Single source for dropdowns, validation,
// and display. (SQLite has no native enums, so these live in app code.)

export const ROLES = ["ADMIN", "STAFF"] as const;
export type Role = (typeof ROLES)[number];

export const PARTNER_TYPES = ["VENUE", "VENDOR"] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];
export const PARTNER_TYPE_LABELS: Record<string, string> = {
  VENUE: "Venue",
  VENDOR: "Vendor",
};

export const COMMUNICATION_TYPES = ["PHONE", "EMAIL", "VISIT", "WHATSAPP"] as const;
export const COMMUNICATION_TYPE_LABELS: Record<string, string> = {
  PHONE: "Phone call",
  EMAIL: "Email",
  VISIT: "Visit",
  WHATSAPP: "WhatsApp",
};

export const CONTRACT_STATUSES = [
  "CONTACTED",
  "PENDING",
  "CONTRACT_SENT",
  "SIGNED",
  "REJECTED",
] as const;
export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  CONTACTED: "Contacted",
  PENDING: "Pending",
  CONTRACT_SENT: "Contract sent",
  SIGNED: "Signed",
  REJECTED: "Rejected",
};

export const ORGANIZER_CHANNELS = [
  "REFERRAL",
  "LINKEDIN",
  "MARKETING_LEAD",
  "VISIT",
  "NETWORK",
  "PLATFORM",
  "EMAILS",
  "INSTAGRAM",
  "WEBSEARCH",
  "LUSHA",
  "OTHER_EVENTS",
] as const;
export const ORGANIZER_CHANNEL_LABELS: Record<string, string> = {
  REFERRAL: "Referral",
  LINKEDIN: "LinkedIn",
  MARKETING_LEAD: "Marketing lead",
  VISIT: "Visit",
  NETWORK: "Network",
  PLATFORM: "Platform",
  EMAILS: "Emails",
  INSTAGRAM: "Instagram",
  WEBSEARCH: "Web search",
  LUSHA: "Lusha",
  OTHER_EVENTS: "Other events",
};

export const EVENT_STATUSES = ["NEW", "PENDING", "SIGNED", "REJECTED"] as const;
export const EVENT_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  PENDING: "Pending",
  SIGNED: "Signed",
  REJECTED: "Rejected",
};

export const PAYMENT_STATUSES = ["PENDING", "PAID", "REJECTED"] as const;
export const PAYMENT_STATUSES_2 = ["PENDING", "PAID", "REJECTED", "NA"] as const;
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  REJECTED: "Rejected",
  NA: "N/A",
};

// Status badge color intent, used by <StatusBadge />.
export const STATUS_INTENT: Record<string, "success" | "warning" | "danger" | "info" | "muted"> = {
  // contract
  CONTACTED: "info",
  PENDING: "warning",
  CONTRACT_SENT: "info",
  SIGNED: "success",
  REJECTED: "danger",
  // event
  NEW: "info",
  // payment
  PAID: "success",
  NA: "muted",
  // crm stages
  NOT_HANDLED: "muted",
  PROPOSED: "info",
  VISIT: "warning",
};

export function label(map: Record<string, string>, key?: string | null): string {
  if (!key) return "—";
  return map[key] ?? key;
}

// ---- CRM ----
export const CRM_STAGE1 = ["NOT_HANDLED", "CONTACTED", "PROPOSED", "VISIT", "SIGNED", "REJECTED"] as const;
export const CRM_STAGE = ["CONTACTED", "PROPOSED", "VISIT", "SIGNED", "REJECTED"] as const;
export const CRM_STAGE_LABELS: Record<string, string> = {
  NOT_HANDLED: "Not handled",
  CONTACTED: "Contacted",
  PROPOSED: "Proposed",
  VISIT: "Visit",
  SIGNED: "Signed",
  REJECTED: "Rejected",
};
export const CRM_STAGE_INTENT: Record<string, "success" | "warning" | "danger" | "info" | "muted"> = {
  NOT_HANDLED: "muted",
  CONTACTED: "info",
  PROPOSED: "info",
  VISIT: "warning",
  SIGNED: "success",
  REJECTED: "danger",
};

// Admin-editable list keys.
export const LIST_KEYS = ["SOURCE", "PRIORITY", "CITY"] as const;
export type ListKey = (typeof LIST_KEYS)[number];
export const LIST_KEY_LABELS: Record<string, string> = {
  SOURCE: "Source",
  PRIORITY: "Priority",
  CITY: "City",
};

// Defaults seeded into ListOption (admin can add/remove afterwards).
export const DEFAULT_SOURCES = [
  "Referral", "Website", "Exhibition", "Network", "Email", "LinkedIn", "Google", "Instagram", "TikTok",
];
export const DEFAULT_PRIORITIES = ["Warm", "Medium", "Cold"];
export const DEFAULT_CITIES = [
  "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Dhahran", "Taif", "Tabuk", "Buraidah",
  "Khamis Mushait", "Abha", "Hail", "Najran", "Jubail", "Yanbu", "Al Ahsa", "Jazan", "Qatif", "NEOM",
];
