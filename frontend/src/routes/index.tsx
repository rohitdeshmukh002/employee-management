import { createFileRoute, redirect } from "@tanstack/react-router";

import { getToken } from "@/lib/api";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: "/dashboard" });
    }
    throw redirect({ to: "/login" });
  },
});
