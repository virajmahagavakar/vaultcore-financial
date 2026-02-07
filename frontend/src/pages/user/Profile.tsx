import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch, getUserFromToken, getToken, AccountResponseDto } from "@/lib/api";
import { User, Mail, CreditCard, Bell, Edit2, CheckCircle2, AlertCircle, ShieldCheck, Smartphone, Calendar, UserPlus, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VaultLogo from "@/components/VaultLogo";

const Profile = () => {
  const token = getToken();
  const user = token ? getUserFromToken(token) : null;
  const [nickname, setNickname] = useState("");
  const [notification, setNotification] = useState("EMAIL");
  const [loading, setLoading] = useState(false);

  // Create Account State
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [accountDetails, setAccountDetails] = useState<AccountResponseDto | null>(null);

  useEffect(() => {
    apiFetch<AccountResponseDto>("/api/v1/account/me")
      .then((data) => {
        setAccountDetails(data);
        if (data.nickname) setNickname(data.nickname);
      })
      .catch(() => { });
  }, []);

  const updateNickname = async () => {
    setLoading(true);
    try {
      await apiFetch(`/api/v1/account/nickname?nickname=${encodeURIComponent(nickname)}`, { method: "PUT" });
      setMessage({ type: "success", text: "Nickname updated!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || !phone || !age) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }
    if (pin.length < 4) {
      setMessage({ type: "error", text: "PIN must be at least 4 digits." });
      return;
    }

    setCreateLoading(true);
    setMessage(null);

    try {
      await apiFetch("/api/v1/account/create", {
        method: "POST",
        body: JSON.stringify({
          pin,
          phone,
          age: parseInt(age, 10),
        }),
      });
      // Refresh account details
      const data = await apiFetch<AccountResponseDto>("/api/v1/account/me");
      setAccountDetails(data);
      if (data.nickname) setNickname(data.nickname);
      setMessage({ type: "success", text: "Account created successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to create account" });
    } finally {
      setCreateLoading(false);
    }
  };

  const updateNotificationPref = async (pref: string) => {
    setNotification(pref);
    try {
      // API call if exists
    } catch {
      // silent
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: "success", text: "Copied to clipboard!" });
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account information.</p>
        </div>

        {/* Create Account Form if no account details */}
        {!accountDetails ? (
          <div className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <VaultLogo />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-white">
                  Complete Your Profile
                </h2>
                <p className="text-sm text-gray-400">
                  Create your secure financial account to access all features.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-gray-300 font-medium ml-1">Security PIN</Label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="pin"
                      type="password"
                      placeholder="Create a 4-6 digit PIN"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      disabled={createLoading}
                      className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl hover:bg-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300 font-medium ml-1">Phone Number</Label>
                  <div className="relative group">
                    <Smartphone className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={createLoading}
                      className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl hover:bg-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-gray-300 font-medium ml-1">Age</Label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="age"
                      type="number"
                      placeholder="Your age"
                      min="18"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      disabled={createLoading}
                      className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl hover:bg-white/10"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan rounded-xl transition-all"
                disabled={createLoading}
              >
                {createLoading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={18} />
                    Creating...
                  </>
                ) : (
                  <>
                    Complete Setup <UserPlus className="ml-2" size={18} />
                  </>
                )}
              </Button>
            </form>
          </div>
        ) : (
          <>
            {/* User Info */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                  <User className="text-primary" size={28} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">{user?.name || "User"}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail size={14} /> {user?.email || "—"}
                  </p>
                </div>
              </div>

              {accountDetails && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-muted/50 p-4 relative group">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Account Number</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono font-medium text-foreground tracking-wider">
                        {accountDetails.accountNumber || accountDetails.id || "—"}
                      </p>
                      {(accountDetails.accountNumber || accountDetails.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-primary"
                          onClick={() => copyToClipboard((accountDetails.accountNumber || accountDetails.id) as string)}
                        >
                          <Copy size={12} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                    <p className="text-sm font-medium text-vault-success">{String(accountDetails.status || "ACTIVE")}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Nickname */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                <Edit2 size={16} /> Account Nickname
              </h3>
              <div className="flex gap-3">
                <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="My Account" />
                <Button onClick={updateNickname} disabled={loading}>Save</Button>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                <Bell size={16} /> Notification Preference
              </h3>
              <div className="flex gap-3">
                {["EMAIL", "SMS", "PUSH", "NONE"].map((pref) => (
                  <Button
                    key={pref}
                    size="sm"
                    variant={notification === pref ? "default" : "outline"}
                    onClick={() => updateNotificationPref(pref)}
                  >
                    {pref}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {message && (
          <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${message.type === "success" ? "bg-vault-success/10 text-vault-success" : "bg-destructive/10 text-destructive"
            }`}>
            {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
