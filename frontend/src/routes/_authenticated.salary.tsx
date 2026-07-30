import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/salary")({
  component: SalaryPage,
});

function SalaryPage() {
  return (
    <div>
      <PageHeader title="Salary" description="View payroll and compensation details." />
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Salary and payroll views will be connected to the backend in a future update.
        </CardContent>
      </Card>
    </div>
  );
}
