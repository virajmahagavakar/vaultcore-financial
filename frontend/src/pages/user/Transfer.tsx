import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Transfer = () => {
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toAccountNumber.trim() || !amount.trim() || !pin.trim()) {
      if (!toAccountNumber.trim() || !amount.trim() || !pin.trim()) {
        toast.error("All fields are required.");
        return;
      }
    }

    setLoading(true);

    try {
      await apiFetch("/api/v1/transactions/transfer", {
        method: "POST",
        body: JSON.stringify({
          toAccountNumber,
          amount: parseFloat(amount),
          pin,
        }),
      });
      toast.success("Transfer successful!");
      setToAccountNumber("");
      setAmount("");
      setPin("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Transfer Funds</h1>
          <p className="text-sm text-muted-foreground">Send money securely to another account.</p>
        </div>

        <form onSubmit={handleTransfer} className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="toAccount">Recipient Account Number</Label>
            <Input
              id="toAccount"
              placeholder="Enter recipient's account number"
              value={toAccountNumber}
              onChange={(e) => setToAccountNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">PIN</Label>
            <Input
              id="pin"
              type="password"
              placeholder="Enter your PIN"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <Send size={16} className="mr-2" />
            {loading ? "Processing..." : "Transfer Now"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Transfer;
