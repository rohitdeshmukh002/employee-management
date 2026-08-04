import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
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
import { useRef, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type BaseSalary = {
  employee_id: number;
  employee_name: string;
  email: string;
  department: string;
  position: string;
  salary: number | null;
  hire_date: string;
  currency: string;
};

type Payment = {
  id: number;
  employee_id: number;
  employee_name: string | null;
  email: string | null;
  year: number;
  month: number;
  amount: number | string;
  deposited_on: string;
  payslip_filename: string | null;
  has_payslip: boolean;
};

type Employee = {
  id: number;
  first_name: string;
  last_name: string;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const Route = createFileRoute("/_authenticated/salary")({
  component: SalaryPage,
});

function SalaryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    employee_id: "",
    year: String(new Date().getFullYear()),
    month: String(new Date().getMonth() + 1),
    amount: "",
    deposited_on: new Date().toISOString().slice(0, 10),
  });

  const {
    data: payments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["salary", "payments"],
    queryFn: async () => (await api.get<Payment[]>("/salary/payments")).data,
  });

  const { data: baseSalaries = [] } = useQuery({
    queryKey: ["salary", "base"],
    queryFn: async () => (await api.get<BaseSalary[]>("/salary/base")).data,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get<Employee[]>("/employees")).data,
    enabled: isAdmin,
  });

  const createPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await api.post("/salary/payments", {
        employee_id: Number(form.employee_id),
        year: Number(form.year),
        month: Number(form.month),
        amount: Number(form.amount),
        deposited_on: form.deposited_on,
      });
      setOpen(false);
      setForm((f) => ({ ...f, amount: "", employee_id: "" }));
      await queryClient.invalidateQueries({ queryKey: ["salary", "payments"] });
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Unable to record payment"));
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPayslip = async (paymentId: number, filename?: string | null) => {
    try {
      setActionError(null);
      const res = await api.get(`/salary/payments/${paymentId}/payslip`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `payslip-${paymentId}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Unable to download payslip"));
    }
  };

  const onPickPayslip = (paymentId: number) => {
    setUploadId(paymentId);
    fileInputRef.current?.click();
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const paymentId = uploadId;
    event.target.value = "";
    if (!file || paymentId == null) return;
    try {
      setActionError(null);
      const body = new FormData();
      body.append("file", file);
      await api.post(`/salary/payments/${paymentId}/payslip`, body, {
        headers: { "Content-Type": undefined },
      });
      await queryClient.invalidateQueries({ queryKey: ["salary", "payments"] });
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Unable to upload payslip"));
    } finally {
      setUploadId(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Salary"
        description={
          isAdmin
            ? "Record deposit dates and upload payslips from your laptop."
            : "Your base compensation and monthly payment history."
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        hidden
        onChange={onFileChange}
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Base compensation
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Salary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {baseSalaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    No compensation record linked.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              baseSalaries.map((row) => (
                <TableRow key={row.employee_id} hover>
                  <TableCell>{row.employee_name}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.position}</TableCell>
                  <TableCell>
                    {row.salary != null
                      ? `${row.currency} ${Number(row.salary).toLocaleString()}`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}
      >
        <Typography variant="h6">Payments & payslips</Typography>
        {isAdmin && (
          <Button variant="contained" onClick={() => setOpen(true)}>
            Record deposit
          </Button>
        )}
      </Stack>

      {isLoading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary">
            Loading payments…
          </Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error">{getApiErrorMessage(error, "Failed to load payments")}</Alert>
      )}

      {!isLoading && !error && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                {isAdmin && <TableCell>Employee</TableCell>}
                <TableCell>Period</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Deposited</TableCell>
                <TableCell>Payslip</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5}>
                    <Typography variant="body2" color="text.secondary">
                      No salary payments recorded yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((row) => (
                  <TableRow key={row.id} hover>
                    {isAdmin && <TableCell>{row.employee_name ?? "—"}</TableCell>}
                    <TableCell>
                      {MONTHS[row.month - 1]} {row.year}
                    </TableCell>
                    <TableCell>{Number(row.amount).toLocaleString()}</TableCell>
                    <TableCell>{row.deposited_on}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.has_payslip ? "Available" : "Missing"}
                        color={row.has_payslip ? "success" : "default"}
                        variant={row.has_payslip ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {row.has_payslip && (
                          <Button
                            size="small"
                            onClick={() => downloadPayslip(row.id, row.payslip_filename)}
                          >
                            Download
                          </Button>
                        )}
                        {isAdmin && (
                          <Button size="small" variant="outlined" onClick={() => onPickPayslip(row.id)}>
                            Upload
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Record salary deposit</DialogTitle>
        <Box component="form" onSubmit={createPayment}>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  select
                  label="Employee"
                  value={form.employee_id}
                  onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                  fullWidth
                  required
                >
                  {employees.map((e) => (
                    <MenuItem key={e.id} value={String(e.id)}>
                      {e.first_name} {e.last_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Year"
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  label="Month"
                  value={form.month}
                  onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                  fullWidth
                  required
                >
                  {MONTHS.map((label, i) => (
                    <MenuItem key={label} value={String(i + 1)}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  fullWidth
                  required
                  slotProps={{ htmlInput: { min: 1, step: 0.01 } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Deposited on"
                  type="date"
                  value={form.deposited_on}
                  onChange={(e) => setForm((f) => ({ ...f, deposited_on: e.target.value }))}
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
