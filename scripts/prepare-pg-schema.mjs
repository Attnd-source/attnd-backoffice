// Generates prisma/schema.prod.prisma from prisma/schema.prisma by swapping the
// datasource provider from sqlite to postgresql. Keeps a single source of truth
// for the data model while letting local dev use SQLite and production use Postgres.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "prisma", "schema.prisma"), "utf8");

const out = src.replace(
  /datasource\s+db\s*\{[\s\S]*?\}/,
  `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
);

writeFileSync(join(root, "prisma", "schema.prod.prisma"), out);
console.log("Wrote prisma/schema.prod.prisma (provider = postgresql).");
