import "server-only";
import { prisma } from "./prisma";

type AnyRecord = Record<string, unknown>;

function normalize(v: unknown): unknown {
  if (v instanceof Date) return v.toISOString();
  if (v === undefined) return null;
  return v;
}

/** Compute a field-level diff: { field: { old, new } } for changed fields only. */
export function diff(before: AnyRecord, after: AnyRecord, fields?: string[]): AnyRecord {
  const keys = fields ?? Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  const out: AnyRecord = {};
  for (const k of keys) {
    const a = normalize(before[k]);
    const b = normalize(after[k]);
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      out[k] = { old: a, new: b };
    }
  }
  return out;
}

export async function recordAudit(params: {
  entityType: string;
  entityId: string;
  entityLabel?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  changes?: AnyRecord | null;
  userId?: string | null;
}) {
  const { entityType, entityId, entityLabel, action, changes, userId } = params;
  // Skip empty UPDATE diffs (nothing actually changed).
  if (action === "UPDATE" && changes && Object.keys(changes).length === 0) return;
  await prisma.auditLog.create({
    data: {
      entityType,
      entityId,
      entityLabel: entityLabel ?? null,
      action,
      changes: changes ? JSON.stringify(changes) : null,
      userId: userId ?? null,
    },
  });
}

export type AuditEntry = {
  id: string;
  action: string;
  entityLabel: string | null;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  createdAt: Date;
  user: { name: string } | null;
};

/** Fetch the edit history for a single record, newest first. */
export async function getHistory(entityType: string, entityId: string): Promise<AuditEntry[]> {
  const rows = await prisma.auditLog.findMany({
    where: { entityType, entityId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    entityLabel: r.entityLabel,
    changes: r.changes ? JSON.parse(r.changes) : null,
    createdAt: r.createdAt,
    user: r.user,
  }));
}
