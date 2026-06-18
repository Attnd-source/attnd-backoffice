import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { HistoryPanel } from "@/components/history-panel";
import { getHistory } from "@/lib/audit";
import { getCategoryOptions } from "@/lib/options";
import { CONTRACT_STATUS_LABELS } from "@/lib/constants";
import { DeleteButton } from "@/components/delete-button";
import { ContractForm } from "../contract-form";
import { deleteContract } from "../actions";

export const dynamic = "force-dynamic";

export default async function ContractDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: { issuer: { select: { name: true } } },
  });
  if (!contract) notFound();

  const [venueCategories, vendorCategories, history] = await Promise.all([
    getCategoryOptions("VENUE"),
    getCategoryOptions("VENDOR"),
    getHistory("Contract", contract.id),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <PageHeader
          title={contract.partnerName}
          subtitle={`Issued by ${contract.issuer.name}`}
          breadcrumb={[{ label: "Contracts", href: "/contracts" }, { label: contract.partnerName }]}
          action={
            <div className="flex items-center gap-2">
              <StatusBadge value={contract.status} label={CONTRACT_STATUS_LABELS[contract.status]} />
              {user.role === "ADMIN" && <DeleteButton action={deleteContract} id={contract.id} label="contract" />}
            </div>
          }
        />
        <Card>
          <CardHeader>
            <CardTitle>Contract details</CardTitle>
          </CardHeader>
          <CardBody>
            <ContractForm
              contract={contract}
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
