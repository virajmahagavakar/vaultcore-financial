import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buyStock, sellStock, getWallet, getPortfolio } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface TradeDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    coinId: string;
    coinName: string;
    currentPrice: number;
    onSuccess?: () => void;
}

export function TradeDialog({
    isOpen,
    onOpenChange,
    coinId,
    coinName,
    currentPrice,
    onSuccess,
}: TradeDialogProps) {
    const [activeTab, setActiveTab] = useState("buy");
    const [amount, setAmount] = useState(""); // For buying (currency)
    const [quantity, setQuantity] = useState(""); // For selling (units)
    const [loading, setLoading] = useState(false);

    // Context Data
    const [balance, setBalance] = useState<number | null>(null);
    const [ownedQuantity, setOwnedQuantity] = useState<number>(0);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setAmount("");
            setQuantity("");
            setLoading(false);
            fetchContextData();
        }
    }, [isOpen, coinId]);

    const fetchContextData = async () => {
        try {
            const [walletData, portfolioData] = await Promise.all([
                getWallet(),
                getPortfolio()
            ]);
            setBalance(walletData.balance);
            const holding = portfolioData.holdings.find(h => h.coinId === coinId);
            setOwnedQuantity(holding ? holding.quantity : 0);
        } catch (error) {
            console.error("Failed to fetch trade context", error);
        }
    };

    const handleBuy = async () => {
        const amountVal = parseFloat(amount);
        if (isNaN(amountVal) || amountVal <= 0) {
            toast.error("Please enter a valid amount greater than 0");
            return;
        }
        // Backend handles BigDecimal, frontend sends number.
        // No quantity calc here for API, only for display.

        if (balance !== null && amountVal > balance) {
            toast.error("Insufficient wallet balance");
            return;
        }

        setLoading(true);
        try {
            const response = await buyStock({ coinId, amount: amountVal });
            toast.success(response.message || `Successfully bought ${coinName}`);
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "Buy failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSell = async () => {
        const qtyVal = parseInt(quantity, 10); // STRICT INTEGER
        if (isNaN(qtyVal) || qtyVal <= 0) {
            toast.error("Please enter a valid integer quantity greater than 0");
            return;
        }
        if (parseFloat(quantity) !== qtyVal) { // Check if user entered decimals
            toast.error("Quantity must be a whole number for selling");
            return;
        }

        if (qtyVal > ownedQuantity) {
            toast.error(`Insufficient holdings. You own ${ownedQuantity} ${coinName}`);
            return;
        }

        setLoading(true);
        try {
            const response = await sellStock({ coinId, quantity: qtyVal }); // Sending int
            toast.success(response.message || `Successfully sold ${coinName}`);
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "Sell failed");
        } finally {
            setLoading(false);
        }
    };

    const estimatedBuyQty = amount && currentPrice ? parseFloat(amount) / currentPrice : 0;
    const estimatedSellTotal = quantity && currentPrice ? parseFloat(quantity) * currentPrice : 0;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Trade {coinName}</DialogTitle>
                    <DialogDescription>
                        Current Price: <span className="font-mono text-foreground">${currentPrice.toLocaleString()}</span>
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="buy" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="buy" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Buy</TabsTrigger>
                        <TabsTrigger value="sell" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">Sell</TabsTrigger>
                    </TabsList>

                    {/* BUY TAB */}
                    <TabsContent value="buy">
                        <div className="space-y-4 py-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Available Balance:</span>
                                <span className="font-mono font-medium">${balance?.toLocaleString() ?? "Loading..."}</span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount to Invest ($)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>

                            <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Est. Quantity:</span>
                                    <span className="font-mono">{estimatedBuyQty.toFixed(8)} {coinName}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleBuy}
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                Confirm Buy
                            </Button>
                        </div>
                    </TabsContent>

                    {/* SELL TAB */}
                    <TabsContent value="sell">
                        <div className="space-y-4 py-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Available to Sell:</span>
                                <span className="font-mono font-medium">{ownedQuantity} {coinName}</span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity to Sell</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    placeholder="0"
                                    step="1" // HTML constraint for integer
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-primary"
                                        onClick={() => setQuantity(ownedQuantity.toString())}
                                    >
                                        Max
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Est. Total:</span>
                                    <span className="font-mono font-bold">${estimatedSellTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleSell}
                                disabled={loading}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                Confirm Sell
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>

            </DialogContent>
        </Dialog>
    );
}
