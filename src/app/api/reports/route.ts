import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { PDFDocument, rgb } from "pdf-lib";
import { getSession } from "@/lib/session";
import { buildReport, DATASETS, type DatasetKey } from "@/lib/reports";
import { brand } from "@/lib/brand";
import { embedBrandFonts, shape } from "@/lib/pdf";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const sp = req.nextUrl.searchParams;
  const dataset = sp.get("dataset") as DatasetKey;
  const from = sp.get("from") || undefined;
  const to = sp.get("to") || undefined;
  const format = sp.get("format") || "json";

  if (!DATASETS.some((d) => d.key === dataset)) {
    return NextResponse.json({ error: "Unknown dataset" }, { status: 400 });
  }
  const report = await buildReport(dataset, from, to);

  if (format === "json") {
    return NextResponse.json(report);
  }

  if (format === "xlsx") {
    const wb = new ExcelJS.Workbook();
    wb.creator = brand.productName;
    const ws = wb.addWorksheet(report.title.slice(0, 30));
    const header = ws.addRow(report.columns);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A5B67" } };
      cell.alignment = { vertical: "middle" };
    });
    report.rows.forEach((r) => ws.addRow(r));
    ws.columns.forEach((col) => {
      let max = 12;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        max = Math.max(max, String(cell.value ?? "").length + 2);
      });
      col.width = Math.min(max, 40);
    });
    const buf = await wb.xlsx.writeBuffer();
    return new NextResponse(Buffer.from(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Attnd-${dataset}-report.xlsx"`,
      },
    });
  }

  if (format === "pdf") {
    const pdf = await PDFDocument.create();
    const { font, bold } = await embedBrandFonts(pdf);
    const primary = rgb(brand.pdf.primary.r, brand.pdf.primary.g, brand.pdf.primary.b);
    const ink = rgb(brand.pdf.ink.r, brand.pdf.ink.g, brand.pdf.ink.b);

    const pageW = 841.89; // A4 landscape
    const pageH = 595.28;
    const margin = 30;
    const cols = report.columns.length;
    const colW = (pageW - margin * 2) / cols;
    const size = 8;
    const rowH = 16;

    let page = pdf.addPage([pageW, pageH]);
    function header(p: any) {
      p.drawRectangle({ x: 0, y: pageH - 50, width: pageW, height: 50, color: primary });
      p.drawText(shape(`${brand.name} — ${report.title} report`), { x: margin, y: pageH - 32, size: 14, font: bold, color: rgb(1, 1, 1) });
      p.drawText(new Date().toLocaleDateString("en-GB"), { x: pageW - 110, y: pageH - 32, size: 10, font, color: rgb(1, 1, 1) });
      let yy = pageH - 70;
      report.columns.forEach((c, i) => {
        p.drawText(shape(truncate(c, colW, bold, size)), { x: margin + i * colW + 2, y: yy, size, font: bold, color: primary });
      });
      return yy - rowH;
    }
    let y = header(page);

    for (const row of report.rows) {
      if (y < margin + rowH) {
        page = pdf.addPage([pageW, pageH]);
        y = header(page);
      }
      row.forEach((cell, i) => {
        page.drawText(shape(truncate(String(cell), colW, font, size)), {
          x: margin + i * colW + 2,
          y,
          size,
          font,
          color: ink,
        });
      });
      y -= rowH;
    }

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Attnd-${dataset}-report.pdf"`,
      },
    });
  }

  return new NextResponse("Bad format", { status: 400 });
}

function truncate(text: string, maxW: number, font: any, size: number): string {
  let t = text;
  while (t.length > 1 && font.widthOfTextAtSize(shape(t), size) > maxW - 4) {
    t = t.slice(0, -2);
  }
  return t === text ? t : t + "…";
}
