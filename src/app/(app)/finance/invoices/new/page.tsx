import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { getPartnerFinanceOptions, getEventFinanceOptions } from "@/lib/finance-options";
import { InvoiceForm } from "../invoice-form";

export default async function NewInvoicePage() {
  await requireUser();
  const [partners, events] = await Promise.all([
    getPartnerFinanceOptions(),
    getEventFinanceOptions(),
  ]);

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="New request for invoice"
        subtitle="Record a request for invoice with one or more supplier lines. Amounts are calculated automatically."
        breadcrumb={[{ label: "Finance", href: "/finance" }, { label: "New request for invoice" }]}
      />
      <Card>
        <CardBody>
          <InvoiceForm partners={partners} events={events} />
        </CardBody>
      </Card>
    </div>
  );
}
