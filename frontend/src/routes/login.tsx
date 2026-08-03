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

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
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
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout title="Sign in" subtitle="Checking your session...">
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
      <AuthLayout title="Sign in" subtitle="You are already signed in.">
        <Typography variant="body2" color="text.secondary">
          Redirecting to dashboard...
        </Typography>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Enter your credentials to access the employee portal."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <LinkMui component={Link} to="/register" underline="hover" fontWeight={600}>
            Register
          </LinkMui>
        </>
      }
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@company.com"
            required
            autoComplete="email"
          />
          <Box>
            <Stack direction="row" sx={{ justifyContent: "flex-end", mb: 0.5 }}>
              <LinkMui
                component={Link}
                to="/forgot-password"
                variant="caption"
                underline="hover"
                fontWeight={600}
              >
                Forgot password?
              </LinkMui>
            </Stack>
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              inputProps={{ minLength: 6 }}
              autoComplete="current-password"
            />
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <Typography variant="caption" color="text.secondary">
            Demo: admin@company.com / Password123! or any seeded employee email with the same
            password.
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
