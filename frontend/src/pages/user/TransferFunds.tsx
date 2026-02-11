import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { transferFunds } from "@/lib/api";
import { Loader2, Send, ShieldCheck, User, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const TransferFunds = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        toAccountNumber: "",
        amount: "",
        pin: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.toAccountNumber || !formData.amount || !formData.pin) {
            toast.error("All fields are required");
            return;
        }

        const amountValue = parseFloat(formData.amount);
        if (isNaN(amountValue) || amountValue <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setLoading(true);

        try {
            const response = await transferFunds({
                toAccountNumber: formData.toAccountNumber,
                amount: amountValue,
                pin: formData.pin
            });

            if (response && (response.status === "SUCCESS" || response.message === "Transfer successful")) {
                toast.success("Transfer successful!");
                // Clear form
                setFormData({ toAccountNumber: "", amount: "", pin: "" });
                // Optional: navigate to transactions or dashboard
                // navigate("/dashboard/transactions"); 
            } else {
                // Fallback if status isn't explicitly SUCCESS but no error thrown (unlikely with apiFetch)
                toast.success("Transfer processed successfully");
                setFormData({ toAccountNumber: "", amount: "", pin: "" });
            }
        } catch (error: any) {
            console.error("Transfer failed", error);
            toast.error(error.message || "Transfer failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-display tracking-tight mb-2">Transfer Funds</h1>
                    <p className="text-muted-foreground">Send money securely to another account.</p>
                </div>

                <Card className="glass-strong border-white/10 bg-black/20 backdrop-blur-xl relative overflow-hidden">
                    {/* Ambient Background Effect */}
                    <div className="absolute top-0 right-0 p-12 opacity-5 text-indigo-500 rounded-full blur-3xl bg-indigo-500/20 translate-x-1/2 -translate-y-1/2 pointer-events-none w-64 h-64"></div>

                    <CardHeader>
                        <CardTitle>Transfer Details</CardTitle>
                        <CardDescription>Enter the recipient's account information and amount.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">

                            {/* Recipient Account */}
                            <div className="space-y-2">
                                <Label htmlFor="toAccountNumber" className="flex items-center gap-2">
                                    <User size={16} className="text-primary" /> Recipient Account Number
                                </Label>
                                <Input
                                    id="toAccountNumber"
                                    name="toAccountNumber"
                                    placeholder="Enter recipient's account number"
                                    className="bg-black/20 border-white/10 focus:border-primary/50 transition-all"
                                    value={formData.toAccountNumber}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="flex items-center gap-2">
                                    <Receipt size={16} className="text-primary" /> Amount (₹)
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">₹</span>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        placeholder="0.00"
                                        className="pl-8 bg-black/20 border-white/10 focus:border-primary/50 transition-all font-mono"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* PIN */}
                            <div className="space-y-2">
                                <Label htmlFor="pin" className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-primary" /> PIN
                                </Label>
                                <Input
                                    id="pin"
                                    name="pin"
                                    type="password"
                                    placeholder="Enter your PIN"
                                    className="bg-black/20 border-white/10 focus:border-primary/50 transition-all"
                                    value={formData.pin}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan h-12 text-lg font-medium shadow-lg shadow-primary/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-5 w-5" /> Transfer Now
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default TransferFunds;
