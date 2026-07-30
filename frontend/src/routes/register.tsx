import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Register to access the employee portal."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
