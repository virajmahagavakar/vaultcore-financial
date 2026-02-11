import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { apiFetch, getUserFromToken, getToken, AccountResponseDto } from "@/lib/api";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);
  const [totalDebit, setTotalDebit] = useState<number | null>(null);
  const [totalCredit, setTotalCredit] = useState<number | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const token = getToken();
  const user = token ? getUserFromToken(token) : null;
  const [nickname, setNickname] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountData, debit, credit, transactions] = await Promise.all([
          apiFetch<AccountResponseDto>("/api/v1/account/me").catch(() => null),
          apiFetch<number>("/api/v1/account/statements/total-debit").catch(() => 0),
          apiFetch<number>("/api/v1/account/statements/total-credit").catch(() => 0),
          apiFetch<Transaction[]>("/api/v1/transactions/recent").catch(() => []),
        ]);

        if (accountData) {
          setBalance(accountData.balance);
          setNickname(accountData.nickname);
        }
        setTotalDebit(debit);
        setTotalCredit(credit);
        setRecentTx(transactions);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  const stats = [
    {
      label: "Total Balance",
      value: formatCurrency(balance),
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Credit",
      value: formatCurrency(totalCredit),
      icon: TrendingUp,
      color: "text-vault-success",
      bgColor: "bg-vault-success/10",
    },
    {
      label: "Total Debit",
      value: formatCurrency(totalDebit),
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Transactions",
      value: recentTx.length.toString(),
      icon: ArrowLeftRight,
      color: "text-vault-warning",
      bgColor: "bg-vault-warning/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome back{nickname ? `, ${nickname}` : (user?.name ? `, ${user.name}` : "")}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's your financial overview.
          </p>

          {balance === null && !loading && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Account Setup Required</h3>
                <p className="text-sm text-muted-foreground">Complete your profile to unlock all features.</p>
              </div>
              <Button onClick={() => navigate("/dashboard/profile")} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan">
                Complete Setup
              </Button>
            </div>
          )}
        </div>

        {/* Stock Market Banner */}
        <div
          onClick={() => navigate('/dashboard/stocks')}
          className="cursor-pointer group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/20 hover:scale-[1.01]"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-purple-950/80 to-indigo-900/50" />
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-indigo-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 backdrop-blur-md">
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                Live Market Status
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-white drop-shadow-lg">
                Market is <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Bullish</span>
              </h2>
              <p className="text-indigo-100/80 text-base">
                Global markets are showing strong momentum. Tech and Crypto sectors are up by <span className="text-emerald-400 font-semibold">+1.2%</span> today.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Button onClick={() => navigate('/dashboard/portfolio')} size="sm" className="bg-white text-indigo-950 hover:bg-white/90 border-0 font-medium">
                  View Portfolio <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={() => navigate('/market')} size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10 font-medium">
                  Market <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Floating Chart Graphic (Decorative) */}
            <div className="hidden lg:block relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-xl animate-pulse" />
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <TrendingUp className="text-indigo-400" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">BTC/USD</p>
                    <p className="text-xs text-emerald-400">+2.5%</p>
                  </div>
                </div>
                <div className="h-16 w-40 flex items-end gap-1">
                  {[40, 60, 45, 70, 65, 80, 75, 90].map((h, i) => (
                    <div key={i} className="w-full bg-indigo-500/40 rounded-t-sm hover:bg-indigo-400/60 transition-colors" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative rounded-3xl border border-white/5 bg-card/40 backdrop-blur-xl p-5 transition-all duration-300 hover:bg-card/60 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className={`rounded-xl ${stat.bgColor} p-2.5 transition-colors group-hover:bg-primary/20`}>
                  <stat.icon className={stat.color} size={20} />
                </div>
                {stat.label === "Total Balance" && (
                  <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-500">
                    Live
                  </div>
                )}
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <p className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
                  {loading ? (
                    <span className="animate-pulse h-8 w-24 bg-white/10 rounded block" />
                  ) : stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-muted-foreground" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recent Transactions
              </h2>
            </div>
          </div>

          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
            ) : recentTx.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No transactions yet. Start by making a transfer.
              </div>
            ) : (
              recentTx.slice(0, 8).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${tx.type === "CREDIT" ? "bg-vault-success/10" : "bg-destructive/10"}`}>
                      {tx.type === "CREDIT" ? (
                        <ArrowDownLeft size={16} className="text-vault-success" />
                      ) : (
                        <ArrowUpRight size={16} className="text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tx.type === "CREDIT" ? "Credit" : "Debit"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === "CREDIT" ? "text-vault-success" : "text-destructive"}`}>
                      {tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{tx.status?.toLowerCase()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
