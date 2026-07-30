import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title="Profile" description="Your account information." />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{user?.name ?? "User"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span> {user?.email}
          </p>
          <p>
            <span className="text-muted-foreground">Role:</span>{" "}
            <span className="capitalize">{user?.role}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
