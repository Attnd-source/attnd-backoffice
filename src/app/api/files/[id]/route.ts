import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Serves a supplier-line attachment (InvoiceSupplier id) from the database.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const row = await prisma.invoiceSupplier.findUnique({ where: { id: params.id } });
  if (!row || !row.attachmentData) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(row.attachmentData), {
    headers: {
      "Content-Type": row.attachmentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${row.attachmentName || "attachment"}"`,
    },
  });
}
