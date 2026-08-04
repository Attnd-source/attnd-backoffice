import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { HistoryPanel } from "@/components/history-panel";
import { DeleteButton } from "@/components/delete-button";
import { getHistory } from "@/lib/audit";
import { getCrmFormOptions } from "@/lib/crm-options";
import { CRM_STAGE_LABELS } from "@/lib/constants";
import { CustomerForm } from "../customer-form";
import { deleteCustomer } from "../actions";
import { Users2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) notFound();
  const [{ sources, priorities, cities, users }, history] = await Promise.all([
    getCrmFormOptions(),
    getHistory("Customer", customer.id),
  ]);
  const agentName = users.find((u) => u.value === customer.agentId)?.label ?? "—";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <PageHeader
          title={customer.customerName}
          subtitle={customer.companyName ?? undefined}
          breadcrumb={[{ label: "CRM", href: "/crm" }, { label: customer.customerName }]}
          action={
            <div className="flex items-center gap-2">
              <StatusBadge value={customer.stage1} label={CRM_STAGE_LABELS[customer.stage1]} />
              {user.role === "ADMIN" && <DeleteButton action={deleteCustomer} id={customer.id} label="customer" />}
            </div>
          }
        />
        {customer.organizerId && (
          <Card>
            <CardBody className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">This signed customer was added to organizers.</span>
              <Link href={`/organizers/${customer.organizerId}`}>
                <span className="inline-flex items-center gap-1 text-sm text-brand underline-offset-2 hover:underline">
                  <Users2 className="h-3.5 w-3.5" /> View organizer
                </span>
              </Link>
            </CardBody>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Customer details</CardTitle>
          </CardHeader>
          <CardBody>
            <CustomerForm
              customer={customer}
              sources={sources}
              priorities={priorities}
              cities={cities}
              users={users}
              agentName={agentName}
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
