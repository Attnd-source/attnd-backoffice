"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordAudit, diff } from "@/lib/audit";
import { str, strOrNull, dateOrNull, floatOrNull } from "@/lib/form";
import { CRM_STAGE1, CRM_STAGE } from "@/lib/constants";

function parse(fd: FormData) {
  const customerName = str(fd, "customerName");
  if (!customerName) return { error: "Customer name is required." };

  const stage1 = str(fd, "stage1") || "NOT_HANDLED";
  if (!CRM_STAGE1.includes(stage1 as any)) return { error: "Invalid stage 1." };
  const cleanStage = (key: string) => {
    const v = strOrNull(fd, key);
    return v && CRM_STAGE.includes(v as any) ? v : null;
  };

  const data = {
    date: dateOrNull(fd, "date") ?? new Date(),
    customerName,
    jobDescription: strOrNull(fd, "jobDescription"),
    companyName: strOrNull(fd, "companyName"),
    companyField: strOrNull(fd, "companyField"),
    city: strOrNull(fd, "city"),
    contactNumber: strOrNull(fd, "contactNumber"),
    email: strOrNull(fd, "email"),
    source: strOrNull(fd, "source"),
    priority: strOrNull(fd, "priority"),
    assignedToId: strOrNull(fd, "assignedToId"),
    stage1,
    dateStage1: dateOrNull(fd, "dateStage1"),
    owner2Id: strOrNull(fd, "owner2Id"),
    stage2: cleanStage("stage2"),
    dateStage2: dateOrNull(fd, "dateStage2"),
    owner3Id: strOrNull(fd, "owner3Id"),
    stage3: cleanStage("stage3"),
    dateStage3: dateOrNull(fd, "dateStage3"),
    owner4Id: strOrNull(fd, "owner4Id"),
    stage4: cleanStage("stage4"),
    dateStage4: dateOrNull(fd, "dateStage4"),
    owner5Id: strOrNull(fd, "owner5Id"),
    stage5: cleanStage("stage5"),
    dateStage5: dateOrNull(fd, "dateStage5"),
    rejectionReason: strOrNull(fd, "rejectionReason"),
    eventValue: floatOrNull(fd, "eventValue"),
  };
  return { data };
}

function isSigned(d: any): boolean {
  return [d.stage1, d.stage2, d.stage3, d.stage4, d.stage5].includes("SIGNED");
}

// Create an organizer from a signed customer and return its id.
async function createOrganizerFromCustomer(customer: any, userId: string): Promise<string> {
  const org = await prisma.organizer.create({
    data: {
      name: customer.companyName || customer.customerName,
      communicationChannel: null,
      communicationInfo: customer.email || customer.contactNumber || null,
      date: new Date(),
      note: [customer.customerName, customer.jobDescription, customer.companyField]
        .filter(Boolean)
        .join(" · ") || null,
      issuerId: userId,
    },
  });
  await recordAudit({
    entityType: "Organizer",
    entityId: org.id,
    entityLabel: org.name,
    action: "CREATE",
    changes: { source: { old: null, new: "Auto-created from CRM (signed)" } },
    userId,
  });
  return org.id;
}

export async function createCustomer(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };
  const parsed = parse(fd);
  if ("error" in parsed) return parsed;

  const customer = await prisma.customer.create({
    data: { ...parsed.data, agentId: session.id },
  });

  // Auto-add to organizers if already signed.
  if (isSigned(parsed.data)) {
    const organizerId = await createOrganizerFromCustomer(customer, session.id);
    await prisma.customer.update({ where: { id: customer.id }, data: { organizerId } });
  }

  await recordAudit({
    entityType: "Customer",
    entityId: customer.id,
    entityLabel: customer.customerName,
    action: "CREATE",
    userId: session.id,
  });
  revalidatePath("/crm");
  redirect(`/crm/${customer.id}`);
}

export async function updateCustomer(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };
  const id = str(fd, "id");
  const before = await prisma.customer.findUnique({ where: { id } });
  if (!before) return { error: "Customer not found." };
  const parsed = parse(fd);
  if ("error" in parsed) return parsed;

  const changes = diff(before as any, parsed.data as any, Object.keys(parsed.data));
  await prisma.customer.update({ where: { id }, data: parsed.data });

  // Auto-add to organizers the first time it becomes signed.
  if (isSigned(parsed.data) && !before.organizerId) {
    const organizerId = await createOrganizerFromCustomer({ ...before, ...parsed.data }, session.id);
    await prisma.customer.update({ where: { id }, data: { organizerId } });
  }

  await recordAudit({
    entityType: "Customer",
    entityId: id,
    entityLabel: parsed.data.customerName,
    action: "UPDATE",
    changes,
    userId: session.id,
  });
  revalidatePath("/crm");
  revalidatePath(`/crm/${id}`);
  redirect(`/crm/${id}`);
}

export async function deleteCustomer(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Only admins can delete." };
  const id = str(fd, "id");
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) return { error: "Not found." };
  await recordAudit({
    entityType: "Customer",
    entityId: id,
    entityLabel: customer.customerName,
    action: "DELETE",
    userId: session.id,
  });
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/crm");
  redirect("/crm");
}
