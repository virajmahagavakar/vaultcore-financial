import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    getMarketCoins,
    getTopGainers,
    getTopLosers,
    MarketCoinDto,
    getWatchlist,
    WatchlistDto
} from "@/lib/api";
import { Loader2, TrendingUp, TrendingDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { WatchlistButton } from "@/components/market/WatchlistButton";

const MarketHome = () => {
    const navigate = useNavigate(); // Hook for navigation
    const [coins, setCoins] = useState<MarketCoinDto[]>([]);
    const [filteredCoins, setFilteredCoins] = useState<MarketCoinDto[]>([]);
    const [topGainers, setTopGainers] = useState<MarketCoinDto[]>([]);
    const [topLosers, setTopLosers] = useState<MarketCoinDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [allCoinsData, topGainersData, topLosersData, watchlistData] = await Promise.all([
                    getMarketCoins(),
                    getTopGainers(),
                    getTopLosers(),
                    getWatchlist()
                ]);
                setCoins(allCoinsData);
                setFilteredCoins(allCoinsData);
                setTopGainers(topGainersData);
                setTopLosers(topLosersData);

                setWatchlistIds(new Set(watchlistData.map((w: WatchlistDto) => w.coinId)));
            } catch (error) {
                console.error("Failed to fetch market data", error);
                toast.error("Failed to load market data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const filtered = coins.filter(coin =>
            coin.name.toLowerCase().includes(search.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredCoins(filtered);
    }, [search, coins]);

    const handleRowClick = (id: string) => {
        const coin = coins.find(c => c.id === id);
        navigate(`/market/coin/${id}`, { state: { coin } });
    };

    const handleWatchlistToggle = (coinId: string, isWatched: boolean) => {
        setWatchlistIds(prev => {
            const newSet = new Set(prev);
            if (isWatched) newSet.add(coinId);
            else newSet.delete(coinId);
            return newSet;
        });
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
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold font-display tracking-tight mb-2">Market Overview</h1>
                    <p className="text-muted-foreground">Track the latest crypto prices and trends.</p>
                </div>

                {/* Top Movers Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gainers */}
                    <div className="glass-strong rounded-3xl p-6 border border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="font-semibold text-lg">Top Gainers</h3>
                        </div>
                        <div className="space-y-3">
                            {topGainers.map(coin => (
                                <Link
                                    to={`/market/coin/${coin.id}`}
                                    state={{ coin }}
                                    key={coin.id}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="font-bold">{coin.symbol.toUpperCase()}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {coin.currentPrice != null ? `$${coin.currentPrice.toLocaleString()}` : "--"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded text-sm">
                                        {coin.priceChangePercentage24h != null ? `+${coin.priceChangePercentage24h.toFixed(2)}%` : "--"}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Losers */}
                    <div className="glass-strong rounded-3xl p-6 border border-rose-500/20 bg-rose-500/5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-full bg-rose-500/10 text-rose-500">
                                <TrendingDown size={20} />
                            </div>
                            <h3 className="font-semibold text-lg">Top Losers</h3>
                        </div>
                        <div className="space-y-3">
                            {topLosers.map(coin => (
                                <Link
                                    to={`/market/coin/${coin.id}`}
                                    state={{ coin }}
                                    key={coin.id}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="font-bold">{coin.symbol.toUpperCase()}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {coin.currentPrice != null ? `$${coin.currentPrice.toLocaleString()}` : "--"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-rose-500 font-bold bg-rose-500/10 px-2 py-1 rounded text-sm">
                                        {coin.priceChangePercentage24h != null ? `${coin.priceChangePercentage24h.toFixed(2)}%` : "--"}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* All Coins Table */}
                <div className="glass-strong rounded-3xl overflow-hidden border border-white/10 shadow-xl">
                    <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5">
                        <h3 className="font-semibold text-xl">All Coins</h3>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search coins..."
                                className="pl-9 bg-black/20 border-white/10 focus:border-primary/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-white/10">
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>Coin</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">24h Change</TableHead>
                                    <TableHead className="text-right">Market Cap</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCoins.map((coin) => (
                                    <TableRow
                                        key={coin.id}
                                        onClick={() => handleRowClick(coin.id)}
                                        className="cursor-pointer hover:bg-black/5 border-white/5 transition-colors group"
                                    >
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <WatchlistButton
                                                coinId={coin.id}
                                                initialIsWatched={watchlistIds.has(coin.id)}
                                                onToggle={(state) => handleWatchlistToggle(coin.id, state)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium text-muted-foreground">#{coin.marketCapRank}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{coin.name}</span>
                                                    <span className="text-xs text-muted-foreground uppercase">{coin.symbol}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium">
                                            {coin.currentPrice != null ? `$${coin.currentPrice.toLocaleString()}` : "--"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${(coin.priceChangePercentage24h ?? 0) >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {coin.priceChangePercentage24h != null
                                                    ? `${coin.priceChangePercentage24h >= 0 ? '+' : ''}${coin.priceChangePercentage24h.toFixed(2)}%`
                                                    : "--"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-muted-foreground">
                                            {coin.marketCap != null ? `$${coin.marketCap.toLocaleString()}` : "--"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};


export default MarketHome;
