import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { brand } from "@/lib/brand";

function sar(n: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " SAR";
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const gi = await prisma.generatedInvoice.findUnique({
    where: { id: params.id },
    include: { serviceProvider: true, event: { select: { eventName: true } } },
  });
  if (!gi) return new NextResponse("Not found", { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const P = brand.pdf.primary;
  const A = brand.pdf.accent;
  const INK = brand.pdf.ink;
  const primary = rgb(P.r, P.g, P.b);
  const accent = rgb(A.r, A.g, A.b);
  const ink = rgb(INK.r, INK.g, INK.b);
  const muted = rgb(0.42, 0.45, 0.5);

  // ---- Header band ----
  page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: primary });
  // Logo mark (swap for embedded PNG once the official asset arrives)
  page.drawRectangle({ x: 40, y: height - 68, width: 30, height: 30, color: rgb(1, 1, 1) });
  page.drawText("A", { x: 49, y: height - 62, size: 20, font: bold, color: primary });
  page.drawText(brand.name, { x: 82, y: height - 55, size: 22, font: bold, color: rgb(1, 1, 1) });
  page.drawText(brand.tagline, { x: 82, y: height - 72, size: 9, font, color: rgb(0.85, 0.92, 0.93) });
  page.drawText("INVOICE", { x: width - 140, y: height - 55, size: 22, font: bold, color: accent });

  // ---- Meta ----
  let y = height - 130;
  const printed = gi.printedAt ?? new Date();
  page.drawText(`Invoice No:  INV-${gi.number}`, { x: 40, y, size: 11, font: bold, color: ink });
  page.drawText(`Date:  ${fmtDate(printed)}`, { x: width - 200, y, size: 11, font, color: ink });
  y -= 18;
  if (gi.eventDate) {
    page.drawText(`Event date:  ${fmtDate(gi.eventDate)}`, { x: width - 200, y, size: 11, font, color: ink });
  }

  // ---- Addressed to ----
  y -= 30;
  page.drawText("To:", { x: 40, y, size: 11, font: bold, color: muted });
  y -= 16;
  page.drawText(gi.serviceProvider.partnerName, { x: 40, y, size: 14, font: bold, color: ink });

  // ---- Brief ----
  y -= 40;
  const brief = `Dear partner ${gi.serviceProvider.partnerName},`;
  page.drawText(brief, { x: 40, y, size: 11, font, color: ink });
  y -= 22;

  const body =
    `Thank you for your cooperation to successfully delivering the request for the event ` +
    `of "${gi.event.eventName}". We are waiting for your invoice of a total of ${sar(gi.invoicedAmount)}.`;
  y = drawWrapped(page, body, 40, y, width - 80, 11, font, ink, 16);

  // ---- Amounts table ----
  y -= 20;
  const rows: [string, string][] = [
    ["Actual cost", sar(gi.actualCost)],
    [`Attnd commission`, sar(gi.attndCommission)],
    [`VAT (${brand.vatRate * 100}%)`, sar(gi.vat)],
  ];
  page.drawRectangle({ x: 40, y: y - 4, width: width - 80, height: 22, color: rgb(0.95, 0.97, 0.97) });
  page.drawText("Summary", { x: 48, y: y + 3, size: 10, font: bold, color: primary });
  y -= 26;
  for (const [k, v] of rows) {
    page.drawText(k, { x: 48, y, size: 11, font, color: ink });
    page.drawText(v, { x: width - 48 - font.widthOfTextAtSize(v, 11), y, size: 11, font, color: ink });
    y -= 20;
  }
  // total line
  page.drawLine({ start: { x: 40, y: y + 6 }, end: { x: width - 40, y: y + 6 }, thickness: 1, color: primary });
  y -= 6;
  page.drawText("Invoiced amount", { x: 48, y, size: 12, font: bold, color: primary });
  const tot = sar(gi.invoicedAmount);
  page.drawText(tot, { x: width - 48 - bold.widthOfTextAtSize(tot, 12), y, size: 12, font: bold, color: primary });

  // ---- Footer ----
  page.drawRectangle({ x: 0, y: 0, width, height: 40, color: rgb(0.96, 0.97, 0.98) });
  page.drawText(`${brand.productName} · Generated ${fmtDate(printed)}`, {
    x: 40,
    y: 16,
    size: 9,
    font,
    color: muted,
  });

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Attnd-Invoice-INV-${gi.number}.pdf"`,
    },
  });
}

function drawWrapped(
  page: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  font: any,
  color: any,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      page.drawText(line, { x, y: curY, size, font, color });
      curY -= lineHeight;
      line = w;
    } else {
      line = test;
    }
  }
  if (line) {
    page.drawText(line, { x, y: curY, size, font, color });
    curY -= lineHeight;
  }
  return curY;
}
