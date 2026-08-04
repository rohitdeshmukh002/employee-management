import type { ReactNode } from "react";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
      }}
    >
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          color: "common.white",
          background: "linear-gradient(145deg, #1E3A5F 0%, #0F766E 55%, #0D9488 100%)",
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08), transparent 40%)",
            pointerEvents: "none",
          },
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", position: "relative" }}>
          <ApartmentRoundedIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>
            WorkforceHub
          </Typography>
        </Stack>

        <Box sx={{ position: "relative", maxWidth: 420 }}>
          <Typography variant="h3" sx={{ mb: 2, lineHeight: 1.2 }}>
            Manage your team with clarity and confidence.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Employees, attendance, leave and payroll — all in one modern portal built for growing
            teams.
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ opacity: 0.65, position: "relative" }}>
          © {new Date().getFullYear()} WorkforceHub. All rights reserved.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
          py: 6,
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", display: { xs: "flex", lg: "none" }, mb: 1 }}
            >
              <ApartmentRoundedIcon color="primary" />
              <Typography variant="h6" fontWeight={700} color="primary.main">
                WorkforceHub
              </Typography>
            </Stack>
            <Typography variant="h4">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Stack>
          {children}
          {footer && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
              {footer}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
