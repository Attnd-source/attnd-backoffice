// Single source of truth for Attnd branding. Swap these values (and the colors
// in src/app/globals.css) once the official logo and brand colors arrive — no
// other code needs to change.
export const brand = {
  name: "Attnd",
  productName: "Attnd Backoffice",
  shortName: "Attnd BO",
  logoPath: "/logo.svg",
  tagline: "Corporate Events — Back Office",
  // Used by the PDF invoice letter (RGB 0-1). Mirrors --brand in globals.css.
  pdf: {
    primary: { r: 0.043, g: 0.357, b: 0.404 }, // teal
    accent: { r: 0.96, g: 0.62, b: 0.04 }, // gold
    ink: { r: 0.13, g: 0.16, b: 0.22 },
  },
  currency: "SAR",
  vatRate: 0.15,
};
