import "server-only";
import { readFileSync } from "fs";
import path from "path";
import { rgb, type PDFDocument, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import reshaper from "arabic-reshaper";
import bidiFactory from "bidi-js";

const bidi = bidiFactory();

// Arabic / Arabic-Supplement / Presentation Forms ranges.
const ARABIC_RE =
  /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

function fontBytes(file: string): Buffer {
  return readFileSync(path.join(process.cwd(), "src", "fonts", file));
}

/** Embed the Amiri Unicode font (Arabic + Latin) into a document via fontkit. */
export async function embedBrandFonts(
  doc: PDFDocument
): Promise<{ font: PDFFont; bold: PDFFont }> {
  doc.registerFontkit(fontkit);
  // NOTE: subset:false — embed the full font. Subsetting this font in pdf-lib
  // drops glyphs and produces broken text, so we embed it whole.
  const font = await doc.embedFont(fontBytes("Amiri-Regular.ttf"), { subset: false });
  const bold = await doc.embedFont(fontBytes("Amiri-Bold.ttf"), { subset: false });
  return { font, bold };
}

/**
 * Prepare a string for drawing with pdf-lib (which has no text shaping):
 * - converts Arabic letters to their connected presentation forms, and
 * - reorders right-to-left runs into visual order (Unicode bidi).
 * Latin-only strings pass through unchanged.
 */
export function shape(text: string | null | undefined): string {
  if (!text) return "";
  if (!ARABIC_RE.test(text)) return text;

  const reshaped = reshaper.convertArabic(text);
  const levels = bidi.getEmbeddingLevels(reshaped);
  const segments = bidi.getReorderSegments(reshaped, levels);

  const chars = reshaped.split("");
  for (const [start, end] of segments) {
    let i = start;
    let j = end;
    while (i < j) {
      const tmp = chars[i];
      chars[i] = chars[j];
      chars[j] = tmp;
      i++;
      j--;
    }
  }
  return chars.join("");
}

// Logo source viewBox is 628.61 x 158.49 (see public/logo.svg).
const LOGO_VIEW_W = 628.61;
const LOGO_VIEW_H = 158.49;
let cachedLogoPaths: { color: ReturnType<typeof rgb>; d: string }[] | null = null;

function logoPaths() {
  if (cachedLogoPaths) return cachedLogoPaths;
  const svg = readFileSync(path.join(process.cwd(), "public", "logo.svg"), "utf8");
  const violet = rgb(0.333, 0.027, 0.812);
  const orange = rgb(0.937, 0.353, 0.161);
  const re = /<path[^>]*class="(cls-\d)"[^>]*d="([^"]+)"/g;
  const out: { color: ReturnType<typeof rgb>; d: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(svg))) {
    out.push({ color: m[1] === "cls-1" ? orange : violet, d: m[2] });
  }
  cachedLogoPaths = out;
  return out;
}

/** Draw the real Attnd logo (vector) at (x, top-y) scaled to `height` points. */
export function drawLogo(page: PDFPage, x: number, topY: number, height: number) {
  const scale = height / LOGO_VIEW_H;
  for (const p of logoPaths()) {
    page.drawSvgPath(p.d, { x, y: topY, scale, color: p.color });
  }
}

export const LOGO_RATIO = LOGO_VIEW_W / LOGO_VIEW_H;
