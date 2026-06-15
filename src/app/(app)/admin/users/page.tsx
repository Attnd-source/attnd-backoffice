import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserPlus, Pencil } from "lucide-react";
import { date } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Staff accounts. There is no limit on the number of users."
        breadcrumb={[{ label: "Admin" }, { label: "Users" }]}
        action={
          <Link href="/admin/users/new">
            <Button>
              <UserPlus className="h-4 w-4" /> New user
            </Button>
          </Link>
        }
      />
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Mobile</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.mobile ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge intent={u.role === "ADMIN" ? "info" : "muted"}>
                    {u.role === "ADMIN" ? "Administrator" : "Staff"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge intent={u.active ? "success" : "danger"}>
                    {u.active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{date(u.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/users/${u.id}`}>
                    <Button size="sm" variant="outline">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
