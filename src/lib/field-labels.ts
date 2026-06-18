// Human-friendly labels for fields shown in the edit-history panel.
export const FIELD_LABELS: Record<string, string> = {
  // common
  note: "Note",
  status: "Status",
  // contract
  type: "Type",
  subcategoryId: "Subcategory",
  partnerName: "Partner name",
  pointOfContact: "Point of contact",
  communicationType: "Communication type",
  communicationAddr: "Communication address",
  dateOfIssue: "Date of issue",
  contractIssuingDate: "Contract issuing date",
  contractPeriod: "Contract period (months)",
  contractRenewal: "Contract renewal",
  commissionPct: "Commission %",
  downPaymentPct: "Down payment %",
  crNumber: "CR / Freelance number",
  vatNumber: "VAT number",
  iban: "IBAN",
  // organizer
  name: "Name",
  communicationChannel: "Communication channel",
  communicationInfo: "Communication info",
  date: "Date",
  // event
  organizerId: "Organizer",
  eventName: "Event name",
  typeOfEvent: "Type of event",
  numberOfAttendees: "Number of attendees",
  expectedBudget: "Expected budget",
  city: "City",
  eventDate: "Event date",
  serviceProviderId: "Service provider",
  externalPartner: "External partner",
  partnerBankInfo: "Partner bank info",
  servicesNeeded: "Services needed",
  // user
  email: "Email",
  mobile: "Mobile",
  role: "Role",
  active: "Active",
  password: "Password",
  // finance
  actualCost: "Actual cost",
  offerCost: "Offer cost",
  invoicedAmount: "Invoiced amount",
  attachmentName: "Attachment",
};

export function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key;
}
