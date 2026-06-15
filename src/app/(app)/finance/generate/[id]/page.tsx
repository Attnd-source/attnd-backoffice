import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { money, date } from "@/lib/format";
import { brand } from "@/lib/brand";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GeneratedInvoiceDetail({ params }: { params: { id: string } }) {
  await requireUser();
  const gi = await prisma.generatedInvoice.findUnique({
    where: { id: params.id },
    include: {
      serviceProvider: true,
      event: { select: { id: true, eventName: true } },
      createdBy: { select: { name: true } },
    },
  });
  if (!gi) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`Invoice INV-${gi.number}`}
        subtitle={`${gi.serviceProvider.partnerName} · created by ${gi.createdBy.name}`}
        breadcrumb={[{ label: "Finance", href: "/finance" }, { label: `INV-${gi.number}` }]}
        action={
          <a href={`/api/generated-invoice/${gi.id}/pdf`} target="_blank">
            <Button>
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </a>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Invoice summary</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <ReadField label="Service provider">{gi.serviceProvider.partnerName}</ReadField>
          <ReadField label="Event">
            <Link href={`/events/${gi.event.id}`} className="text-brand underline-offset-2 hover:underline">
              {gi.event.eventName}
            </Link>
          </ReadField>
          <ReadField label="Event date">{date(gi.eventDate)}</ReadField>
          <ReadField label="Actual cost">{money(gi.actualCost)}</ReadField>
          <ReadField label="Attnd commission">{money(gi.attndCommission)}</ReadField>
          <ReadField label={`VAT (${brand.vatRate * 100}%)`}>{money(gi.vat)}</ReadField>
          <ReadField label="Invoiced amount">
            <span className="text-lg font-semibold text-brand">{money(gi.invoicedAmount)}</span>
          </ReadField>
        </CardBody>
      </Card>
    </div>
  );
}
