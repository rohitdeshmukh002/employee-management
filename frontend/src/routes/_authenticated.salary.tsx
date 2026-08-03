import { createFileRoute } from "@tanstack/react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type SalaryRow = {
  employee_id: number;
  employee_name: string;
  email: string;
  department: string;
  position: string;
  salary: number | null;
  hire_date: string;
  currency: string;
};

export const Route = createFileRoute("/_authenticated/salary")({
  component: SalaryPage,
});

function SalaryPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<SalaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<SalaryRow[]>("/salary")
      .then((res) => {
        setRows(res.data);
        setError(null);
      })
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load salary data")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <PageHeader
        title="Salary"
        description={
          user?.role === "admin"
            ? "Payroll overview for the whole team."
            : "Your compensation details."
        }
      />

      {loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary">
            Loading salary data...
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
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Salary</TableCell>
                <TableCell>Hire date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary">
                      No salary records available. Link your account to an employee profile.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.employee_id} hover>
                    <TableCell>{row.employee_name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell>
                      {row.salary != null
                        ? `${row.currency} ${Number(row.salary).toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell>{row.hire_date}</TableCell>
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
