import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFilePath } from "@/lib/storage";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const invoice = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!invoice || !invoice.attachmentPath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const buf = await readFile(uploadFilePath(invoice.attachmentPath));
    const ext = (invoice.attachmentName || "").toLowerCase();
    const contentType = ext.endsWith(".pdf")
      ? "application/pdf"
      : ext.endsWith(".png")
        ? "image/png"
        : ext.endsWith(".webp")
          ? "image/webp"
          : ext.endsWith(".jpg") || ext.endsWith(".jpeg")
            ? "image/jpeg"
            : "application/octet-stream";
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${invoice.attachmentName || "attachment"}"`,
      },
    });
  } catch {
    return new NextResponse("File missing", { status: 404 });
  }
}
