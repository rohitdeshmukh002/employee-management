import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PageHeader } from "@/components/page-header";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type DashboardStats = {
  team_members: number;
  present_today: number;
  on_leave: number;
  pending_leave: number;
};

type StatCard = {
  title: string;
  value: number | string;
  icon: SvgIconComponent;
  tint: string;
};

function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, error } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => (await api.get<DashboardStats>("/dashboard/stats")).data,
  });

  const cards: StatCard[] = [
    {
      title: "Team members",
      value: stats?.team_members ?? "—",
      icon: PeopleAltRoundedIcon,
      tint: "rgba(15, 118, 110, 0.12)",
    },
    {
      title: "Present today",
      value: stats?.present_today ?? "—",
      icon: EventAvailableRoundedIcon,
      tint: "rgba(30, 58, 95, 0.12)",
    },
    {
      title: "On leave",
      value: stats?.on_leave ?? "—",
      icon: CalendarMonthRoundedIcon,
      tint: "rgba(217, 119, 6, 0.12)",
    },
    {
      title: "Pending leave",
      value: stats?.pending_leave ?? "—",
      icon: PendingActionsRoundedIcon,
      tint: "rgba(220, 38, 38, 0.1)",
    },
  ];

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.name ?? "there"}`}
        description="Overview of your workforce at a glance."
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getApiErrorMessage(error, "Failed to load dashboard")}
        </Alert>
      )}
      <Grid container spacing={2.5}>
        {cards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid key={stat.title} size={{ xs: 12, sm: 6, xl: 3 }}>
              <Card>
                <CardContent>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: stat.tint,
                        color: "primary.main",
                      }}
                    >
                      <Icon />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
