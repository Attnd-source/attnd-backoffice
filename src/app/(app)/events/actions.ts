"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordAudit, diff } from "@/lib/audit";
import { str, strOrNull, dateOrNull, intOrNull, floatOrNull } from "@/lib/form";
import { EVENT_STATUSES } from "@/lib/constants";

function parse(fd: FormData) {
  const organizerId = str(fd, "organizerId");
  const eventName = str(fd, "eventName");
  const status = str(fd, "status") || "NEW";
  if (!organizerId) return { error: "Select an organizer." };
  if (!eventName) return { error: "Event name is required." };
  if (!EVENT_STATUSES.includes(status as any)) return { error: "Invalid status." };

  const data = {
    organizerId,
    communicationInfo: strOrNull(fd, "communicationInfo"),
    eventName,
    typeOfEvent: strOrNull(fd, "typeOfEvent"),
    numberOfAttendees: intOrNull(fd, "numberOfAttendees"),
    expectedBudget: floatOrNull(fd, "expectedBudget"),
    status,
    city: strOrNull(fd, "city"),
    eventDate: dateOrNull(fd, "eventDate"),
    note: strOrNull(fd, "note"),
  };
  const servicesNeeded = fd.getAll("servicesNeeded").map(String).filter(Boolean);
  const partners = fd.getAll("partners").map(String).filter(Boolean);
  return { data, servicesNeeded, partners };
}

async function labelFor(model: "category" | "contract", ids: string[]): Promise<string> {
  if (ids.length === 0) return "—";
  const rows =
    model === "category"
      ? await prisma.category.findMany({ where: { id: { in: ids } } })
      : await prisma.contract.findMany({ where: { id: { in: ids } } });
  return rows
    .map((r: any) => (model === "category" ? r.name : r.partnerName))
    .sort()
    .join(", ");
}

export async function createEvent(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };
  const parsed = parse(fd);
  if ("error" in parsed) return parsed;

  const event = await prisma.event.create({
    data: {
      ...parsed.data,
      issuerId: session.id,
      servicesNeeded: { create: parsed.servicesNeeded.map((categoryId) => ({ categoryId })) },
      partners: { create: parsed.partners.map((partnerId) => ({ partnerId })) },
    },
  });
  await recordAudit({
    entityType: "Event",
    entityId: event.id,
    entityLabel: event.eventName,
    action: "CREATE",
    userId: session.id,
  });
  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}

export async function updateEvent(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };
  const id = str(fd, "id");
  const before = await prisma.event.findUnique({
    where: { id },
    include: { servicesNeeded: true, partners: true },
  });
  if (!before) return { error: "Event not found." };
  const parsed = parse(fd);
  if ("error" in parsed) return parsed;

  const changes = diff(before as any, parsed.data as any, Object.keys(parsed.data));

  const beforeSvc = before.servicesNeeded.map((s) => s.categoryId).sort();
  const afterSvc = [...parsed.servicesNeeded].sort();
  if (JSON.stringify(beforeSvc) !== JSON.stringify(afterSvc)) {
    changes.servicesNeeded = { old: await labelFor("category", beforeSvc), new: await labelFor("category", afterSvc) };
  }
  const beforePartners = before.partners.map((p) => p.partnerId).sort();
  const afterPartners = [...parsed.partners].sort();
  if (JSON.stringify(beforePartners) !== JSON.stringify(afterPartners)) {
    changes.partners = { old: await labelFor("contract", beforePartners), new: await labelFor("contract", afterPartners) };
  }

  await prisma.$transaction([
    prisma.eventService.deleteMany({ where: { eventId: id } }),
    prisma.eventPartner.deleteMany({ where: { eventId: id } }),
    prisma.event.update({
      where: { id },
      data: {
        ...parsed.data,
        servicesNeeded: { create: parsed.servicesNeeded.map((categoryId) => ({ categoryId })) },
        partners: { create: parsed.partners.map((partnerId) => ({ partnerId })) },
      },
    }),
  ]);

  await recordAudit({
    entityType: "Event",
    entityId: id,
    entityLabel: parsed.data.eventName,
    action: "UPDATE",
    changes,
    userId: session.id,
  });
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function deleteEvent(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Only admins can delete." };
  const id = str(fd, "id");
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { invoices: true, generatedInvoices: true } } },
  });
  if (!event) return { error: "Not found." };
  if (event._count.invoices > 0 || event._count.generatedInvoices > 0)
    return { error: "Delete the related invoices first." };
  await recordAudit({ entityType: "Event", entityId: id, entityLabel: event.eventName, action: "DELETE", userId: session.id });
  await prisma.event.delete({ where: { id } });
  revalidatePath("/events");
  redirect("/events");
}
