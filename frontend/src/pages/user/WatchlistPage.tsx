import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    getWatchlist,
    WatchlistDto,
    removeFromWatchlist,
    getMarketCoins,
    MarketCoinDto
} from "@/lib/api";
import { Loader2, Star, Trash2, ArrowUpRight, ArrowDownRight, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const WatchlistPage = () => {
    const navigate = useNavigate();
    const [watchlist, setWatchlist] = useState<WatchlistDto[]>([]);
    const [allCoins, setAllCoins] = useState<MarketCoinDto[]>([]); // To enrich data
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [watchlistData, marketData] = await Promise.all([
                getWatchlist(),
                getMarketCoins()
            ]);
            setWatchlist(watchlistData);
            setAllCoins(marketData);
        } catch (error) {
            console.error("Failed to fetch watchlist", error);
            toast.error("Failed to load watchlist");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRemove = async (e: React.MouseEvent, coinId: string) => {
        e.stopPropagation();
        try {
            await removeFromWatchlist(coinId);
            toast.success("Removed from watchlist");
            setWatchlist(prev => prev.filter(item => item.coinId !== coinId));
        } catch (error) {
            toast.error("Failed to remove");
        }
    };

    const handleRowClick = (coinId: string) => {
        navigate(`/market/coin/${coinId}`);
    };

    // Helper to merge watchlist DTO with Market DTO for better display (name, image, symbol)
    const enrichedWatchlist = watchlist.map(item => {
        const marketCoin = allCoins.find(c => c.id === item.coinId);
        return {
            ...item,
            name: marketCoin?.name || item.coinId,
            symbol: marketCoin?.symbol || item.coinId,
            image: marketCoin?.image,
            change24h: marketCoin?.priceChangePercentage24h
        };
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display tracking-tight">My Watchlist</h1>
                        <p className="text-muted-foreground">Track your favorite assets</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                        <Loader2 size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
                    </Button>
                </div>

                <div className="glass-strong rounded-3xl overflow-hidden border border-white/10 shadow-xl p-1">
                    {loading ? (
                        <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
                    ) : watchlist.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-white/10">
                                        <TableHead>Asset</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">24h Change</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enrichedWatchlist.map((item) => (
                                        <TableRow
                                            key={item.coinId}
                                            onClick={() => handleRowClick(item.coinId)}
                                            className="cursor-pointer hover:bg-black/5 border-white/5 transition-colors group"
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="h-8 w-8 rounded-full" />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                            {item.symbol ? item.symbol.substring(0, 1) : "?"}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold">{item.name}</div>
                                                        <div className="text-xs text-muted-foreground uppercase">{item.symbol}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-medium">
                                                ${item.currentPrice.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.change24h !== undefined ? (
                                                    <span className={`flex items-center justify-end gap-1 text-sm font-medium ${item.change24h >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                                        {item.change24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                        {Math.abs(item.change24h).toFixed(2)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-rose-500/10 hover:text-rose-500"
                                                    onClick={(e) => handleRemove(e, item.coinId)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                                <Star size={32} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Watchlist is empty</h3>
                            <p className="text-muted-foreground max-w-sm mb-6">
                                Star your favorite coins on the market page to see them here.
                            </p>
                            <Link to="/market">
                                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan">
                                    Go to Market
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default WatchlistPage;
