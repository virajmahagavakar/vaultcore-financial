import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { ArrowLeftRight, ArrowUpRight, ArrowDownLeft, Filter, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatementDownload } from "@/components/StatementDownload";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = "/api/v1/transactions/recent";
      if (filterType !== "all" && filterType !== "date") {
        url = `/api/v1/transactions/filter/type?type=${filterType}`;
      } else if (filterType === "date" && dateFrom && dateTo) {
        url = `/api/v1/transactions/filter/date?from=${dateFrom}&to=${dateTo}`;
      }
      const data = await apiFetch<Transaction[]>(url);
      setTransactions(data);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Transactions</h1>
            <p className="text-sm text-muted-foreground">View and filter your transaction history.</p>
          </div>
          <StatementDownload />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter:</span>
          </div>
          <div className="flex gap-2">
            {["all", "DEBIT", "CREDIT"].map((type) => (
              <Button
                key={type}
                size="sm"
                variant={filterType === type ? "default" : "outline"}
                onClick={() => setFilterType(type)}
                className="text-xs"
              >
                {type === "all" ? "All" : type}
              </Button>
            ))}
            <Button
              size="sm"
              variant={filterType === "date" ? "default" : "outline"}
              onClick={() => setFilterType("date")}
              className="text-xs"
            >
              <Calendar size={14} className="mr-1" /> Date Range
            </Button>
          </div>
          {filterType === "date" && (
            <div className="flex items-center gap-2">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 text-xs" />
              <span className="text-muted-foreground text-xs">to</span>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 text-xs" />
            </div>
          )}
          <Button size="sm" onClick={fetchTransactions} className="ml-auto">
            <Search size={14} className="mr-1" /> Apply
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-4 gap-4 border-b border-border bg-muted/50 px-6 py-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</span>
          </div>

          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No transactions found.</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-lg p-1.5 ${tx.type === "CREDIT" ? "bg-vault-success/10" : "bg-destructive/10"}`}>
                      {tx.type === "CREDIT" ? <ArrowDownLeft size={14} className="text-vault-success" /> : <ArrowUpRight size={14} className="text-destructive" />}
                    </div>
                    <span className="text-sm font-medium text-foreground">{tx.type}</span>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === "CREDIT" ? "text-vault-success" : "text-destructive"}`}>
                    {tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium w-fit ${tx.status === "SUCCESS" ? "bg-vault-success/10 text-vault-success" :
                    tx.status === "PENDING" ? "bg-vault-warning/10 text-vault-warning" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                    {tx.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
