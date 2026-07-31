import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div>
      <PageHeader
        title="Salary"
        description={
          user?.role === "admin"
            ? "Payroll overview for the whole team."
            : "Your compensation details."
        }
      />

      {loading && <p className="text-sm text-muted-foreground">Loading salary data...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Hire date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No salary records available. Link your account to an employee profile.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.employee_id}>
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
        </div>
      )}
    </div>
  );
}
