import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

// --- admin session helpers -------------------------------------------------
const decodeExp = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const getSessionExpiry = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("vw_token");
  return token ? decodeExp(token) : null;
};

export const clearSession = () => {
  localStorage.removeItem("vw_token");
  localStorage.removeItem("vw_admin");
};

export const expireSession = () => {
  clearSession();
  if (window.location.pathname !== "/admin/login") {
    window.location.href = "/admin/login?expired=1";
  }
};

// attach admin token (if present) to every request — and refuse to use an expired one
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vw_token");
    // never attach (or block on) a stored token for the login call itself
    const isLogin = config.url?.includes("/auth/login");
    if (token && !isLogin) {
      const exp = decodeExp(token);
      if (exp && exp <= Date.now() && window.location.pathname.startsWith("/admin")) {
        expireSession();
        return Promise.reject(new axios.Cancel("Session expired"));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// centralised 401 handling: drop the stale token, bounce to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // a 401 on the login form itself just means "wrong password" — only treat it as an
    // expired session when we were actually logged in
    const isLoginCall = err?.config?.url?.includes("/auth/login");
    if (typeof window !== "undefined" && err?.response?.status === 401 && !isLoginCall) {
      clearSession();
      if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login?expired=1";
      }
    }
    return Promise.reject(err);
  }
);

// Cloudinary always returns a full https URL, so this just guards against
// an unexpected relative path and unwraps the {url, publicId} image shape.
export const imgUrl = (image) => {
  if (!image) return "";
  const raw = typeof image === "string" ? image : image.url;
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  const base = process.env.NEXT_PUBLIC_UPLOADS_URL || "";
  return `${base}${raw}`;
};

export default api;
