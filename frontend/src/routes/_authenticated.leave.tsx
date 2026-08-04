import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
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
import { useMemo, useState } from "react";

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
  admin_note: string;
  status: string;
};

export const Route = createFileRoute("/_authenticated/leave")({
  component: LeavePage,
});

function LeavePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [leaveType, setLeaveType] = useState("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const {
    data: records = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["leave"],
    queryFn: async () => (await api.get<LeaveRecord[]>("/leave")).data,
  });

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filterFrom && r.end_date < filterFrom) return false;
      if (filterTo && r.start_date > filterTo) return false;
      return true;
    });
  }, [records, filterFrom, filterTo]);

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
      await queryClient.invalidateQueries({ queryKey: ["leave"] });
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Unable to submit leave request"));
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (
    id: number,
    status: "approved" | "rejected",
    admin_note = "",
  ) => {
    try {
      setActionError(null);
      await api.patch(`/leave/${id}`, { status, admin_note });
      setRejectId(null);
      setRejectNote("");
      await queryClient.invalidateQueries({ queryKey: ["leave"] });
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Unable to update leave request"));
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader title="Leave" description="Request and manage time off." />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="From"
          type="date"
          size="small"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button
          size="small"
          onClick={() => {
            setFilterFrom("");
            setFilterTo("");
          }}
        >
          Clear dates
        </Button>
      </Stack>

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

      {isLoading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary">
            Loading leave requests...
          </Typography>
        </Box>
      )}
      {(error || actionError) && (
        <Alert severity="error">
          {actionError ?? getApiErrorMessage(error, "Failed to load leave requests")}
        </Alert>
      )}

      {!isLoading && !error && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                {isAdmin && <TableCell>Employee</TableCell>}
                <TableCell>Type</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Admin note</TableCell>
                {isAdmin && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6}>
                    <Typography variant="body2" color="text.secondary">
                      No leave requests in this date range.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((record) => (
                  <TableRow key={record.id} hover>
                    {isAdmin && (
                      <TableCell>
                        {record.employee_name ?? `Employee #${record.employee_id}`}
                      </TableCell>
                    )}
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
                    <TableCell>{record.admin_note || "—"}</TableCell>
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
                              onClick={() => setRejectId(record.id)}
                            >
                              Deny
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

      <Dialog open={rejectId != null} onClose={() => setRejectId(null)} fullWidth maxWidth="sm">
        <DialogTitle>Deny leave request</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason for denial"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            required
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!rejectNote.trim()}
            onClick={() => {
              if (rejectId == null) return;
              void updateStatus(rejectId, "rejected", rejectNote);
            }}
          >
            Deny request
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
