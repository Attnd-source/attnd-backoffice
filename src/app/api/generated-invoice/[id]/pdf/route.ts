import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { brand } from "@/lib/brand";
import { embedBrandFonts, shape, drawLogo } from "@/lib/pdf";

function sar(n: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " SAR";
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const gi = await prisma.generatedInvoice.findUnique({
      where: { id: params.id },
      include: { serviceProvider: true, event: { select: { eventName: true } } },
    });
    if (!gi) return new NextResponse("Not found", { status: 404 });

    const pdf = await PDFDocument.create();
    const { font, bold } = await embedBrandFonts(pdf);
    const page = pdf.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const P = brand.pdf.primary;
    const A = brand.pdf.accent;
    const INK = brand.pdf.ink;
    const primary = rgb(P.r, P.g, P.b);
    const accent = rgb(A.r, A.g, A.b);
    const ink = rgb(INK.r, INK.g, INK.b);
    const muted = rgb(0.42, 0.45, 0.5);

    const draw = (text: string, x: number, y: number, size: number, f = font, color = ink) =>
      page.drawText(shape(text), { x, y, size, font: f, color });
    const drawRight = (text: string, right: number, y: number, size: number, f = font, color = ink) => {
      const s = shape(text);
      page.drawText(s, { x: right - f.widthOfTextAtSize(s, size), y, size, font: f, color });
    };

    // ---- Header: white letterhead with the real Attnd logo ----
    drawLogo(page, 40, height - 34, 34);
    drawRight("INVOICE", width - 40, height - 60, 24, bold, primary);
    draw(brand.tagline, width - 40 - font.widthOfTextAtSize(brand.tagline, 8), height - 74, 8, font, muted);
    page.drawRectangle({ x: 40, y: height - 84, width: width - 80, height: 2, color: accent });

    // ---- Meta ----
    let y = height - 130;
    const printed = gi.printedAt ?? new Date();
    draw(`Invoice No:  INV-${gi.number}`, 40, y, 11, bold);
    draw(`Date:  ${fmtDate(printed)}`, width - 200, y, 11);
    y -= 18;
    if (gi.eventDate) draw(`Event date:  ${fmtDate(gi.eventDate)}`, width - 200, y, 11);

    // ---- Addressed to ----
    y -= 30;
    draw("To:", 40, y, 11, bold, muted);
    y -= 16;
    draw(gi.serviceProvider.partnerName, 40, y, 14, bold);

    // ---- Brief ----
    y -= 40;
    draw(`Dear partner ${gi.serviceProvider.partnerName},`, 40, y, 11);
    y -= 22;
    const body =
      `Thank you for your cooperation to successfully delivering the request for the event ` +
      `of "${gi.event.eventName}". We are waiting for your invoice of a total of ${sar(gi.invoicedAmount)}.`;
    y = drawWrapped(page, body, 40, y, width - 80, 11, font, ink, 16);

    // ---- Amounts ----
    y -= 20;
    const rows: [string, string][] = [
      ["Actual cost", sar(gi.actualCost)],
      ["Attnd commission", sar(gi.attndCommission)],
      [`VAT (${brand.vatRate * 100}%)`, sar(gi.vat)],
    ];
    page.drawRectangle({ x: 40, y: y - 4, width: width - 80, height: 22, color: rgb(0.95, 0.95, 0.99) });
    draw("Summary", 48, y + 3, 10, bold, primary);
    y -= 26;
    for (const [k, v] of rows) {
      draw(k, 48, y, 11);
      drawRight(v, width - 48, y, 11);
      y -= 20;
    }
    page.drawLine({ start: { x: 40, y: y + 6 }, end: { x: width - 40, y: y + 6 }, thickness: 1, color: primary });
    y -= 6;
    draw("Invoiced amount", 48, y, 12, bold, primary);
    drawRight(sar(gi.invoicedAmount), width - 48, y, 12, bold, primary);

    // ---- Footer ----
    page.drawRectangle({ x: 0, y: 0, width, height: 40, color: rgb(0.96, 0.97, 0.98) });
    draw(`${brand.productName} · Generated ${fmtDate(printed)}`, 40, 16, 9, font, muted);

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Attnd-Invoice-INV-${gi.number}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return new NextResponse("Could not generate the PDF. Please try again.", { status: 500 });
  }
}

// Draws wrapped text, shaping each line so Arabic renders correctly per line.
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
  const flush = () => {
    if (line) {
      page.drawText(shape(line), { x, y: curY, size, font, color });
      curY -= lineHeight;
    }
  };
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(shape(test), size) > maxWidth) {
      flush();
      line = w;
    } else {
      line = test;
    }
  }
  flush();
  return curY;
}
