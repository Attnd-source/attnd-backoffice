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
        title="New service-provider invoice"
        subtitle="Record a supplier invoice with one or more supplier lines. Net revenue is calculated automatically."
        breadcrumb={[{ label: "Finance", href: "/finance" }, { label: "New invoice" }]}
      />
      <Card>
        <CardBody>
          <InvoiceForm partners={partners} events={events} />
        </CardBody>
      </Card>
    </div>
  );
}
