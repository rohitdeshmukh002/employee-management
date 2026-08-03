import { createFileRoute } from "@tanstack/react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
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
    <Box>
      <PageHeader
        title="Attendance"
        description="Track daily check-ins and working hours."
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              disabled={busy}
              onClick={() => void runAction("/attendance/check-in")}
            >
              Check in
            </Button>
            <Button
              variant="outlined"
              disabled={busy}
              onClick={() => void runAction("/attendance/check-out")}
            >
              Check out
            </Button>
          </Stack>
        }
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}
      {loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary">
            Loading attendance...
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
                <TableCell>Date</TableCell>
                <TableCell>Check in</TableCell>
                <TableCell>Check out</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">
                      No attendance records yet. Use Check in to start today.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      {record.employee_name ?? `Employee #${record.employee_id}`}
                    </TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.check_in ?? "—"}</TableCell>
                    <TableCell>{record.check_out ?? "—"}</TableCell>
                    <TableCell>
                      <Chip label={record.status} size="small" sx={{ textTransform: "capitalize" }} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
