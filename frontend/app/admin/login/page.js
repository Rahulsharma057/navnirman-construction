"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Container, Paper, Typography, TextField, Button, Alert } from "@mui/material";
import api, { clearSession, getSessionExpiry } from "@/lib/api";
import Logo from "@/components/Logo";
import { tokens } from "@/lib/theme";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // clear any stale/expired token first so it can never interfere with signing in
    const exp = getSessionExpiry();
    const valid = localStorage.getItem("vw_token") && exp && exp > Date.now();
    if (!valid) clearSession();
    if (params.get("expired")) setError("Your session has expired. Please sign in again.");
    else if (valid) router.replace("/admin/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email: form.email.trim(), password: form.password });
      localStorage.setItem("vw_token", data.token);
      localStorage.setItem("vw_admin", JSON.stringify(data.admin));
      router.push("/admin/dashboard");
    } catch (err) {
      setError(
        err?.response
          ? err.response.data?.message || "Login failed. Check your email and password."
          : "Cannot reach the server. Make sure the backend is running (npm run dev in /backend) and NEXT_PUBLIC_API_URL is correct."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", backgroundColor: tokens.paper }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: 4, border: `1px solid ${tokens.line}` }}>
          <Box sx={{ mb: 3 }}>
            <Logo href="" size={46} />
          </Box>
          <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", mb: 0.5 }}>Admin sign in</Typography>
          <Typography sx={{ color: "#6b665c", mb: 3 }}>Manage projects, tenders and your company profile.</Typography>

          {error && (
            <Alert severity={params.get("expired") && !form.email ? "warning" : "error"} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              sx={{ mb: 2.5 }}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              sx={{ mb: 3 }}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default function AdminLoginPage() {
  // useSearchParams needs a Suspense boundary for production builds
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
