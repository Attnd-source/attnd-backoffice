"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { money, num, pct, date as fmtDate, dateTime } from "@/lib/format";
import {
  PARTNER_TYPE_LABELS,
  CONTRACT_STATUS_LABELS,
  COMMUNICATION_TYPE_LABELS,
  ORGANIZER_CHANNEL_LABELS,
  EVENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";

const MAPS: Record<string, Record<string, string>> = {
  PARTNER_TYPE: PARTNER_TYPE_LABELS,
  CONTRACT_STATUS: CONTRACT_STATUS_LABELS,
  COMMUNICATION_TYPE: COMMUNICATION_TYPE_LABELS,
  ORGANIZER_CHANNEL: ORGANIZER_CHANNEL_LABELS,
  EVENT_STATUS: EVENT_STATUS_LABELS,
  PAYMENT_STATUS: PAYMENT_STATUS_LABELS,
};

export type ColumnType =
  | "text"
  | "date"
  | "datetime"
  | "money"
  | "number"
  | "pct"
  | "label"
  | "status";

export type Column = {
  key: string;
  header: string;
  type?: ColumnType;
  labelMap?: keyof typeof MAPS | string;
  sortable?: boolean;
  filter?: boolean;
  align?: "right" | "left";
};

type Row = Record<string, any>;

function display(col: Column, value: any): string {
  if (value === null || value === undefined || value === "") return "—";
  switch (col.type) {
    case "money":
      return money(Number(value));
    case "number":
      return num(Number(value));
    case "pct":
      return pct(Number(value));
    case "date":
      return fmtDate(value);
    case "datetime":
      return dateTime(value);
    case "label":
    case "status":
      return col.labelMap && MAPS[col.labelMap] ? MAPS[col.labelMap][value] ?? value : value;
    default:
      return String(value);
  }
}

export function DataTable({
  columns,
  rows,
  idKey = "id",
  hrefBase,
  searchKeys = [],
  searchPlaceholder = "Search…",
  dateFilterKey,
  dateFilterLabel = "Date",
  pageSize = 12,
}: {
  columns: Column[];
  rows: Row[];
  idKey?: string;
  hrefBase: string;
  searchKeys?: string[];
  searchPlaceholder?: string;
  dateFilterKey?: string;
  dateFilterLabel?: string;
  pageSize?: number;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filterCols = columns.filter((c) => c.filter);

  const filtered = useMemo(() => {
    let out = rows;
    if (q.trim()) {
      const needle = q.toLowerCase();
      out = out.filter((r) =>
        searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(needle))
      );
    }
    for (const [k, v] of Object.entries(filters)) {
      if (v) out = out.filter((r) => String(r[k] ?? "") === v);
    }
    if (dateFilterKey && (from || to)) {
      out = out.filter((r) => {
        const raw = r[dateFilterKey];
        if (!raw) return false;
        const t = new Date(raw).getTime();
        if (from && t < new Date(from).getTime()) return false;
        if (to && t > new Date(to).getTime() + 86400000) return false;
        return true;
      });
    }
    if (sortKey) {
      out = [...out].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        let cmp: number;
        if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
        else cmp = String(av ?? "").localeCompare(String(bv ?? ""));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, q, filters, from, to, dateFilterKey, sortKey, sortDir, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        {filterCols.map((col) => {
          const map = col.labelMap ? MAPS[col.labelMap] : undefined;
          const options = map
            ? Object.entries(map)
            : Array.from(new Set(rows.map((r) => r[col.key]).filter(Boolean))).map((v) => [
                String(v),
                String(v),
              ]);
          return (
            <div key={col.key} className="min-w-[150px]">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                {col.header}
              </label>
              <Select
                value={filters[col.key] ?? ""}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, [col.key]: e.target.value }));
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {options.map(([val, lbl]) => (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                ))}
              </Select>
            </div>
          );
        })}
        {dateFilterKey && (
          <>
            <div className="min-w-[140px]">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                {dateFilterLabel} from
              </label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="min-w-[140px]">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                {dateFilterLabel} to
              </label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card scroll-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 font-semibold ${col.align === "right" ? "text-right" : ""}`}>
                  {col.sortable ? (
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {col.header}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  No records found.
                </td>
              </tr>
            )}
            {pageRows.map((row) => (
              <tr
                key={row[idKey]}
                onClick={() => router.push(`${hrefBase}/${row[idKey]}`)}
                className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-brand-muted/40"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.align === "right" ? "text-right tabular-nums" : ""}`}
                  >
                    {col.type === "status" ? (
                      <StatusBadge value={row[col.key]} label={display(col, row[col.key])} />
                    ) : col.type === "label" ? (
                      <Badge intent="muted">{display(col, row[col.key])}</Badge>
                    ) : (
                      display(col, row[col.key])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtered.length} record{filtered.length === 1 ? "" : "s"}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-md border border-border p-1 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>
              Page {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="rounded-md border border-border p-1 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
