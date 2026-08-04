import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState, type ReactNode } from "react";

import { PageHeader } from "@/components/page-header";
import { api, getApiErrorMessage, setStoredUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type EmployeeProfile = {
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
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: employee,
    error: loadError,
  } = useQuery({
    queryKey: ["employees", "me"],
    queryFn: async () => (await api.get<EmployeeProfile>("/employees/me")).data,
    enabled: user?.employee_id != null,
  });

  useEffect(() => {
    if (!employee) return;
    setFirstName(employee.first_name);
    setLastName(employee.last_name);
    setPhone(employee.phone ?? "");
  }, [employee]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch<EmployeeProfile>("/employees/me", {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      });
      return data;
    },
    onSuccess: async (data) => {
      setMessage("Profile updated");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["employees", "me"] });
      await refreshUser();
      if (user) {
        setStoredUser({
          ...user,
          name: `${data.first_name} ${data.last_name}`.trim(),
        });
      }
    },
    onError: (err) => {
      setMessage(null);
      setError(getApiErrorMessage(err, "Unable to update profile"));
    },
  });

  return (
    <Box>
      <PageHeader title="Profile" description="Your account information." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">{user?.name ?? "User"}</Typography>
                <ProfileField label="Email (read-only)" value={user?.email} />
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
                    This account is not linked to an employee record. Ask an admin to create your
                    profile.
                  </Typography>
                )}
                {(loadError || error) && (
                  <Alert severity="error">
                    {error ?? getApiErrorMessage(loadError, "Failed to load profile")}
                  </Alert>
                )}
                {message && <Alert severity="success">{message}</Alert>}
                {employee && (
                  <>
                    <TextField
                      label="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    <TextField
                      label="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                    <TextField
                      label="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <TextField label="Email" value={employee.email} InputProps={{ readOnly: true }} />
                    <ProfileField label="Department" value={employee.department} />
                    <ProfileField label="Position" value={employee.position} />
                    <ProfileField label="Hire date" value={employee.hire_date} />
                    <Button
                      variant="contained"
                      disabled={saveMutation.isPending}
                      onClick={() => saveMutation.mutate()}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      {saveMutation.isPending ? "Saving..." : "Save changes"}
                    </Button>
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
