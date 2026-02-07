import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Settings as SettingsIcon, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const [dailyLimit, setDailyLimit] = useState("");
  const [loading, setLoading] = useState(false);

  const updateDailyLimit = async () => {
    if (!dailyLimit) return;
    setLoading(true);
    try {
      await apiFetch(`/api/v1/account/daily-limit?limit=${dailyLimit}`, { method: "PUT" });
      toast.success("Daily limit updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your account preferences.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <DollarSign size={16} /> Daily Transaction Limit
          </h3>
          <p className="text-sm text-muted-foreground">Set the maximum amount you can transfer per day.</p>
          <div className="flex gap-3">
            <Input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              placeholder="e.g. 50000"
              min="0"
            />
            <Button onClick={updateDailyLimit} disabled={loading}>
              {loading ? "Saving..." : "Update"}
            </Button>
          </div>
        </div>


      </div>
    </DashboardLayout>
  );
};

export default Settings;
