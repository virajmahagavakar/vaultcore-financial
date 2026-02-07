import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, AlertCircle, ShieldCheck, Smartphone, Calendar } from "lucide-react";
import VaultLogo from "@/components/VaultLogo";

const CreateAccount = () => {
    const navigate = useNavigate();
    const [pin, setPin] = useState("");
    const [phone, setPhone] = useState("");
    const [age, setAge] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pin || !phone || !age) {
            setError("All fields are required.");
            return;
        }
        if (pin.length < 4) {
            setError("PIN must be at least 4 digits.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await apiFetch("/api/v1/account/create", {
                method: "POST",
                body: JSON.stringify({
                    pin,
                    phone,
                    age: parseInt(age, 10),
                }),
            });
            // Redirect to dashboard on success
            navigate("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center vault-gradient-bg p-4 relative overflow-hidden dark">
            {/* Background Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -z-10 delay-1000 animate-pulse-glow" />

            <div className="w-full max-w-lg space-y-8 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                        <VaultLogo />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold tracking-tight text-white drop-shadow-sm">
                            Setup Your Vault
                        </h2>
                        <p className="mt-2 text-base text-gray-400">
                            Secure your financial journey with a few details.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                    <div className="space-y-5">
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
                                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl hover:bg-white/10"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan rounded-xl transition-all active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 animate-spin" size={18} />
                                Creating Secure Box...
                            </>
                        ) : (
                            <>
                                Complete Setup <UserPlus className="ml-2" size={18} />
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CreateAccount;
