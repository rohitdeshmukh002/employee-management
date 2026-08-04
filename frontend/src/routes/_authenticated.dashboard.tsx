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
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PageHeader } from "@/components/page-header";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type DashboardPerson = {
  employee_id: number;
  employee_name: string;
  department: string | null;
  detail: string | null;
};

type DashboardStats = {
  team_members: number;
  present_today: number;
  on_leave: number;
  pending_leave: number;
  present_employees: DashboardPerson[];
  on_leave_employees: DashboardPerson[];
};

type StatCard = {
  title: string;
  value: number | string;
  icon: SvgIconComponent;
  tint: string;
};

function PersonList({
  title,
  people,
  empty,
}: {
  title: string;
  people: DashboardPerson[];
  empty: string;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        {title}
      </Typography>
      {people.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {empty}
        </Typography>
      ) : (
        <List dense disablePadding>
          {people.map((p) => (
            <ListItem key={`${title}-${p.employee_id}`} disableGutters sx={{ py: 0.75 }}>
              <ListItemText
                primary={p.employee_name}
                secondary={[p.department, p.detail].filter(Boolean).join(" · ")}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: stats, error } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => (await api.get<DashboardStats>("/dashboard/stats")).data,
  });

  const cards: StatCard[] = [
    {
      title: isAdmin ? "Team members" : "Your profile",
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
        description={
          isAdmin
            ? "Who is in today and who is on leave."
            : "Your attendance and leave snapshot."
        }
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

        {isAdmin && (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <PersonList
                title="Present today"
                people={stats?.present_employees ?? []}
                empty="Nobody checked in yet today."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <PersonList
                title="On leave today"
                people={stats?.on_leave_employees ?? []}
                empty="No approved leave covering today."
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}
