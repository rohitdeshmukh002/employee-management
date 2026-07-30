import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/attendance")({
  component: AttendancePage,
});

function AttendancePage() {
  return (
    <div>
      <PageHeader title="Attendance" description="Track daily check-ins and working hours." />
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Attendance tracking will be connected to the backend in a future update.
        </CardContent>
      </Card>
    </div>
  );
}
