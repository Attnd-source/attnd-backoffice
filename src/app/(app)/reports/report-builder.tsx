"use client";
import { useState, useEffect } from "react";
import { Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { FileSpreadsheet, FileText, Eye, Loader2 } from "lucide-react";
import { DATASET_COLUMNS } from "@/lib/report-columns";

type ReportData = { title: string; columns: string[]; rows: (string | number)[][] };

export function ReportBuilder({ datasets }: { datasets: { key: string; label: string }[] }) {
  const [dataset, setDataset] = useState(datasets[0]?.key ?? "contracts");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const columns = DATASET_COLUMNS[dataset] ?? [];
  const [checked, setChecked] = useState<boolean[]>(columns.map(() => true));

  // Reset column selection (all on) whenever the dataset changes.
  useEffect(() => {
    setChecked((DATASET_COLUMNS[dataset] ?? []).map(() => true));
    setData(null);
  }, [dataset]);

  const selectedIdx = checked.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
  const noneSelected = selectedIdx.length === 0;

  function qs(format: string) {
    const p = new URLSearchParams({ dataset, format });
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    if (selectedIdx.length > 0 && selectedIdx.length < columns.length) {
      p.set("cols", selectedIdx.join(","));
    }
    return p.toString();
  }

  async function preview() {
    if (noneSelected) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?${qs("json")}`);
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  const allOn = checked.every(Boolean);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-5">
          <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Dataset" htmlFor="dataset">
              <Select id="dataset" value={dataset} onChange={(e) => setDataset(e.target.value)}>
                {datasets.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="From" htmlFor="from">
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="To" htmlFor="to">
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
            <div className="flex gap-2">
              <Button onClick={preview} disabled={loading || noneSelected}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Preview
              </Button>
            </div>
          </div>

          {/* Column picker */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Columns to include</label>
              <button
                type="button"
                onClick={() => setChecked(columns.map(() => !allOn))}
                className="text-xs font-medium text-brand hover:underline"
              >
                {allOn ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="grid gap-x-4 gap-y-2 rounded-md border border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
              {columns.map((c, i) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked[i] ?? false}
                    onChange={(e) =>
                      setChecked((prev) => {
                        const next = [...prev];
                        next[i] = e.target.checked;
                        return next;
                      })
                    }
                  />
                  {c}
                </label>
              ))}
            </div>
            {noneSelected && (
              <p className="mt-1.5 text-xs text-danger">Select at least one column.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {noneSelected ? (
              <>
                <Button variant="outline" size="sm" disabled>
                  <FileSpreadsheet className="h-4 w-4" /> Export Excel
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <FileText className="h-4 w-4" /> Export PDF
                </Button>
              </>
            ) : (
              <>
                <a href={`/api/reports?${qs("xlsx")}`}>
                  <Button variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4" /> Export Excel
                  </Button>
                </a>
                <a href={`/api/reports?${qs("pdf")}`}>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4" /> Export PDF
                  </Button>
                </a>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {data && (
        <Card className="overflow-hidden">
          <CardBody className="p-0">
            <div className="border-b border-border px-5 py-3 text-sm font-medium">
              {data.title} — {data.rows.length} record{data.rows.length === 1 ? "" : "s"}
            </div>
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    {data.columns.map((c) => (
                      <th key={c} className="whitespace-nowrap px-4 py-2.5 font-semibold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.length === 0 && (
                    <tr>
                      <td colSpan={data.columns.length} className="px-4 py-8 text-center text-muted-foreground">
                        No records in this range.
                      </td>
                    </tr>
                  )}
                  {data.rows.map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {row.map((cell, j) => (
                        <td key={j} className="whitespace-nowrap px-4 py-2.5">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
