import { useState, useEffect } from "react";
import { getTradeHistory, StockTrade } from "@/lib/api";
import { Loader2, ArrowUpRight, ArrowDownRight, History } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function TradeHistory() {
    const [trades, setTrades] = useState<StockTrade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getTradeHistory();
                setTrades(data);
            } catch (error) {
                console.error("Failed to fetch trade history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
    }

    if (trades.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <History size={48} className="mb-4 opacity-50" />
                <p>No trading history found.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/10">
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {trades.map((trade, index) => (
                        <TableRow key={index} className="hover:bg-black/5 border-white/5 transition-colors">
                            <TableCell className="text-muted-foreground font-mono text-xs">
                                {new Date(trade.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded text-xs font-bold flex w-fit items-center gap-1 ${trade.tradeType === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {trade.tradeType === 'BUY' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                                    {trade.tradeType}
                                </span>
                            </TableCell>
                            <TableCell className="font-medium uppercase">{trade.coinId}</TableCell>
                            <TableCell className="text-right font-mono">{trade.quantity}</TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">${trade.price.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono font-medium">
                                ${(trade.price * trade.quantity).toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
