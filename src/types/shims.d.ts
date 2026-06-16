declare module "arabic-reshaper" {
  const reshaper: {
    convertArabic(input: string): string;
    convertArabicBack(input: string): string;
  };
  export default reshaper;
}

declare module "bidi-js" {
  export interface EmbeddingLevels {
    levels: Uint8Array;
    paragraphs: Array<{ start: number; end: number; level: number }>;
  }
  export interface Bidi {
    getEmbeddingLevels(text: string, direction?: "ltr" | "rtl" | null): EmbeddingLevels;
    getReorderSegments(
      text: string,
      embeddingLevels: EmbeddingLevels,
      start?: number,
      end?: number
    ): Array<[number, number]>;
    getMirroredCharacter(char: string): string | null;
  }
  export default function bidiFactory(): Bidi;
}
