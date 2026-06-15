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
    primary: { r: 0.333, g: 0.071, b: 0.878 }, // violet #5512E0
    accent: { r: 0.945, g: 0.353, b: 0.133 }, // orange #F15A22
    ink: { r: 0.13, g: 0.16, b: 0.22 },
  },
  currency: "SAR",
  vatRate: 0.15,
};
