import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getRolesFromToken, apiFetch } from "@/lib/api";
import { Shield, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Callback = () => {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      navigate("/");
      return;
    }

    window.history.replaceState({}, document.title, "/callback");

    const login = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirectUri: `${window.location.origin}/callback`,
          }),
        });

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        if (!data.accessToken || !data.refreshToken) throw new Error("Invalid token response");

        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        const roles = getRolesFromToken(data.accessToken);
        const isAdmin = roles.includes("ADMIN") || roles.includes("ROLE_ADMIN");

        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Login failed:", err);
        localStorage.clear();
        navigate("/");
      }
    };

    login();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center vault-gradient-bg dark">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl animate-pulse-glow" />
          <div className="relative flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 p-4">
            <Shield className="text-primary" size={32} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm font-medium">Authenticating…</span>
        </div>
      </div>
    </div>
  );
};

export default Callback;
