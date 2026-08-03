import { createFileRoute } from "@tanstack/react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
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
    <Stack spacing={3}>
      <PageHeader title="Leave" description="Request and manage time off." />

      {user?.employee_id != null && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Request leave
            </Typography>
            <Box component="form" onSubmit={submit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="leave-type-label">Type</InputLabel>
                    <Select
                      labelId="leave-type-label"
                      label="Type"
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                    >
                      <MenuItem value="annual">Annual</MenuItem>
                      <MenuItem value="sick">Sick</MenuItem>
                      <MenuItem value="personal">Personal</MenuItem>
                      <MenuItem value="unpaid">Unpaid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Start date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="End date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Optional note"
                    multiline
                    minRows={3}
                  />
                </Grid>
                {formError && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error">{formError}</Alert>
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <Button type="submit" variant="contained" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit request"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary">
            Loading leave requests...
          </Typography>
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reason</TableCell>
                {isAdmin && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5}>
                    <Typography variant="body2" color="text.secondary">
                      No leave requests yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      {record.employee_name ?? `Employee #${record.employee_id}`}
                    </TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>{record.leave_type}</TableCell>
                    <TableCell>
                      {record.start_date} → {record.end_date}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        size="small"
                        color={
                          record.status === "approved"
                            ? "success"
                            : record.status === "rejected"
                              ? "error"
                              : "default"
                        }
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>{record.reason || "—"}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        {record.status === "pending" ? (
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => void updateStatus(record.id, "approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => void updateStatus(record.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </Stack>
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
        </TableContainer>
      )}
    </Stack>
  );
}
