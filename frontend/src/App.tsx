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
import Profile from "./pages/user/Profile";
import Security from "./pages/user/Security";
import Settings from "./pages/user/Settings";
import CreateAccount from "./pages/user/CreateAccount";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import CustomCursor from "./components/CustomCursor";
import ParticleBackground from "./components/ParticleBackground";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CustomCursor />
      <ParticleBackground />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/create-account" element={<ProtectedRoute><CreateAccount /></ProtectedRoute>} />

          {/* User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/dashboard/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Admin & Stock routes - to be added later */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
