import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type LeaveRecord = {
  id: number;
  employee_id: number;
  employee_name: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
};

export const Route = createFileRoute("/_authenticated/leave")({
  component: LeavePage,
});

function LeavePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [leaveType, setLeaveType] = useState("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<LeaveRecord[]>("/leave")
      .then((res) => {
        setRecords(res.data);
        setError(null);
      })
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load leave requests")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await api.post("/leave", {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason,
      });
      setReason("");
      load();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Unable to submit leave request"));
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: number, status: "approved" | "rejected") => {
    try {
      await api.patch(`/leave/${id}`, { status });
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update leave request"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Leave" description="Request and manage time off." />

      {user?.employee_id != null && (
        <Card>
          <CardHeader>
            <CardTitle>Request leave</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Optional note"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start">Start date</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End date</Label>
                <Input
                  id="end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              {formError && <p className="text-sm text-destructive sm:col-span-2">{formError}</p>}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && <p className="text-sm text-muted-foreground">Loading leave requests...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-muted-foreground">
                    No leave requests yet.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {record.employee_name ?? `Employee #${record.employee_id}`}
                    </TableCell>
                    <TableCell className="capitalize">{record.leave_type}</TableCell>
                    <TableCell>
                      {record.start_date} → {record.end_date}
                    </TableCell>
                    <TableCell className="capitalize">{record.status}</TableCell>
                    <TableCell>{record.reason || "—"}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        {record.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => void updateStatus(record.id, "approved")}>
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void updateStatus(record.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    )}
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
