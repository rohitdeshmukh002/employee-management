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
      subtitle="Contact your administrator to reset your password."
      footer={
        <LinkMui component={Link} to="/login" underline="hover" fontWeight={600}>
          Back to sign in
        </LinkMui>
      }
    >
      {sent ? (
        <Typography variant="body2" color="text.secondary">
          If an account exists for {email}, ask your administrator to issue a new temporary
          password.
        </Typography>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Button type="submit" variant="contained" size="large" fullWidth>
              Request help
            </Button>
          </Stack>
        </Box>
      )}
    </AuthLayout>
  );
}
