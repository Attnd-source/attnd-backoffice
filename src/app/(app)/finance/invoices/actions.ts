"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { str, strOrNull } from "@/lib/form";
import { netRevenue } from "@/lib/finance";
import { PAYMENT_STATUSES, PAYMENT_STATUSES_2 } from "@/lib/constants";

function num(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? ""));
  return isNaN(n) ? 0 : n;
}

function buildSuppliers(fd: FormData) {
  const supplierIds = fd.getAll("supplierId").map(String);
  const commissions = fd.getAll("commissionPct").map((v) => num(v));
  const downPayments = fd.getAll("downPayment").map(String);
  const actualCosts = fd.getAll("actualCost").map((v) => num(v));
  const offerCosts = fd.getAll("offerCost").map((v) => num(v));
  const bankInfos = fd.getAll("partnerBankInfo").map(String);
  const firstStatuses = fd.getAll("firstPaymentStatus").map(String);
  const secondStatuses = fd.getAll("secondPaymentStatus").map(String);

  const rows = [];
  for (let i = 0; i < supplierIds.length; i++) {
    if (!supplierIds[i]) continue; // skip empty rows
    const commissionPct = commissions[i] ?? 0;
    const actualCost = actualCosts[i] ?? 0;
    const offerCost = offerCosts[i] ?? 0;
    rows.push({
      supplierId: supplierIds[i],
      commissionPct,
      downPayment: downPayments[i] || null,
      actualCost,
      offerCost,
      netRevenue: netRevenue(offerCost, actualCost, commissionPct),
      partnerBankInfo: bankInfos[i] || null,
      firstPaymentStatus: PAYMENT_STATUSES.includes(firstStatuses[i] as any)
        ? firstStatuses[i]
        : "PENDING",
      secondPaymentStatus: PAYMENT_STATUSES_2.includes(secondStatuses[i] as any)
        ? secondStatuses[i]
        : "NA",
    });
  }
  return rows;
}

export async function createInvoice(fd: FormData): Promise<void> {
  const session = await getSession();
  if (!session) return;
  const serviceProviderId = str(fd, "serviceProviderId");
  const eventId = str(fd, "eventId");
  if (!serviceProviderId || !eventId) return; // required fields enforced in the form

  let attachmentName: string | null = null;
  let attachmentType: string | null = null;
  let attachmentData: Buffer | null = null;
  const file = fd.get("attachment");
  if (file instanceof File && file.size > 0) {
    if (file.size > 10 * 1024 * 1024) return; // 10 MB cap
    attachmentName = file.name;
    attachmentType = file.type || "application/octet-stream";
    attachmentData = Buffer.from(await file.arrayBuffer());
  }

  const suppliers = buildSuppliers(fd);

  const invoice = await prisma.invoice.create({
    data: {
      serviceProviderId,
      eventId,
      attachmentName,
      attachmentType,
      attachmentData,
      note: strOrNull(fd, "note"),
      createdById: session.id,
      suppliers: { create: suppliers },
    },
    include: { serviceProvider: true },
  });

  await recordAudit({
    entityType: "Invoice",
    entityId: invoice.id,
    entityLabel: invoice.serviceProvider.partnerName,
    action: "CREATE",
    userId: session.id,
  });
  revalidatePath("/finance");
  redirect(`/finance/invoices/${invoice.id}`);
}

export async function updateInvoiceStatuses(fd: FormData) {
  const session = await getSession();
  if (!session) return;
  const id = str(fd, "id");
  const supplierRowId = str(fd, "supplierRowId");
  const first = str(fd, "firstPaymentStatus");
  const second = str(fd, "secondPaymentStatus");
  const before = await prisma.invoiceSupplier.findUnique({ where: { id: supplierRowId } });
  if (!before) return;

  await prisma.invoiceSupplier.update({
    where: { id: supplierRowId },
    data: {
      firstPaymentStatus: PAYMENT_STATUSES.includes(first as any) ? first : before.firstPaymentStatus,
      secondPaymentStatus: PAYMENT_STATUSES_2.includes(second as any)
        ? second
        : before.secondPaymentStatus,
    },
  });
  await recordAudit({
    entityType: "Invoice",
    entityId: id,
    action: "UPDATE",
    changes: {
      "1st payment": { old: before.firstPaymentStatus, new: first },
      "2nd payment": { old: before.secondPaymentStatus, new: second },
    },
    userId: session.id,
  });
  revalidatePath(`/finance/invoices/${id}`);
}
