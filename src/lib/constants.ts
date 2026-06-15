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
};

export function label(map: Record<string, string>, key?: string | null): string {
  if (!key) return "—";
  return map[key] ?? key;
}
