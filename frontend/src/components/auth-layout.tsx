import type { ReactNode } from "react";
import { Building2 } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Building2 className="h-6 w-6 text-sidebar-primary" />
          WorkforceHub
        </div>
        <div className="space-y-4">
          <h2 className="font-heading text-3xl font-semibold leading-tight">
            Manage your team with clarity and confidence.
          </h2>
          <p className="max-w-sm text-sm text-sidebar-foreground/70">
            Employees, attendance, leave and payroll — all in one clean, modern portal built for
            growing teams.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">
          © {new Date().getFullYear()} WorkforceHub. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-heading text-lg font-semibold lg:hidden">
              <Building2 className="h-6 w-6 text-primary" />
              WorkforceHub
            </div>
            <h1 className="font-heading text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
