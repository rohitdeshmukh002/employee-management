import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

import { AppSidebar, DRAWER_WIDTH } from "@/components/app-sidebar";
import { getStoredUser, getToken } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    // localStorage is not available during SSR, so getToken() is always null there.
    // Skipping the redirect on the server avoids a login ↔ dashboard loop.
    if (typeof window === "undefined") return;
    if (!getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});

export function requireAdminRole() {
  if (typeof window === "undefined") return;
  const user = getStoredUser();
  if (!user || user.role !== "admin") {
    throw redirect({ to: "/dashboard" });
  }
}

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      void navigate({ to: "/login" });
      return;
    }
    setAuthReady(true);
  }, [navigate]);

  if (!authReady) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress size={28} aria-label="Checking session" />
      </Box>
    );
  }

  const drawer = <AppSidebar onNavigate={() => setMobileOpen(false)} />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: "none" }, color: "text.primary" }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            Employee Portal
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
