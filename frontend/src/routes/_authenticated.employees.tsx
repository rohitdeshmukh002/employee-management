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
import { requireAdminRole } from "@/routes/_authenticated";

type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  salary: number | null;
  hire_date: string;
};

export const Route = createFileRoute("/_authenticated/employees")({
  beforeLoad: () => {
    requireAdminRole();
  },
  component: EmployeesPage,
});

function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Employee[]>("/employees")
      .then((response) => {
        setEmployees(response.data);
        setError(null);
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load employees"));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage your team directory. Data is loaded from PostgreSQL via the FastAPI backend."
      />

      {loading && <p className="text-sm text-muted-foreground">Loading employees...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Hire Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    {employee.first_name} {employee.last_name}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    {employee.salary != null ? `$${Number(employee.salary).toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell>{employee.hire_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
