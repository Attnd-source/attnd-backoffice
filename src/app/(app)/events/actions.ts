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
    serviceProviderId: strOrNull(fd, "serviceProviderId"),
    externalPartner: strOrNull(fd, "externalPartner"),
    partnerBankInfo: strOrNull(fd, "partnerBankInfo"),
    note: strOrNull(fd, "note"),
  };
  const servicesNeeded = fd.getAll("servicesNeeded").map(String).filter(Boolean);
  return { data, servicesNeeded };
}

async function labelForServices(ids: string[]): Promise<string> {
  if (ids.length === 0) return "—";
  const cats = await prisma.category.findMany({ where: { id: { in: ids } } });
  return cats.map((c) => c.name).sort().join(", ");
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
    include: { servicesNeeded: true },
  });
  if (!before) return { error: "Event not found." };
  const parsed = parse(fd);
  if ("error" in parsed) return parsed;

  const changes = diff(before as any, parsed.data as any, Object.keys(parsed.data));

  // services-needed diff (by label)
  const beforeIds = before.servicesNeeded.map((s) => s.categoryId).sort();
  const afterIds = [...parsed.servicesNeeded].sort();
  if (JSON.stringify(beforeIds) !== JSON.stringify(afterIds)) {
    changes.servicesNeeded = {
      old: await labelForServices(beforeIds),
      new: await labelForServices(afterIds),
    };
  }

  await prisma.$transaction([
    prisma.eventService.deleteMany({ where: { eventId: id } }),
    prisma.event.update({
      where: { id },
      data: {
        ...parsed.data,
        servicesNeeded: { create: parsed.servicesNeeded.map((categoryId) => ({ categoryId })) },
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
