"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordAudit, diff } from "@/lib/audit";
import { str, strOrNull, dateOrNull, intOrNull, floatOr } from "@/lib/form";
import { PARTNER_TYPES, CONTRACT_STATUSES, COMMUNICATION_TYPES } from "@/lib/constants";

function parse(fd: FormData) {
  const type = str(fd, "type");
  const partnerName = str(fd, "partnerName");
  const status = str(fd, "status") || "CONTACTED";
  const communicationType = strOrNull(fd, "communicationType");

  if (!PARTNER_TYPES.includes(type as any)) return { error: "Select a contract type." };
  if (!partnerName) return { error: "Partner name is required." };
  if (!CONTRACT_STATUSES.includes(status as any)) return { error: "Invalid status." };
  if (communicationType && !COMMUNICATION_TYPES.includes(communicationType as any))
    return { error: "Invalid communication type." };

  return {
    data: {
      type,
      subcategoryId: strOrNull(fd, "subcategoryId"),
      partnerName,
      pointOfContact: strOrNull(fd, "pointOfContact"),
      communicationType,
      communicationAddr: strOrNull(fd, "communicationAddr"),
      dateOfIssue: dateOrNull(fd, "dateOfIssue"),
      status,
      contractIssuingDate: dateOrNull(fd, "contractIssuingDate"),
      contractPeriod: intOrNull(fd, "contractPeriod"),
      contractRenewal: dateOrNull(fd, "contractRenewal"),
      commissionPct: floatOr(fd, "commissionPct"),
      downPayment: strOrNull(fd, "downPayment"),
      note: strOrNull(fd, "note"),
    },
  };
}

export async function createContract(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };
  const parsed = parse(fd);
  if ("error" in parsed) return parsed;

  const contract = await prisma.contract.create({
    data: { ...parsed.data, issuerId: session.id },
  });
  await recordAudit({
    entityType: "Contract",
    entityId: contract.id,
    entityLabel: contract.partnerName,
    action: "CREATE",
    userId: session.id,
  });
  revalidatePath("/contracts");
  redirect(`/contracts/${contract.id}`);
}

export async function updateContract(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };
  const id = str(fd, "id");
  const before = await prisma.contract.findUnique({ where: { id } });
  if (!before) return { error: "Contract not found." };
  const parsed = parse(fd);
  if ("error" in parsed) return parsed;

  const changes = diff(before as any, parsed.data as any, Object.keys(parsed.data));
  await prisma.contract.update({ where: { id }, data: parsed.data });
  await recordAudit({
    entityType: "Contract",
    entityId: id,
    entityLabel: parsed.data.partnerName,
    action: "UPDATE",
    changes,
    userId: session.id,
  });
  revalidatePath("/contracts");
  revalidatePath(`/contracts/${id}`);
  redirect(`/contracts/${id}`);
}
