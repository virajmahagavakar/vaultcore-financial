import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getWallet,
  deposit,
  withdraw,
  WalletResponse
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowRight, ArrowLeft, Wallet as WalletIcon, CreditCard, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const Transfer = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const fetchWallet = async () => {
    try {
      const data = await getWallet();
      setBalance(data.balance);
    } catch (error) {
      console.error("Failed to fetch wallet", error);
      toast.error("Failed to load wallet balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTransaction = async (type: 'deposit' | 'withdraw') => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (type === 'withdraw' && balance !== null && val > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setActionLoading(true);
    try {
      if (type === 'deposit') {
        await deposit(val);
        toast.success(`Successfully deposited $${val.toLocaleString()}`);
      } else {
        await withdraw(val);
        toast.success(`Successfully withdrew $${val.toLocaleString()}`);
      }
      setAmount("");
      await fetchWallet(); // Refresh balance
    } catch (error: any) {
      console.error(`${type} failed`, error);
      toast.error(error.message || `${type} failed`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-display tracking-tight mb-2">My Wallet</h1>
          <p className="text-muted-foreground">Manage your funds securely.</p>
        </div>

        {/* Balance Card */}
        <div className="glass-strong rounded-3xl p-8 border border-primary/20 bg-primary/5 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-primary">
            <WalletIcon size={120} />
          </div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Current Balance</p>
          <h2 className="text-5xl font-bold font-mono tracking-tight text-foreground">
            ${balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
          </h2>
        </div>

        {/* Transaction Tabs */}
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/20 backdrop-blur-sm border border-white/10 p-1 rounded-xl">
            <TabsTrigger value="deposit" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <ArrowRight className="w-4 h-4 mr-2 rotate-45" /> Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="rounded-lg data-[state=active]:bg-rose-500/10 data-[state=active]:text-rose-500">
              <ArrowRight className="w-4 h-4 mr-2 -rotate-45" /> Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit">
            <Card className="border-white/10 bg-black/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Deposit Funds</CardTitle>
                <CardDescription>Add funds to your wallet using your linked bank account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="deposit-amount"
                      placeholder="0.00"
                      className="pl-7 bg-black/20 border-white/10"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-yellow-500/80 mt-2">
                    Note: Money will be debited from your linked bank account.
                  </p>
                </div>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                  onClick={() => handleTransaction('deposit')}
                  disabled={actionLoading || !amount || parseFloat(amount) <= 0}
                >
                  {actionLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <CreditCard className="mr-2" size={16} />}
                  Deposit Funds
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw">
            <Card className="border-white/10 bg-black/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
                <CardDescription>Withdraw funds to your connected bank account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="withdraw-amount"
                      placeholder="0.00"
                      className="pl-7 bg-black/20 border-white/10"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {balance !== null && (
                    <p className="text-xs text-muted-foreground text-right">
                      Available: ${balance.toLocaleString()}
                    </p>
                  )}
                </div>
                <Button
                  className="w-full bg-destructive/80 text-white hover:bg-destructive glow-rose"
                  onClick={() => setWithdrawDialogOpen(true)}
                  disabled={actionLoading || !amount || parseFloat(amount) <= 0 || (balance !== null && parseFloat(amount) > balance)}
                >
                  {actionLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Landmark className="mr-2" size={16} />}
                  Withdraw Funds
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Withdrawal</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw <span className="font-bold text-foreground">${parseFloat(amount || "0").toLocaleString()}</span> to your bank account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setWithdrawDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { setWithdrawDialogOpen(false); handleTransaction('withdraw'); }}>Confirm Withdraw</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Transfer;
