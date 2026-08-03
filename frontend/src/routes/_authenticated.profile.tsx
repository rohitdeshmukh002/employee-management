import { createFileRoute } from "@tanstack/react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState, type ReactNode } from "react";

import { PageHeader } from "@/components/page-header";
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

function ProfileField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

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
    <Box>
      <PageHeader title="Profile" description="Your account information." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">{user?.name ?? "User"}</Typography>
                <ProfileField label="Email" value={user?.email} />
                <ProfileField
                  label="Role"
                  value={
                    <Chip
                      label={user?.role}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ textTransform: "capitalize" }}
                    />
                  }
                />
                <ProfileField label="User ID" value={user?.id} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Employee record</Typography>
                {!user?.employee_id && (
                  <Typography variant="body2" color="text.secondary">
                    This account is not linked to an employee record (typical for portal admins).
                  </Typography>
                )}
                {error && <Alert severity="error">{error}</Alert>}
                {employee && (
                  <>
                    <ProfileField
                      label="Name"
                      value={`${employee.first_name} ${employee.last_name}`}
                    />
                    <ProfileField label="Department" value={employee.department} />
                    <ProfileField label="Position" value={employee.position} />
                    <ProfileField label="Hire date" value={employee.hire_date} />
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
