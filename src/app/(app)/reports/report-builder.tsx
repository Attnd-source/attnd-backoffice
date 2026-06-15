"use client";
import { useState } from "react";
import { Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { FileSpreadsheet, FileText, Eye, Loader2 } from "lucide-react";

type ReportData = { title: string; columns: string[]; rows: (string | number)[][] };

export function ReportBuilder({ datasets }: { datasets: { key: string; label: string }[] }) {
  const [dataset, setDataset] = useState(datasets[0]?.key ?? "contracts");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  function qs(format: string) {
    const p = new URLSearchParams({ dataset, format });
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    return p.toString();
  }

  async function preview() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?${qs("json")}`);
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
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
              <Button onClick={preview} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Preview
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
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
