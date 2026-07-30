import { createFileRoute } from "@tanstack/react-router";
import { Users, CalendarClock, CalendarDays, Wallet } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const stats = [
  { title: "Team members", value: "24", icon: Users },
  { title: "Present today", value: "21", icon: CalendarClock },
  { title: "On leave", value: "3", icon: CalendarDays },
  { title: "Payroll cycle", value: "Active", icon: Wallet },
];

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name ?? "there"}`}
        description="Overview of your workforce at a glance."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
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
