"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getSessionExpiry } from "@/lib/api";

// Client-side guard for the admin area. The JWT is still verified by the server
// on every API call — this just gives a clean UX: redirect when logged out, and
// log out automatically the moment the token expires.
export default function useAdminAuth() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("vw_token");
    const exp = getSessionExpiry();

    if (!token || (exp && exp <= Date.now())) {
      clearSession();
      router.replace(token ? "/admin/login?expired=1" : "/admin/login");
      return undefined;
    }

    try {
      setAdmin(JSON.parse(localStorage.getItem("vw_admin") || "null"));
    } catch {
      setAdmin(null); // corrupted storage should not crash the dashboard
    }
    setExpiresAt(exp);
    setChecked(true);

    let timer;
    if (exp) {
      // setTimeout can't hold delays beyond ~24.8 days, so cap it (JWTs here last a day anyway)
      const delay = Math.min(exp - Date.now(), 2 ** 31 - 1);
      timer = setTimeout(() => {
        clearSession();
        router.replace("/admin/login?expired=1");
      }, delay);
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    clearSession();
    router.replace("/admin/login");
  };

  return { admin, checked, logout, expiresAt };
}
