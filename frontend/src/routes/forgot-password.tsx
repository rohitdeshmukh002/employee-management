import { createFileRoute, Link } from "@tanstack/react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinkMui from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { AuthLayout } from "@/components/auth-layout";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Password reset email delivery is not configured yet."
      footer={
        <LinkMui component={Link} to="/login" underline="hover" fontWeight={600}>
          Back to sign in
        </LinkMui>
      }
    >
      {sent ? (
        <Typography variant="body2" color="text.secondary">
          If an account exists for {email}, contact your administrator to reset the password. Demo
          accounts use <strong>Password123!</strong>
        </Typography>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
            <Button type="submit" variant="contained" size="large" fullWidth>
              Request reset help
            </Button>
          </Stack>
        </Box>
      )}
    </AuthLayout>
  );
}
