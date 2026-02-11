import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import PriceChart from "@/components/market/PriceChart";
import { getCoinDetails, MarketCoinDetailDto, getWatchlist, WatchlistDto } from "@/lib/api";
import { Loader2, ArrowLeft, ArrowUpRight, ArrowDownRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TradeDialog } from "@/components/market/TradeDialog";
import { WatchlistButton } from "@/components/market/WatchlistButton";

const CoinDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Use cached data from navigation state if available
    const [coin, setCoin] = useState<MarketCoinDetailDto | null>(() => {
        if (location.state?.coin) {
            // Map basic DTO to Detail DTO format for initial display
            const basic = location.state.coin;
            return {
                ...basic,
                description: "", // Missing in basic
                circulatingSupply: 0,
                totalSupply: 0,
                maxSupply: 0,
                ath: 0,
                atl: 0,
                lastUpdated: new Date().toISOString()
            } as MarketCoinDetailDto;
        }
        return null;
    });

    const [loading, setLoading] = useState(!coin); // Only load if no cached data
    const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
    const [isWatched, setIsWatched] = useState(false);

    const fetchCoinDetails = async () => {
        if (!id) return;
        try {
            const [coinData, watchlistData] = await Promise.all([
                getCoinDetails(id),
                getWatchlist()
            ]);
            setCoin(coinData);
            setIsWatched(watchlistData.some((w: WatchlistDto) => w.coinId === id));
        } catch (error) {
            console.warn("Failed to fetch details", error);
            // Don't show toast for 404s to avoid spamming user if they click a bad link
            if ((error as Error).message !== "Not Found") {
                toast.error("Failed to load coin details");
            }
        }
    };

    useEffect(() => {
        if (!coin) setLoading(true); // Show loader if no initial data
        fetchCoinDetails().finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            </DashboardLayout>
        );
    }

    if (!coin || !coin.id) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold">Coin Not Found</h2>
                        <p className="text-muted-foreground">
                            We couldn't find a coin with ID <span className="font-mono text-foreground">"{id}"</span>.
                        </p>
                    </div>
                    <Button onClick={() => navigate("/market")}>Back to Market</Button>
                </div>
            </DashboardLayout>
        );
    }

    console.log("CoinDetails: Rendering with coin:", coin);
    const isPositive = (coin.priceChangePercentage24h ?? 0) >= 0;

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/market")} className="rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                        <img
                            src={typeof coin.image === 'string' ? coin.image : (coin.image as any)?.large || (coin.image as any)?.small || ''}
                            alt={coin.name}
                            className="h-12 w-12 rounded-full object-contain"
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold font-display tracking-tight">{coin.name}</h1>
                                <WatchlistButton coinId={coin.id} initialIsWatched={isWatched} />
                            </div>
                            <span className="text-muted-foreground uppercase font-medium">{coin.symbol}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {Math.abs(coin.priceChangePercentage24h).toFixed(2)}%
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="text-right mr-4 hidden md:block">
                            <p className="text-3xl font-mono font-bold">${(coin.currentPrice ?? 0).toLocaleString()}</p>
                        </div>
                        <Button onClick={() => setTradeDialogOpen(true)} className="flex-1 md:flex-none bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-bold px-8">
                            Trade {coin.symbol.toUpperCase()}
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-strong rounded-3xl p-6 min-h-[500px]">
                            <div className="mb-4 flex justify-between items-center md:hidden">
                                <p className="text-3xl font-mono font-bold">${(coin.currentPrice ?? 0).toLocaleString()}</p>
                            </div>
                            <PriceChart coinId={coin.id} />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard label="Market Cap" value={`$${(coin.marketCap ?? 0).toLocaleString()}`} />
                            <StatCard label="Volume (24h)" value={`$${(coin.totalVolume ?? 0).toLocaleString()}`} />
                            <StatCard label="Circulating Supply" value={`${(coin.circulatingSupply ?? 0).toLocaleString()} ${coin.symbol.toUpperCase()}`} />
                            <StatCard label="All Time High" value={`$${(coin.ath ?? 0).toLocaleString()}`} />
                        </div>

                        {/* Description */}
                        <div className="glass-strong rounded-3xl p-8">
                            <h3 className="text-xl font-bold mb-4">About {coin.name}</h3>
                            <div
                                className="prose prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: coin.description }}
                            />
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="glass-strong rounded-3xl p-6 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Globe size={18} /> Market Stats</h3>
                            <div className="space-y-3">
                                <StatRow label="Low 24h" value={`$${(coin.low24h ?? 0).toLocaleString()}`} />
                                <StatRow label="High 24h" value={`$${(coin.high24h ?? 0).toLocaleString()}`} />
                                <StatRow label="Total Supply" value={coin.totalSupply?.toLocaleString()} />
                                <StatRow label="Max Supply" value={coin.maxSupply?.toLocaleString() ?? "∞"} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TradeDialog
                isOpen={tradeDialogOpen}
                onOpenChange={setTradeDialogOpen}
                coinId={coin.id}
                coinName={coin.name}
                currentPrice={coin.currentPrice}
                onSuccess={() => {
                    fetchCoinDetails();
                }}
            />
        </DashboardLayout>
    );
};

const StatCard = ({ label, value }: { label: string, value: string }) => (
    <div className="glass-strong p-4 rounded-2xl border border-white/5 bg-card/40 backdrop-blur-md">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="font-mono font-bold text-sm md:text-base text-foreground truncate" title={value}>{value}</p>
    </div>
);

const StatRow = ({ label, value }: { label: string, value?: string | number }) => (
    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className="font-mono font-medium">{value ?? "N/A"}</span>
    </div>
);

export default CoinDetails;
