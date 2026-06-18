"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordAudit, diff } from "@/lib/audit";
import { str, strOrNull, dateOrNull } from "@/lib/form";
import { ORGANIZER_CHANNELS } from "@/lib/constants";

function parse(fd: FormData) {
  const name = str(fd, "name");
  const channel = strOrNull(fd, "communicationChannel");
  if (!name) return { error: "Organizer name is required." };
  if (channel && !ORGANIZER_CHANNELS.includes(channel as any))
    return { error: "Invalid communication channel." };
  return {
    data: {
      name,
      communicationChannel: channel,
      communicationInfo: strOrNull(fd, "communicationInfo"),
      date: dateOrNull(fd, "date") ?? new Date(),
      note: strOrNull(fd, "note"),
    },
  };
}

export async function createOrganizer(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };
  const parsed = parse(fd);
  if ("error" in parsed) return parsed;

  const org = await prisma.organizer.create({ data: { ...parsed.data, issuerId: session.id } });
  await recordAudit({
    entityType: "Organizer",
    entityId: org.id,
    entityLabel: org.name,
    action: "CREATE",
    userId: session.id,
  });
  revalidatePath("/organizers");
  redirect(`/organizers/${org.id}`);
}

export async function updateOrganizer(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };
  const id = str(fd, "id");
  const before = await prisma.organizer.findUnique({ where: { id } });
  if (!before) return { error: "Organizer not found." };
  const parsed = parse(fd);
  if ("error" in parsed) return parsed;

  const changes = diff(before as any, parsed.data as any, Object.keys(parsed.data));
  await prisma.organizer.update({ where: { id }, data: parsed.data });
  await recordAudit({
    entityType: "Organizer",
    entityId: id,
    entityLabel: parsed.data.name,
    action: "UPDATE",
    changes,
    userId: session.id,
  });
  revalidatePath("/organizers");
  revalidatePath(`/organizers/${id}`);
  redirect(`/organizers/${id}`);
}

export async function deleteOrganizer(_prev: unknown, fd: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Only admins can delete." };
  const id = str(fd, "id");
  const organizer = await prisma.organizer.findUnique({
    where: { id },
    include: { _count: { select: { events: true } } },
  });
  if (!organizer) return { error: "Not found." };
  if (organizer._count.events > 0) return { error: "Delete the related events first." };
  await recordAudit({ entityType: "Organizer", entityId: id, entityLabel: organizer.name, action: "DELETE", userId: session.id });
  await prisma.organizer.delete({ where: { id } });
  revalidatePath("/organizers");
  redirect("/organizers");
}
