"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRecords } from "../hooks/useRecords";
import type { RecordItem } from "../types";
import RecordCard from "./RecordCard";
import RecordDetailDialog from "./RecordDetailDialog";
import { Button } from "@/components/ui/button";
import HistoryLog from "./HistoryLog";
import RecordFilter from "./RecordFilter";
import RecordSummary from "./RecordSummary";
import AlertMessage from "./AlertMessage";

/**
 * RecordList orchestrates the interview page by fetching records via
 * RecordsContext, presenting summary counts, exposing a simple filter UI, and
 * handling selection to open the detail dialog.
 */
export default function RecordList() {
  const { records, loading, error, refresh, history } = useRecords();
  const [sel, setSel] = useState<RecordItem | null>(null);
  const [fltr, setFltr] = useState<"all" | RecordItem["status"]>("all");

  const counts: Record<RecordItem["status"], number> = {
    pending: 0,
    approved: 0,
    flagged: 0,
    needs_revision: 0,
  };
  records.forEach((item) => {
    counts[item.status] += 1;
  });

  const filteredRecords =
  fltr === "all"
    ? records
    : records.filter((record) => record.status === fltr);


  return (
    <div className="space-y-6">
      <RecordSummary />
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Records
          </h2>
          <p className="text-sm text-muted-foreground">
            {records.length} total • {filteredRecords.length} showing
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-end gap-2 w-full max-w-xs">
            <RecordFilter value={fltr} onChange={setFltr} />
            <div className="mt-2">
              <Button variant="ghost" onClick={() => refresh()} disabled={loading}>
                Reload
              </Button>
            </div>
          </div>
        </div>
      </div>

    {loading ? (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-gray-400 mb-2" />
        <span className="text-gray-500">Loading records…</span>
      </div>
    ) : error ? (
      <AlertMessage
        type="error"
        title="Error:"
        message={error}
        onRetry={refresh}
        retryLabel="Retry"
      />
    ) : records.length === 0 ? (
      <AlertMessage
        type="info"
        title="Info:"
        message="No records found."
        onRetry={refresh}
        retryLabel="Retry"
      />
    ) : (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((record) => (
            <RecordCard key={record.id} record={record} onSelect={setSel} />
          ))}
          {sel && <RecordDetailDialog record={sel} onClose={() => setSel(null)} />}
        </div>
        <HistoryLog />
      </>
    )}
    </div>
  );
}
