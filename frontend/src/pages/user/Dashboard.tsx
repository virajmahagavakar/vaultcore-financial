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

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/20"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`rounded-lg ${stat.bgColor} p-2`}>
                  <stat.icon className={stat.color} size={16} />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                {loading ? "..." : stat.value}
              </p>
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
