import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type EmployeeProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  salary: number | null;
  hire_date: string;
};

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.employee_id) return;
    api
      .get<EmployeeProfile>("/employees/me")
      .then((res) => setEmployee(res.data))
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load profile")));
  }, [user?.employee_id]);

  return (
    <div>
      <PageHeader title="Profile" description="Your account information." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{user?.name ?? "User"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span> {user?.email}
            </p>
            <p>
              <span className="text-muted-foreground">Role:</span>{" "}
              <span className="capitalize">{user?.role}</span>
            </p>
            <p>
              <span className="text-muted-foreground">User ID:</span> {user?.id}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!user?.employee_id && (
              <p className="text-muted-foreground">
                This account is not linked to an employee record (typical for portal admins).
              </p>
            )}
            {error && <p className="text-destructive">{error}</p>}
            {employee && (
              <>
                <p>
                  <span className="text-muted-foreground">Name:</span> {employee.first_name}{" "}
                  {employee.last_name}
                </p>
                <p>
                  <span className="text-muted-foreground">Department:</span> {employee.department}
                </p>
                <p>
                  <span className="text-muted-foreground">Position:</span> {employee.position}
                </p>
                <p>
                  <span className="text-muted-foreground">Hire date:</span> {employee.hire_date}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
