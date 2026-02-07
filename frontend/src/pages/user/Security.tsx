import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Shield, Lock, Key, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Security = () => {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [freezeLoading, setFreezeLoading] = useState(false);

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      toast.error("PINs do not match.");
      return;
    }
    if (newPin.length < 4) {
      toast.error("PIN must be at least 4 digits.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/api/v1/account/security/change-pin", {
        method: "PUT",
        body: JSON.stringify({
          oldPin,
          newPin,
        }),
      });
      toast.success("PIN changed successfully!");
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change PIN");
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async (freeze: boolean) => {
    setFreezeLoading(true);
    try {
      await apiFetch(`/api/v1/account/${freeze ? "freeze" : "unfreeze"}`, { method: "PUT" });
      toast.success(`Account ${freeze ? "frozen" : "unfrozen"} successfully.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setFreezeLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Security</h1>
          <p className="text-sm text-muted-foreground">Manage PIN and account security settings.</p>
        </div>

        {/* Change PIN */}
        <form onSubmit={handleChangePin} className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <Key size={16} /> Change PIN
          </h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Current PIN</Label>
              <Input type="password" value={oldPin} onChange={(e) => setOldPin(e.target.value)} maxLength={6} placeholder="••••" />
            </div>
            <div className="space-y-1.5">
              <Label>New PIN</Label>
              <Input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} maxLength={6} placeholder="••••" />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New PIN</Label>
              <Input type="password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} maxLength={6} placeholder="••••" />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            <Lock size={14} className="mr-2" />
            {loading ? "Updating..." : "Change PIN"}
          </Button>
        </form>

        {/* Freeze/Unfreeze */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <Shield size={16} /> Account Freeze
          </h3>
          <p className="text-sm text-muted-foreground">Temporarily freeze your account to prevent any transactions.</p>
          <div className="flex gap-3">
            <Button variant="destructive" onClick={() => handleFreeze(true)} disabled={freezeLoading}>
              Freeze Account
            </Button>
            <Button variant="outline" onClick={() => handleFreeze(false)} disabled={freezeLoading}>
              Unfreeze Account
            </Button>
          </div>
        </div>


      </div>
    </DashboardLayout>
  );
};

export default Security;
