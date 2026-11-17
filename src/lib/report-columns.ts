// Column names per report dataset — shared by the server report builder and the
// client column-picker (so the checkboxes always match the generated columns).
export const DATASET_COLUMNS: Record<string, string[]> = {
  contracts: [
    "Partner", "Type", "Subcategory", "Status", "Issuer", "Date of issue", "Issuing date",
    "Renewal", "Commission %", "Down payment %", "CR/Freelance", "VAT no.", "IBAN",
  ],
  organizers: ["Name", "Channel", "Contact info", "Lead issuer", "Date"],
  events: [
    "Event", "Organizer", "Type", "Status", "City", "Attendees", "Expected budget",
    "Event date", "Service providers", "Issuer",
  ],
  invoices: ["Service provider", "Event", "Suppliers", "Total net revenue", "Created by", "Created"],
  generated: [
    "Invoice #", "Service provider", "Event", "Event date", "Actual cost", "Attnd commission",
    "VAT", "Invoiced amount", "Created by", "Created",
  ],
  crm: [
    "Customer", "Company", "City", "Source", "Priority", "Current stage", "Assigned to",
    "Agent", "Event value", "Date",
  ],
};
