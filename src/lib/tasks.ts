import "server-only";
import { prisma } from "./prisma";

// A pending task = a customer assigned to the user whose matching stage is still
// unhandled (owner1 with stage1 = NOT_HANDLED, or owner2-5 with an empty stage).
function whereForUser(userId: string) {
  return {
    OR: [
      { assignedToId: userId, stage1: "NOT_HANDLED" },
      { owner2Id: userId, stage2: null },
      { owner3Id: userId, stage3: null },
      { owner4Id: userId, stage4: null },
      { owner5Id: userId, stage5: null },
    ],
  };
}

export async function getUserTaskCount(userId: string): Promise<number> {
  return prisma.customer.count({ where: whereForUser(userId) });
}

export async function getUserTasks(userId: string) {
  return prisma.customer.findMany({
    where: whereForUser(userId),
    orderBy: { createdAt: "desc" },
  });
}
