import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, CalendarDays, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<DashboardStats>("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load dashboard")));
  }, []);

  const cards = [
    { title: "Team members", value: stats?.team_members ?? "—", icon: Users },
    { title: "Present today", value: stats?.present_today ?? "—", icon: CalendarClock },
    { title: "On leave", value: stats?.on_leave ?? "—", icon: CalendarDays },
    { title: "Pending leave", value: stats?.pending_leave ?? "—", icon: Wallet },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name ?? "there"}`}
        description="Overview of your workforce at a glance."
      />
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
