import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Editable placeholder categories — Attnd can rename/add/remove these from the
// Admin → Categories page once the real attnd.sa lists are confirmed.
const VENUE_CATEGORIES = [
  "Hotels",
  "Ballrooms",
  "Conference Centers",
  "Exhibition Halls",
  "Outdoor Venues",
  "Resorts",
  "Restaurants",
  "Theaters & Auditoriums",
];

const VENDOR_CATEGORIES = [
  "Catering",
  "Audio Visual",
  "Photography",
  "Videography",
  "Decoration & Styling",
  "Furniture & Rentals",
  "Entertainment",
  "Security",
  "Transportation",
  "Printing & Branding",
  "Florists",
  "Staffing & Ushers",
];

async function main() {
  // Admin credentials come from env in production (so there's no known default).
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@attnd.sa").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  // Only create the default admin if NO admin exists yet (deploy-safe: never
  // overwrites an existing admin's password on redeploys).
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        name: "Attnd Admin",
        email: adminEmail,
        mobile: "+966500000000",
        passwordHash,
        role: "ADMIN",
        active: true,
      },
    });
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    console.log("Admin already exists — skipping admin seed.");
  }

  // Only seed categories if none exist (deploy-safe: won't resurrect deletions).
  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    for (const name of VENUE_CATEGORIES) {
      await prisma.category.create({ data: { type: "VENUE", name } });
    }
    for (const name of VENDOR_CATEGORIES) {
      await prisma.category.create({ data: { type: "VENDOR", name } });
    }
    console.log(`Seeded ${VENUE_CATEGORIES.length} venue + ${VENDOR_CATEGORIES.length} vendor categories.`);
  } else {
    console.log("Categories already exist — skipping category seed.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
