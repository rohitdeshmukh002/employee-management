import { Link, useRouterState } from "@tanstack/react-router";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { type Role, useAuth } from "@/lib/auth";

export const DRAWER_WIDTH = 260;

interface NavItem {
  title: string;
  url: string;
  icon: SvgIconComponent;
  roles?: Role[];
}

const items: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: DashboardRoundedIcon },
  { title: "Employees", url: "/employees", icon: PeopleAltRoundedIcon, roles: ["admin"] },
  { title: "Attendance", url: "/attendance", icon: EventAvailableRoundedIcon },
  { title: "Leave", url: "/leave", icon: CalendarMonthRoundedIcon },
  { title: "Salary", url: "/salary", icon: PaymentsRoundedIcon },
  { title: "Profile", url: "/profile", icon: PersonRoundedIcon },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const visible = items.filter((i) => !i.roles || (user && i.roles.includes(user.role)));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ px: 2.5, gap: 1.25 }}>
        <ApartmentRoundedIcon color="primary" />
        <Typography variant="h6" fontWeight={700} noWrap>
          WorkforceHub
        </Typography>
      </Toolbar>
      <Divider />

      <Box sx={{ flex: 1, overflow: "auto", py: 1.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 3, mb: 0.5, display: "block", fontWeight: 600, letterSpacing: 0.6 }}
        >
          MENU
        </Typography>
        <List disablePadding>
          {visible.map((item) => {
            const Icon = item.icon;
            const selected = currentPath === item.url;
            return (
              <ListItemButton
                key={item.title}
                component={Link}
                to={item.url}
                selected={selected}
                onClick={onNavigate}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5, px: 0.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: 14 }}>
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
              {user?.role}
            </Typography>
          </Box>
        </Stack>
        <ListItemButton onClick={logout} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign out" />
        </ListItemButton>
      </Box>
    </Box>
  );
}
