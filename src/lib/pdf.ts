import "server-only";
import { readFileSync } from "fs";
import path from "path";
import type { PDFDocument, PDFFont } from "pdf-lib";
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
