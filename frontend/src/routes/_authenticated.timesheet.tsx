import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type TimesheetEntry = {
  id: number;
  employee_id: number;
  employee_name: string | null;
  work_date: string;
  hours: number | string;
  description: string;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const Route = createFileRoute("/_authenticated/timesheet")({
  component: TimesheetPage,
});

function TimesheetPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [workDate, setWorkDate] = useState(now.toISOString().slice(0, 10));
  const [hours, setHours] = useState("8");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const {
    data: entries = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["timesheets", year, month],
    queryFn: async () =>
      (
        await api.get<TimesheetEntry[]>("/timesheets", {
          params: { year, month },
        })
      ).data,
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await api.post("/timesheets", {
        work_date: workDate,
        hours: Number(hours),
        description,
      });
      setDescription("");
      await queryClient.invalidateQueries({ queryKey: ["timesheets"] });
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Unable to save timesheet entry"));
    } finally {
      setSubmitting(false);
    }
  };

  const downloadCsv = async () => {
    setExporting(true);
    try {
      const res = await api.get("/timesheets/export", {
        params: { year, month },
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timesheet-${year}-${String(month).padStart(2, "0")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Unable to download timesheet"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Timesheet"
        description={
          isAdmin
            ? "Review team daily hours. Employees must log at least 8 hours per day."
            : "Log at least 8 hours for each work day, then download a monthly CSV."
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2.5 }}>
        <TextField
          select
          label="Month"
          size="small"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          sx={{ minWidth: 160 }}
        >
          {MONTHS.map((label, i) => (
            <MenuItem key={label} value={i + 1}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Year"
          size="small"
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ width: 120 }}
        />
        <Button variant="outlined" onClick={downloadCsv} disabled={exporting}>
          {exporting ? "Downloading…" : "Download month CSV"}
        </Button>
      </Stack>

      {!isAdmin && (
        <Card sx={{ mb: 2.5 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Add daily entry
            </Typography>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <Box component="form" onSubmit={submit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Work date"
                    type="date"
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    fullWidth
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label="Hours (min 8)"
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    fullWidth
                    required
                    slotProps={{ htmlInput: { min: 8, max: 24, step: 0.25 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <Button type="submit" variant="contained" disabled={submitting}>
                    {submitting ? "Saving…" : "Save entry"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary">
            Loading timesheet…
          </Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error">{getApiErrorMessage(error, "Failed to load timesheet")}</Alert>
      )}

      {!isLoading && !error && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                {isAdmin && <TableCell>Employee</TableCell>}
                <TableCell>Hours</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3}>
                    <Typography variant="body2" color="text.secondary">
                      No entries for this month yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.work_date}</TableCell>
                    {isAdmin && <TableCell>{row.employee_name ?? "—"}</TableCell>}
                    <TableCell>{Number(row.hours).toFixed(2)}</TableCell>
                    <TableCell>{row.description || "—"}</TableCell>
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
