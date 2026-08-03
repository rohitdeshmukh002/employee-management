import { createFileRoute, Link } from "@tanstack/react-router";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import LinkMui from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

import { AuthLayout } from "@/components/auth-layout";
import { goToDashboard } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      goToDashboard();
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout title="Create account" subtitle="Checking your session...">
        <Stack spacing={2} sx={{ alignItems: "center", py: 4 }}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            Please wait...
          </Typography>
        </Stack>
      </AuthLayout>
    );
  }

  if (isAuthenticated) {
    return (
      <AuthLayout title="Create account" subtitle="You are already signed in.">
        <Typography variant="body2" color="text.secondary">
          Redirecting to dashboard...
        </Typography>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Register to access the employee portal."
      footer={
        <>
          Already have an account?{" "}
          <LinkMui component={Link} to="/login" underline="hover" fontWeight={600}>
            Sign in
          </LinkMui>
        </>
      }
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <TextField
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
            inputProps={{ minLength: 2 }}
            autoComplete="name"
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            inputProps={{ minLength: 6 }}
            autoComplete="new-password"
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
