import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { HistoryPanel } from "@/components/history-panel";
import { DeleteButton } from "@/components/delete-button";
import { getHistory } from "@/lib/audit";
import { getOrganizerOptions, getPartnerOptions, getCategoryOptions } from "@/lib/options";
import { EVENT_STATUS_LABELS } from "@/lib/constants";
import { text } from "@/lib/format";
import { EventForm } from "../event-form";
import { deleteEvent } from "../actions";
import { Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      organizer: { select: { name: true } },
      servicesNeeded: { select: { categoryId: true } },
      partners: { include: { partner: { select: { partnerName: true, iban: true } } } },
    },
  });
  if (!event) notFound();

  const [organizers, partners, venueCategories, vendorCategories, history] = await Promise.all([
    getOrganizerOptions(),
    getPartnerOptions(),
    getCategoryOptions("VENUE"),
    getCategoryOptions("VENDOR"),
    getHistory("Event", event.id),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <PageHeader
          title={event.eventName}
          subtitle={`Organizer: ${event.organizer.name}`}
          breadcrumb={[{ label: "Events", href: "/events" }, { label: event.eventName }]}
          action={
            <div className="flex items-center gap-2">
              <StatusBadge value={event.status} label={EVENT_STATUS_LABELS[event.status]} />
              <Link href={`/finance/generate?event=${event.id}`}>
                <Button variant="outline" size="sm">
                  <Receipt className="h-3.5 w-3.5" /> Generate invoice
                </Button>
              </Link>
              {user.role === "ADMIN" && (
                <DeleteButton action={deleteEvent} id={event.id} label="event" />
              )}
            </div>
          }
        />

        {event.partners.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Service providers</CardTitle>
            </CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              {event.partners.map((p) => (
                <ReadField key={p.id} label={p.partner.partnerName}>
                  <span className="text-muted-foreground">Bank / IBAN: </span>
                  {text(p.partner.iban)}
                </ReadField>
              ))}
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Event details</CardTitle>
          </CardHeader>
          <CardBody>
            <EventForm
              event={{
                id: event.id,
                organizerId: event.organizerId,
                communicationInfo: event.communicationInfo,
                eventName: event.eventName,
                typeOfEvent: event.typeOfEvent,
                numberOfAttendees: event.numberOfAttendees,
                expectedBudget: event.expectedBudget,
                status: event.status,
                city: event.city,
                eventDate: event.eventDate,
                note: event.note,
                serviceIds: event.servicesNeeded.map((s) => s.categoryId),
                partnerIds: event.partners.map((p) => p.partnerId),
              }}
              organizers={organizers}
              partners={partners}
              venueCategories={venueCategories}
              vendorCategories={vendorCategories}
            />
          </CardBody>
        </Card>
      </div>
      <div>
        <HistoryPanel entries={history} />
      </div>
    </div>
  );
}
