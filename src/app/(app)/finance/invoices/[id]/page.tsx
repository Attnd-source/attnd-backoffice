import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadField } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { HistoryPanel } from "@/components/history-panel";
import { DeleteButton } from "@/components/delete-button";
import { getHistory } from "@/lib/audit";
import { money } from "@/lib/format";
import { label, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { Paperclip } from "lucide-react";
import { PaymentStatusForm } from "./payment-status-form";
import { deleteInvoice } from "../actions";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      serviceProvider: true,
      event: { select: { id: true, eventName: true } },
      createdBy: { select: { name: true } },
      suppliers: { include: { supplier: { select: { partnerName: true } } } },
    },
  });
  if (!invoice) notFound();
  const history = await getHistory("Invoice", invoice.id);
  const totalNet = invoice.suppliers.reduce((s, r) => s + r.netRevenue, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <PageHeader
          title={`Request for invoice · ${invoice.serviceProvider.partnerName}`}
          subtitle={`Recorded by ${invoice.createdBy.name}`}
          breadcrumb={[{ label: "Finance", href: "/finance" }, { label: "Request for invoice" }]}
          action={user.role === "ADMIN" ? <DeleteButton action={deleteInvoice} id={invoice.id} label="request for invoice" /> : undefined}
        />
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <ReadField label="Service provider">{invoice.serviceProvider.partnerName}</ReadField>
            <ReadField label="Event">
              <Link href={`/events/${invoice.event.id}`} className="text-brand underline-offset-2 hover:underline">
                {invoice.event.eventName}
              </Link>
            </ReadField>
            <ReadField label="Total net revenue">
              <span className="font-semibold text-brand">{money(totalNet)}</span>
            </ReadField>
            {invoice.note && <ReadField label="Note">{invoice.note}</ReadField>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {invoice.suppliers.map((row) => (
              <div key={row.id} className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="font-medium">{row.supplier.partnerName}</span>
                  {row.attachmentName && (
                    <a href={`/api/files/${row.id}`} target="_blank" className="inline-flex items-center gap-1 text-sm text-brand underline-offset-2 hover:underline">
                      <Paperclip className="h-3.5 w-3.5" /> {row.attachmentName}
                    </a>
                  )}
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <ReadField label="Actual cost">{money(row.actualCost)}</ReadField>
                  <ReadField label="Offer cost">{money(row.offerCost)}</ReadField>
                  <ReadField label="Commission %">{row.commissionPct}%</ReadField>
                  <ReadField label="Down payment %">{row.downPaymentPct}%</ReadField>
                  <ReadField label="Net revenue"><span className="font-semibold text-brand">{money(row.netRevenue)}</span></ReadField>
                  <ReadField label="Invoiced amount">{money(row.invoicedAmount)}</ReadField>
                  <ReadField label="1st payment">{money(row.firstPaymentAmount)}</ReadField>
                  <ReadField label="2nd payment">{money(row.secondPaymentAmount)}</ReadField>
                  <ReadField label="Bank info">{row.partnerBankInfo ?? "—"}</ReadField>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge intent="muted">1st: {label(PAYMENT_STATUS_LABELS, row.firstPaymentStatus)}</Badge>
                  <Badge intent="muted">2nd: {label(PAYMENT_STATUS_LABELS, row.secondPaymentStatus)}</Badge>
                </div>
                <PaymentStatusForm invoiceId={invoice.id} rowId={row.id} first={row.firstPaymentStatus} second={row.secondPaymentStatus} />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
      <div>
        <HistoryPanel entries={history} />
      </div>
    </div>
  );
}
