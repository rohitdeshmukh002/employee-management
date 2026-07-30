import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-heading text-4xl font-semibold">404</h1>
      <p className="text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="text-primary underline-offset-4 hover:underline">
        Go home
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-heading text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This page didn&apos;t load. Try refreshing or head back home.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "WorkforceHub" },
      { name: "description", content: "Employee management portal" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
