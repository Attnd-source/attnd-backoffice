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
  const adminEmail = "admin@attnd.sa";
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
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
  console.log(`Admin user ready: ${admin.email} / Admin@123`);

  for (const name of VENUE_CATEGORIES) {
    await prisma.category.upsert({
      where: { type_name: { type: "VENUE", name } },
      update: {},
      create: { type: "VENUE", name },
    });
  }
  for (const name of VENDOR_CATEGORIES) {
    await prisma.category.upsert({
      where: { type_name: { type: "VENDOR", name } },
      update: {},
      create: { type: "VENDOR", name },
    });
  }
  console.log(
    `Seeded ${VENUE_CATEGORIES.length} venue + ${VENDOR_CATEGORIES.length} vendor categories.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
