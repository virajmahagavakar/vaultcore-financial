import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Callback from "./pages/Callback";
import Dashboard from "./pages/user/Dashboard";
import Transactions from "./pages/user/Transactions";
import Transfer from "./pages/user/Transfer";
import TransferFunds from "./pages/user/TransferFunds";
import Profile from "./pages/user/Profile";
import Security from "./pages/user/Security";
import Settings from "./pages/user/Settings";
import CreateAccount from "./pages/user/CreateAccount";
import Stocks from "./pages/user/Stocks";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import CustomCursor from "./components/CustomCursor";
import SplashCursor from "./components/SplashCursor";
import ParticleBackground from "./components/ParticleBackground";
import MarketHome from "./pages/market/MarketHome";
import CoinDetails from "./pages/market/CoinDetails";
import Portfolio from "./pages/user/Portfolio";
import WatchlistPage from "@/pages/user/WatchlistPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import TradingDashboard from "./pages/admin/TradingDashboard";
import ReportsPage from "./pages/admin/ReportsPage";
import SecurityPage from "./pages/admin/SecurityPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CustomCursor />
      {/* <SplashCursor
        SIM_RESOLUTION={96}
        DYE_RESOLUTION={1024}
        DENSITY_DISSIPATION={2}
        VELOCITY_DISSIPATION={2}
        PRESSURE={0.1}
        CURL={3}
        SPLAT_RADIUS={0.2}
        SPLAT_FORCE={6000}
        COLOR_UPDATE_SPEED={10}
      /> */}
      <ParticleBackground />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/create-account" element={<ProtectedRoute><CreateAccount /></ProtectedRoute>} />

          {/* Public Market Routes */}
          <Route path="/market" element={<MarketHome />} />
          <Route path="/market/coin/:id" element={<CoinDetails />} />

          {/* User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path="/dashboard/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
          <Route path="/dashboard/stocks" element={<ProtectedRoute><Stocks /></ProtectedRoute>} />
          <Route path="/dashboard/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/dashboard/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
          <Route path="/transfer" element={<ProtectedRoute><TransferFunds /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="trading" element={<TradingDashboard />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="security" element={<SecurityPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
