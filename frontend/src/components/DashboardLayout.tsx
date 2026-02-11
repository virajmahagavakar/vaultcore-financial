import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Send,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Star,
  Wallet as WalletIcon,
} from "lucide-react";
import { useState } from "react";
import VaultLogo from "@/components/VaultLogo";
import { logout } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ChatWidget } from "@/components/ChatWidget";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase },
  { path: "/dashboard/watchlist", label: "Watchlist", icon: Star },
  { path: "/market", label: "Market", icon: TrendingUp },
  { path: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { path: "/dashboard/transfer", label: "Wallet", icon: WalletIcon },
  { path: "/transfer", label: "Transfer", icon: Send },
  { path: "/dashboard/profile", label: "Profile", icon: User },
  { path: "/dashboard/security", label: "Security", icon: Shield },
  { path: "/dashboard/settings", label: "Settings", icon: Settings },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { hasRole } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300 ${collapsed ? "w-20" : "w-64"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={`flex items-center border-b border-sidebar-border py-6 transition-all duration-300 ${collapsed ? "justify-center px-2" : "justify-between px-6"}`}>
            <VaultLogo size={collapsed ? 32 : 32} showText={!collapsed} />
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                    ? "bg-primary/10 text-primary glow-cyan-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    } ${collapsed ? "justify-center" : ""}`}
                >
                  <item.icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="border-t border-sidebar-border p-3 space-y-1">
            {hasRole('ADMIN') && (
              <Link
                to="/admin"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all font-bold"
              >
                <Shield size={20} />
                {!collapsed && <span>Admin Console</span>}
              </Link>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              {!collapsed && <span>Collapse</span>}
            </button>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut size={20} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main
        className={`flex-1 transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"
          }`}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>

      {/* AI Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default DashboardLayout;
