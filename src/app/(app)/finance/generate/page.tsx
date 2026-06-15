import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { getPartnerFinanceOptions, getEventFinanceOptions } from "@/lib/finance-options";
import { GenerateForm } from "./generate-form";

export default async function GenerateInvoicePage({
  searchParams,
}: {
  searchParams: { event?: string };
}) {
  await requireUser();
  const [partners, events] = await Promise.all([
    getPartnerFinanceOptions(),
    getEventFinanceOptions(),
  ]);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Generate invoice"
        subtitle="Produce a partner invoice letter (PDF) with Attnd commission, VAT, and the invoiced amount."
        breadcrumb={[{ label: "Finance", href: "/finance" }, { label: "Generate invoice" }]}
      />
      <Card>
        <CardBody>
          <GenerateForm partners={partners} events={events} defaultEventId={searchParams.event} />
        </CardBody>
      </Card>
    </div>
  );
}
