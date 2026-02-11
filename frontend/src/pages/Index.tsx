import { Link } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  Lock,
  TrendingUp,
  CreditCard,
  Users,
  Zap,
  Globe,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import VaultLogo from "@/components/VaultLogo";
import { getKeycloakLoginUrl, getKeycloakRegisterUrl, isAuthenticated } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MagneticText from "@/components/MagneticText";

const features = [
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "End-to-end encryption with Keycloak-powered authentication and PIN-protected transactions.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Tracking",
    description: "Monitor balances, debits, and credits instantly. Full transaction history at your fingertips.",
  },
  {
    icon: CreditCard,
    title: "Smart Accounts",
    description: "Create accounts, set daily limits, freeze/unfreeze — all with complete control.",
  },
  {
    icon: Zap,
    title: "Instant Transfers",
    description: "Send money securely with PIN verification and real-time notifications.",
  },
  {
    icon: Users,
    title: "Admin Controls",
    description: "Role-based access with separate admin and user dashboards for complete oversight.",
  },
  {
    icon: Globe,
    title: "Stock Trading",
    description: "Simulate stock trading with integrated market data. Coming soon.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen vault-gradient-bg text-foreground dark">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full glass-strong">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <VaultLogo />
          <div className="flex items-center gap-6">
            <a href="#about" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground transition-colors md:block">
              About
            </a>
            <a href="#contact" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground transition-colors md:block">
              Contact
            </a>
            <a href={getKeycloakLoginUrl()}>
              <Button variant="ghost" size="sm" className="text-foreground">
                Login
              </Button>
            </a>
            <a href={getKeycloakRegisterUrl()}>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan-sm">
                Sign Up
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
        {/* Decorative elements */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 top-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
            <Shield size={14} className="text-primary" />
            <span className="text-xs font-medium text-primary">Secure Financial Platform</span>
          </div>

          <h1 className="mb-6 font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
            <MagneticText>VaultCore</MagneticText>{" "}
            <span className="text-gradient"><MagneticText>Financial</MagneticText></span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Secure. Smart. Centralized Financial Control. Manage accounts, track
            transactions, and transfer funds — all protected with bank-grade
            security.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={getKeycloakLoginUrl()}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan px-8 text-base font-semibold">
                Get Started <ArrowRight className="ml-2" size={18} />
              </Button>
            </a>
            <a href={getKeycloakRegisterUrl()}>
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary px-8 text-base font-semibold">
                Create Account
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              A complete financial platform built for security, speed, and simplicity.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:bg-card/60 hover:glow-cyan-sm"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Architecture - About Section */}
      <section id="about" className="relative px-6 py-24 bg-primary/5">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Technical Architecture
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Built with cutting-edge technology for maximum performance and scalability.
              <br />
              <span className="mt-2 block font-medium text-primary">Architected by Viraj</span>
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Backend */}
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 transition-all hover:border-primary/40">
              <h3 className="mb-4 text-xl font-semibold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Zap size={20} />
                </div>
                High-Performance Backend
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span><strong>Java 21 (LTS)</strong> core for stability and speed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span><strong>Spring Boot 3.5.9</strong> framework.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span><strong>Virtual Threads (Project Loom)</strong> enabled for handling thousands of concurrent requests effortlessly.</span>
                </li>
              </ul>
            </div>

            {/* Frontend */}
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 transition-all hover:border-primary/40">
              <h3 className="mb-4 text-xl font-semibold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                  <Globe size={20} />
                </div>
                Modern Frontend
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-pink-400" />
                  <span><strong>React 18 + Vite</strong> for lightning-fast UI.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-pink-400" />
                  <span><strong>Tailwind CSS + Shadcn UI</strong> for premium aesthetics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-pink-400" />
                  <span><strong>TypeScript</strong> for robust type safety.</span>
                </li>
              </ul>
            </div>

            {/* AI & Data */}
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 transition-all hover:border-primary/40">
              <h3 className="mb-4 text-xl font-semibold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <CreditCard size={20} />
                </div>
                AI & Market Data
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span><strong>Google Gemini 2.5 AI</strong> integration for smart financial insights.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span><strong>CoinGecko API</strong> for real-time crypto market data.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span><strong>Redis Caching</strong> to prevent rate limits.</span>
                </li>
              </ul>
            </div>

            {/* Security */}
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 transition-all hover:border-primary/40">
              <h3 className="mb-4 text-xl font-semibold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                  <Shield size={20} />
                </div>
                Enterprise Security
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-400" />
                  <span><strong>Keycloak</strong> Identity Management (OIDC/OAuth2).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-400" />
                  <span><strong>Role-Based Access Control (RBAC)</strong> for User/Admin separation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-400" />
                  <span><strong>JWT Validation</strong> on every request.</span>
                </li>
              </ul>
            </div>

            {/* Admin Module */}
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 transition-all hover:border-primary/40 md:col-span-2 lg:col-span-2">
              <h3 className="mb-4 text-xl font-semibold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                  <Users size={20} />
                </div>
                Comprehensive Admin System
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                    <span><strong>User Management:</strong> View, Ban, Unban users.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                    <span><strong>Start/Stop Trading:</strong> Global emergency controls.</span>
                  </li>
                </ul>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                    <span><strong>Audit Logs:</strong> Track every admin action (PDF/CSV Export).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                    <span><strong>Fraud Detection:</strong> Manual review and flagging of suspicious transactions.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-primary/20 bg-primary/5 p-12 text-center backdrop-blur-sm">
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground">
            Ready to Take Control?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Join VaultCore and experience secure, modern financial management.
          </p>
          <a href={getKeycloakRegisterUrl()}>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan px-10 text-base font-semibold">
              Open Your Account <ArrowRight className="ml-2" size={18} />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 glass px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © VaultCore {new Date().getFullYear()}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
