import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, getApiErrorMessage } from "@/lib/api";

type AttendanceRecord = {
  id: number;
  employee_id: number;
  employee_name: string | null;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
};

export const Route = createFileRoute("/_authenticated/attendance")({
  component: AttendancePage,
});

function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<AttendanceRecord[]>("/attendance")
      .then((res) => {
        setRecords(res.data);
        setError(null);
      })
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load attendance")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (path: "/attendance/check-in" | "/attendance/check-out") => {
    setBusy(true);
    setActionError(null);
    try {
      await api.post(path);
      load();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Action failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Track daily check-ins and working hours."
        action={
          <div className="flex gap-2">
            <Button disabled={busy} onClick={() => void runAction("/attendance/check-in")}>
              Check in
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void runAction("/attendance/check-out")}
            >
              Check out
            </Button>
          </div>
        }
      />

      {actionError && <p className="mb-3 text-sm text-destructive">{actionError}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading attendance...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check in</TableHead>
                <TableHead>Check out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No attendance records yet. Use Check in to start today.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employee_name ?? `Employee #${record.employee_id}`}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.check_in ?? "—"}</TableCell>
                    <TableCell>{record.check_out ?? "—"}</TableCell>
                    <TableCell className="capitalize">{record.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
