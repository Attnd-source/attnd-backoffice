"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { str, dateOrNull, floatOr } from "@/lib/form";
import { attndCommission, vatOn, invoicedAmount } from "@/lib/finance";

export async function createGeneratedInvoice(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };

  const serviceProviderId = str(fd, "serviceProviderId");
  const eventId = str(fd, "eventId");
  if (!serviceProviderId || !eventId) return { error: "Service provider and event are required." };

  const actualCost = floatOr(fd, "actualCost");
  const commissionPct = floatOr(fd, "commissionPct");
  const commission = attndCommission(actualCost, commissionPct);
  const vat = vatOn(commission);
  const invoiced = invoicedAmount(actualCost, commission, vat);

  const last = await prisma.generatedInvoice.findFirst({ orderBy: { number: "desc" } });
  const number = (last?.number ?? 1000) + 1;

  const gi = await prisma.generatedInvoice.create({
    data: {
      number,
      serviceProviderId,
      eventId,
      eventDate: dateOrNull(fd, "eventDate"),
      actualCost,
      attndCommission: commission,
      vat,
      invoicedAmount: invoiced,
      createdById: session.id,
    },
    include: { serviceProvider: true },
  });

  await recordAudit({
    entityType: "GeneratedInvoice",
    entityId: gi.id,
    entityLabel: `INV-${number} · ${gi.serviceProvider.partnerName}`,
    action: "CREATE",
    changes: { invoicedAmount: { old: null, new: invoiced } },
    userId: session.id,
  });
  revalidatePath("/finance");
  redirect(`/finance/generate/${gi.id}`);
}
