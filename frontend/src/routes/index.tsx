import { createFileRoute } from "@tanstack/react-router";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";

import { goToDashboard } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: HomeRedirect,
});

function HomeRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      goToDashboard();
      return;
    }
    window.location.assign("/login");
  }, [isAuthenticated, isLoading]);

  return (
    <Stack sx={{ minHeight: "100vh", alignItems: "center", justifyContent: "center" }} spacing={2}>
      <CircularProgress size={28} />
      <Typography variant="body2" color="text.secondary">
        Loading...
      </Typography>
    </Stack>
  );
}
