import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/leave")({
  component: LeavePage,
});

function LeavePage() {
  return (
    <div>
      <PageHeader title="Leave" description="Request and manage time off." />
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Leave management will be connected to the backend in a future update.
        </CardContent>
      </Card>
    </div>
  );
}
