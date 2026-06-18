"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { str, strOrNull } from "@/lib/form";
import {
  netRevenue,
  attndCommission,
  vatOn,
  supplierInvoiced,
  firstPayment,
  secondPayment,
} from "@/lib/finance";
import { PAYMENT_STATUSES, PAYMENT_STATUSES_2 } from "@/lib/constants";

function num(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? ""));
  return isNaN(n) ? 0 : n;
}

const MAX_FILE = 10 * 1024 * 1024;

async function buildSuppliers(fd: FormData) {
  const supplierIds = fd.getAll("supplierId").map(String);
  const commissions = fd.getAll("commissionPct").map(num);
  const downPays = fd.getAll("downPaymentPct").map(num);
  const actualCosts = fd.getAll("actualCost").map(num);
  const offerCosts = fd.getAll("offerCost").map(num);
  const bankInfos = fd.getAll("partnerBankInfo").map(String);
  const firstStatuses = fd.getAll("firstPaymentStatus").map(String);
  const secondStatuses = fd.getAll("secondPaymentStatus").map(String);
  const files = fd.getAll("attachment");

  const rows = [];
  for (let i = 0; i < supplierIds.length; i++) {
    if (!supplierIds[i]) continue;
    const commissionPct = commissions[i] ?? 0;
    const downPaymentPct = downPays[i] ?? 0;
    const actualCost = actualCosts[i] ?? 0;
    const offerCost = offerCosts[i] ?? 0;
    const invoiced = supplierInvoiced(actualCost, commissionPct);
    const commission = attndCommission(actualCost, commissionPct);

    let attachmentName: string | null = null;
    let attachmentType: string | null = null;
    let attachmentData: Buffer | null = null;
    const file = files[i];
    if (file instanceof File && file.size > 0 && file.size <= MAX_FILE) {
      attachmentName = file.name;
      attachmentType = file.type || "application/octet-stream";
      attachmentData = Buffer.from(await file.arrayBuffer());
    }

    rows.push({
      supplierId: supplierIds[i],
      commissionPct,
      downPaymentPct,
      actualCost,
      offerCost,
      netRevenue: netRevenue(offerCost, actualCost, commissionPct),
      attndCommission: commission,
      vat: vatOn(commission),
      invoicedAmount: invoiced,
      firstPaymentAmount: firstPayment(invoiced, downPaymentPct),
      secondPaymentAmount: secondPayment(invoiced, downPaymentPct),
      partnerBankInfo: bankInfos[i] || null,
      firstPaymentStatus: PAYMENT_STATUSES.includes(firstStatuses[i] as any) ? firstStatuses[i] : "PENDING",
      secondPaymentStatus: PAYMENT_STATUSES_2.includes(secondStatuses[i] as any) ? secondStatuses[i] : "NA",
      attachmentName,
      attachmentType,
      attachmentData,
    });
  }
  return rows;
}

export async function createInvoice(fd: FormData): Promise<void> {
  const session = await getSession();
  if (!session) return;
  const serviceProviderId = str(fd, "serviceProviderId");
  const eventId = str(fd, "eventId");
  if (!serviceProviderId || !eventId) return;

  const suppliers = await buildSuppliers(fd);

  const invoice = await prisma.invoice.create({
    data: {
      serviceProviderId,
      eventId,
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
      secondPaymentStatus: PAYMENT_STATUSES_2.includes(second as any) ? second : before.secondPaymentStatus,
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

export async function deleteInvoice(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Only admins can delete." };
  const id = str(fd, "id");
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { serviceProvider: true } });
  if (!invoice) return { error: "Not found." };
  await recordAudit({
    entityType: "Invoice",
    entityId: id,
    entityLabel: invoice.serviceProvider.partnerName,
    action: "DELETE",
    userId: session.id,
  });
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/finance");
  redirect("/finance");
}
