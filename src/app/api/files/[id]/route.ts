import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const invoice = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!invoice || !invoice.attachmentData) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(invoice.attachmentData), {
    headers: {
      "Content-Type": invoice.attachmentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${invoice.attachmentName || "attachment"}"`,
    },
  });
}
