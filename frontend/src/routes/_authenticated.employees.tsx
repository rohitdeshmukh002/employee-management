import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
import CircularProgress from "@mui/material/CircularProgress";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { api, getApiErrorMessage } from "@/lib/api";
import { requireAdminRole } from "@/routes/_authenticated";

type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department: string;
  position: string;
  salary: number | null;
  hire_date: string;
};

type CreateResponse = {
  employee: Employee;
  login_email: string;
  temporary_password: string;
  message: string;
};

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  salary: "",
  hire_date: new Date().toISOString().slice(0, 10),
  password: "",
};

export const Route = createFileRoute("/_authenticated/employees")({
  beforeLoad: () => {
    requireAdminRole();
  },
  component: EmployeesPage,
});

function EmployeesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [credentials, setCredentials] = useState<CreateResponse | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [nameFilter, setNameFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: employees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get<Employee[]>("/employees")).data,
  });

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department))).sort(),
    [employees],
  );

  const filtered = useMemo(() => {
    const q = nameFilter.trim().toLowerCase();
    return employees.filter((e) => {
      const name = `${e.first_name} ${e.last_name}`.toLowerCase();
      const matchName = !q || name.includes(q) || e.email.toLowerCase().includes(q);
      const matchDept = deptFilter === "all" || e.department === deptFilter;
      return matchName && matchDept;
    });
  }, [employees, nameFilter, deptFilter]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<CreateResponse>("/employees", {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
        department: form.department,
        position: form.position,
        salary: form.salary ? Number(form.salary) : null,
        hire_date: form.hire_date,
        password: form.password,
      });
      return data;
    },
    onSuccess: (data) => {
      setCredentials(data);
      setForm(emptyForm);
      setFormError(null);
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err) => setFormError(getApiErrorMessage(err, "Unable to create employee")),
  });

  const closeDialogs = () => {
    setOpen(false);
    setCredentials(null);
    setFormError(null);
  };

  return (
    <Box>
      <PageHeader
        title="Employees"
        description="Create employee profiles and share login credentials by email."
        action={
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add employee
          </Button>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Filter by name or email"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 240 }}
        />
        <TextField
          select
          label="Department"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All</MenuItem>
          {departments.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {isLoading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary">
            Loading employees...
          </Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error">{getApiErrorMessage(error, "Failed to load employees")}</Alert>
      )}

      {!isLoading && !error && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Salary</TableCell>
                <TableCell>Hire Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography variant="body2" color="text.secondary">
                      No employees match your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      {employee.first_name} {employee.last_name}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone || "—"}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      {employee.salary != null
                        ? `$${Number(employee.salary).toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell>{employee.hire_date}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open && !credentials} onClose={closeDialogs} fullWidth maxWidth="sm">
        <DialogTitle>Add employee</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {(
              [
                ["first_name", "First name"],
                ["last_name", "Last name"],
                ["email", "Email (login)"],
                ["phone", "Phone"],
                ["department", "Department"],
                ["position", "Position"],
                ["salary", "Salary"],
                ["hire_date", "Hire date"],
                ["password", "Temporary password"],
              ] as const
            ).map(([key, label]) => (
              <Grid key={key} size={{ xs: 12, sm: key === "email" || key === "password" ? 12 : 6 }}>
                <TextField
                  label={label}
                  type={
                    key === "password"
                      ? "password"
                      : key === "hire_date"
                        ? "date"
                        : key === "salary"
                          ? "number"
                          : key === "email"
                            ? "email"
                            : "text"
                  }
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required={key !== "phone" && key !== "salary"}
                  fullWidth
                  slotProps={{
                    inputLabel: key === "hire_date" ? { shrink: true } : undefined,
                    htmlInput: key === "password" ? { minLength: 6 } : undefined,
                  }}
                />
              </Grid>
            ))}
          </Grid>
          {formError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialogs}>Cancel</Button>
          <Button
            variant="contained"
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? "Creating..." : "Create & show credentials"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!credentials} onClose={closeDialogs} fullWidth maxWidth="sm">
        <DialogTitle>Share login credentials</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Copy these details and email them to the employee. They are shown only once here.
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              label="Login email"
              value={credentials?.login_email ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Temporary password"
              value={credentials?.temporary_password ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              if (!credentials) return;
              void navigator.clipboard.writeText(
                `WorkforceHub login\nEmail: ${credentials.login_email}\nPassword: ${credentials.temporary_password}`,
              );
            }}
          >
            Copy
          </Button>
          <Button variant="contained" onClick={closeDialogs}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
