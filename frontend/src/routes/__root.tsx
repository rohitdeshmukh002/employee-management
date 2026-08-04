import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import "@fontsource-variable/plus-jakarta-sans";

import { AuthProvider } from "@/lib/auth";
import { theme } from "@/theme";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <Stack
      spacing={2}
      sx={{
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="h3">404</Typography>
      <Typography color="text.secondary">The page you&apos;re looking for doesn&apos;t exist.</Typography>
      <Button component={Link} to="/" variant="contained">
        Go home
      </Button>
    </Stack>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <Stack
      spacing={2}
      sx={{
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="h5">Something went wrong</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        This page didn&apos;t load. Try refreshing or head back home.
      </Typography>
      <Stack direction="row" spacing={1.5}>
        <Button
          variant="contained"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Try again
        </Button>
        <Button component={Link} to="/" variant="outlined">
          Go home
        </Button>
      </Stack>
    </Stack>
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Box sx={{ minHeight: "100vh" }}>
            <Outlet />
          </Box>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
