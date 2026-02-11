import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Line } from "@ant-design/plots";
import {
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Loader2,
    Wallet,
    Briefcase,
    History,
    RefreshCw,
    Plus,
    Minus,
    Star,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    getTop50Coins,
    getTopGainers,
    getTopLosers,
    getCoinDetails,
    getMarketChart,
    getPortfolio,
    buyStock,
    sellStock,
    getTradeHistory,
    getWallet,
    deposit,
    withdraw,
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    MarketCoinDto,
    MarketCoinDetailDto,
    PortfolioResponseDto,
    StockTrade,
    WalletResponse,
    WatchlistDto
} from "@/lib/api";

const Stocks = () => {
    // --- STATE ---
    const [selectedCoin, setSelectedCoin] = useState<MarketCoinDto | null>(null);
    const [coinDetails, setCoinDetails] = useState<MarketCoinDetailDto | null>(null);
    const [chartData, setChartData] = useState<{ time: Date, value: number }[]>([]);
    const [coins, setCoins] = useState<MarketCoinDto[]>([]);
    const [gainers, setGainers] = useState<MarketCoinDto[]>([]);
    const [losers, setLosers] = useState<MarketCoinDto[]>([]);
    const [portfolio, setPortfolio] = useState<PortfolioResponseDto | null>(null);
    const [trades, setTrades] = useState<StockTrade[]>([]);
    const [wallet, setWallet] = useState<WalletResponse | null>(null);
    const [watchlist, setWatchlist] = useState<WatchlistDto[]>([]);

    // Tabs Control
    const [activeTab, setActiveTab] = useState("chart");

    // Status
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [chartError, setChartError] = useState<string | null>(null);
    const isChartLoadingRef = useRef(false);
    const [refreshing, setRefreshing] = useState(false);

    // Chart Range (Default to 30 days)
    const [range, setRange] = useState("30");
    const ranges = [
        { label: "1D", value: "1" },
        { label: "1W", value: "7" },
        { label: "1M", value: "30" },
        { label: "1Y", value: "180" },
    ];

    // Dialogs
    const [isBuyOpen, setIsBuyOpen] = useState(false);
    const [isSellOpen, setIsSellOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    // Forms
    const [tradeQuantity, setTradeQuantity] = useState("");
    const [amount, setAmount] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // --- FETCHERS ---

    const fetchChart = useCallback(async (coinId: string, timeRange: string) => {
        // Prevent parallel chart requests
        if (isChartLoadingRef.current) return;

        isChartLoadingRef.current = true;
        setChartLoading(true);
        setChartError(null);

        try {
            const response = await getMarketChart(coinId, timeRange);

            // STRICT SAFETY CHECK: Ensure prices exists and is an array
            if (!response || !response.prices || !Array.isArray(response.prices)) {
                // If response is valid but empty (no prices), handle as empty
                if (response && (!response.prices || response.prices.length === 0)) {
                    setChartError("No chart data available");
                    setChartData([]);
                } else {
                    // Invalid structure
                    throw new Error("Invalid API response format");
                }
                return;
            }

            if (response.prices.length === 0) {
                setChartError("No chart data available");
                setChartData([]);
                return;
            }

            // Safe Transformation
            const formattedChart = response.prices.map((item: any) => {
                // Handle both array format [timestamp, price] (common in some APIs) 
                // OR object format { timestamp, price } (as defined in user prompt)
                let timestamp, price;

                if (Array.isArray(item)) {
                    [timestamp, price] = item;
                } else if (typeof item === 'object' && item !== null) {
                    timestamp = item.timestamp;
                    price = item.price;
                }

                return {
                    time: new Date(timestamp), // Convert ms to Date object
                    value: Number(price)
                };
            });

            setChartData(formattedChart);

        } catch (error: any) {
            console.error("Failed to fetch chart", error);
            if (error.message?.includes("429") || error.status === 429 || error.status === 503) {
                setChartError("Market data temporarily unavailable. Please try again later.");
            } else {
                setChartError("Failed to load chart data");
            }
            setChartData([]);
        } finally {
            setChartLoading(false);
            isChartLoadingRef.current = false;
        }
    }, []);

    const fetchCoinDetailsData = useCallback(async (coinId: string) => {
        try {
            const details = await getCoinDetails(coinId);
            setCoinDetails(details);
        } catch (error) {
            console.error("Failed to fetch coin details", error);
        }
    }, []);

    const fetchUserData = useCallback(async () => {
        try {
            const [port, hist, wal, watch] = await Promise.all([
                getPortfolio(),
                getTradeHistory(),
                getWallet(),
                getWatchlist()
            ]);
            setPortfolio(port);
            setTrades(hist);
            setWallet(wal);
            setWatchlist(watch);
        } catch (error) {
            console.error("Failed to fetch user data", error);
        }
    }, []);

    // --- EFFECTS ---

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                // Fetch all market lists in parallel
                const [allCoins, topGainers, topLosers] = await Promise.all([
                    getTop50Coins(), // Using Top50 as main list for now, or getMarketCoins() if desired
                    getTopGainers(),
                    getTopLosers()
                ]);

                setCoins(allCoins);
                setGainers(topGainers);
                setLosers(topLosers);

                if (allCoins.length > 0) {
                    setSelectedCoin(allCoins[0]);
                }

                // Fetch user data once on mount
                fetchUserData();
            } catch (error) {
                console.error("Failed to fetch market data", error);
                toast.error("Failed to load market data");
            } finally {
                setLoading(false);
            }
        };
        fetchMarketData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedCoin) {
            // Reset state for new coin
            setCoinDetails(null);
            setChartData([]);
            setChartError(null);
            setRange("30");
            setRefreshing(true);

            // OPTIMIZATION: Do not fetch UserData here. It's not dependent on the selected coin.
            // Only fetch chart and coin details.
            Promise.all([
                fetchCoinDetailsData(selectedCoin.id),
                fetchChart(selectedCoin.id, "30")
            ]).finally(() => {
                setRefreshing(false);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCoin]);

    // --- HANDLERS ---

    const handleRangeChange = (newRange: string) => {
        if (!selectedCoin) return;
        if (newRange === range) return;
        if (isChartLoadingRef.current) return;

        setRange(newRange);
        fetchChart(selectedCoin.id, newRange);
    };

    const handleRefresh = async () => {
        if (!selectedCoin) return;
        setRefreshing(true);
        try {
            await Promise.all([
                fetchCoinDetailsData(selectedCoin.id),
                fetchUserData(),
                fetchChart(selectedCoin.id, range)
            ]);
            toast.success("Data refreshed");
        } finally {
            setRefreshing(false);
        }
    };

    const handleBuy = async () => {
        if (!selectedCoin || !tradeQuantity) return;
        setActionLoading(true);
        try {
            const cost = parseFloat(tradeQuantity) * (selectedCoin.currentPrice || 0);
            await buyStock({ coinId: selectedCoin.id, amount: cost });
            toast.success(`Bought ${tradeQuantity} ${selectedCoin.symbol.toUpperCase()}`);
            setIsBuyOpen(false);
            setTradeQuantity("");
            fetchUserData();
        } catch (error: any) {
            toast.error(error.message || "Buy failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSell = async () => {
        if (!selectedCoin || !tradeQuantity) return;
        setActionLoading(true);
        try {
            await sellStock({ coinId: selectedCoin.id, quantity: parseFloat(tradeQuantity) });
            toast.success(`Sold ${tradeQuantity} ${selectedCoin.symbol.toUpperCase()}`);
            setIsSellOpen(false);
            setTradeQuantity("");
            fetchUserData();
        } catch (error: any) {
            toast.error(error.message || "Sell failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeposit = async () => {
        if (!amount) return;
        setActionLoading(true);
        try {
            await deposit(parseFloat(amount));
            toast.success(`Deposited $${amount}`);
            setIsDepositOpen(false);
            setAmount("");
            fetchUserData();
        } catch (error: any) {
            toast.error(error.message || "Deposit failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!amount) return;
        setActionLoading(true);
        try {
            await withdraw(parseFloat(amount));
            toast.success(`Withdrew $${amount}`);
            setIsWithdrawOpen(false);
            setAmount("");
            fetchUserData();
        } catch (error: any) {
            toast.error(error.message || "Withdraw failed");
        } finally {
            setActionLoading(false);
        }
    };

    const toggleWatchlist = async () => {
        if (!selectedCoin) return;
        const isWatched = watchlist.some(w => w.coinId === selectedCoin.id);

        try {
            if (isWatched) {
                await removeFromWatchlist(selectedCoin.id);
                toast.success(`Removed ${selectedCoin.symbol.toUpperCase()} from watchlist`);
            } else {
                await addToWatchlist(selectedCoin.id);
                toast.success(`Added ${selectedCoin.symbol.toUpperCase()} to watchlist`);
            }
            const updatedWatchlist = await getWatchlist();
            setWatchlist(updatedWatchlist);
        } catch (error) {
            toast.error("Failed to update watchlist");
        }
    };

    // --- CHART CONFIG ---
    // Ant Design Plots config
    const chartConfig = {
        data: chartData,
        xField: 'time',
        yField: 'value',
        xAxis: {
            type: 'time',
            mask: 'MMM DD', // Format nicely
            label: { style: { fill: 'rgba(255,255,255,0.45)' } },
            line: { style: { stroke: 'rgba(255,255,255,0.1)' } },
            tickCount: 6 // Reduce clutter
        },
        yAxis: {
            label: {
                formatter: (v: string) => `$${parseFloat(v).toLocaleString()}`,
                style: { fill: 'rgba(255,255,255,0.45)' }
            },
            grid: { line: { style: { stroke: 'rgba(255,255,255,0.05)' } } }
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: 'Price', value: `$${datum.value.toLocaleString()}` };
            },
        },
        // Styling matches "glass-strong" aesthetic
        color: 'hsl(199 89% 48%)',
        smooth: true,
        areaStyle: () => ({
            fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
            fillOpacity: 0.2
        }),
        // Make sure it fits container
        autoFit: true,
        height: 400
    };

    // --- RENDER HELPERS ---

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            </DashboardLayout>
        );
    }

    if (!selectedCoin) return null;

    const isPositive = (coinDetails?.priceChangePercentage24h ?? selectedCoin?.priceChangePercentage24h ?? 0) >= 0;
    const isWatched = watchlist.some(w => w.coinId === selectedCoin.id);

    // Improved Price Logic: Prefer coinDetails > 0Check, otherwise selectedCoin fallback
    const currentPrice = (coinDetails?.currentPrice && coinDetails.currentPrice > 0)
        ? coinDetails.currentPrice
        : (selectedCoin.currentPrice ?? 0);

    return (
        <DashboardLayout>
            <div className="space-y-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-950 to-purple-900 drop-shadow-sm">
                            Market Overview
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Live market data, portfolio management, and trading.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh Data
                    </Button>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/20 backdrop-blur-sm border border-white/10">
                                <TabsTrigger value="chart">Chart & Trade</TabsTrigger>
                                <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
                                <TabsTrigger value="history">Trade History</TabsTrigger>
                            </TabsList>

                            {/* --- TAB: CHART --- */}
                            <TabsContent value="chart" className="space-y-6">
                                <div className="glass-strong rounded-3xl p-6 relative overflow-hidden group min-h-[500px]">

                                    {/* Asset Info Header */}
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center">
                                                <img src={selectedCoin.image} alt={selectedCoin.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-3xl font-bold text-foreground">{selectedCoin.name}</h2>
                                                    <Button variant="ghost" size="icon" onClick={toggleWatchlist} className="hover:bg-transparent">
                                                        <Star className={`h-6 w-6 ${isWatched ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-2xl font-mono text-foreground">${currentPrice.toLocaleString()}</span>
                                                    <span className={`text-sm font-medium px-2 py-0.5 rounded-md flex items-center gap-1 ${isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                                                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                        {Math.abs(coinDetails?.priceChangePercentage24h ?? selectedCoin.priceChangePercentage24h).toFixed(2)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {ranges.map((r) => (
                                                <Button
                                                    key={r.value} variant={range === r.value ? "secondary" : "ghost"}
                                                    size="sm" onClick={() => handleRangeChange(r.value)} className="rounded-lg"
                                                >
                                                    {r.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chart Container */}
                                    <div className="h-[400px] w-full relative">
                                        {/* Loading State */}
                                        {chartLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center z-20 bg-background/50 backdrop-blur-sm rounded-xl">
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Loader2 className="animate-spin text-primary" size={32} />
                                                    <span>Loading chart data...</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Error State */}
                                        {chartError && !chartLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                                <div className="flex flex-col items-center gap-2 text-rose-500 p-4 text-center">
                                                    <AlertCircle size={32} />
                                                    <span className="font-medium">{chartError}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Chart Render - Ant Design Plots */}
                                        {!chartLoading && !chartError && chartData.length > 0 && (
                                            <div className="w-full h-full">
                                                <Line {...chartConfig} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Buy/Sell Buttons */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Button onClick={() => setIsBuyOpen(true)} className="h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                                        Buy {selectedCoin.name}
                                    </Button>
                                    <Button onClick={() => setIsSellOpen(true)} variant="destructive" className="h-14 text-lg shadow-lg shadow-destructive/20">
                                        Sell {selectedCoin.name}
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* --- TAB: PORTFOLIO --- */}
                            <TabsContent value="portfolio" className="space-y-4">
                                {portfolio && wallet ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Wallet Card */}
                                            <div className="glass-strong p-6 rounded-3xl relative overflow-hidden border border-white/10">
                                                <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={120} /></div>
                                                <div className="relative z-10">
                                                    <p className="text-muted-foreground font-medium mb-1">Wallet Balance</p>
                                                    <h2 className="text-4xl font-bold font-mono tracking-tight text-foreground">${wallet.balance.toLocaleString()}</h2>
                                                    <div className="flex gap-3 mt-6">
                                                        <Button onClick={() => setIsDepositOpen(true)} size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/10"><Plus size={16} className="mr-2" /> Deposit</Button>
                                                        <Button onClick={() => setIsWithdrawOpen(true)} size="sm" variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/5"><Minus size={16} className="mr-2" /> Withdraw</Button>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Portfolio Stats */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="glass-strong p-4 rounded-2xl border-l-4 border-indigo-500">
                                                    <p className="text-xs text-muted-foreground font-medium">Invested</p>
                                                    <p className="text-xl font-bold font-mono mt-1">${portfolio.totalInvested.toLocaleString()}</p>
                                                </div>
                                                <div className="glass-strong p-4 rounded-2xl border-l-4 border-purple-500">
                                                    <p className="text-xs text-muted-foreground font-medium">Value</p>
                                                    <p className="text-xl font-bold font-mono mt-1">${portfolio.currentValue.toLocaleString()}</p>
                                                </div>
                                                <div className="col-span-2 glass-strong p-4 rounded-2xl border-l-4 border-emerald-500 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground font-medium">Net P/L</p>
                                                        <p className={`text-xl font-bold font-mono ${portfolio.profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{portfolio.profitLoss >= 0 ? '+' : ''}{portfolio.profitLoss.toLocaleString()}</p>
                                                    </div>
                                                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${portfolio.profitLoss >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                        {portfolio.totalInvested > 0 ? ((portfolio.profitLoss / portfolio.totalInvested) * 100).toFixed(2) : '0.00'}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Holdings Table */}
                                        <div className="glass-strong rounded-3xl overflow-hidden mt-6">
                                            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                                                <Briefcase className="text-primary" size={20} /> <h3 className="font-semibold text-lg">Current Holdings</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-black/5 text-muted-foreground uppercase text-xs font-medium">
                                                        <tr>
                                                            <th className="px-6 py-4">Asset</th>
                                                            <th className="px-6 py-4 text-right">Avg Buy</th>
                                                            <th className="px-6 py-4 text-right">Current</th>
                                                            <th className="px-6 py-4 text-right">Qty</th>
                                                            <th className="px-6 py-4 text-right">Value</th>
                                                            <th className="px-6 py-4 text-right">P/L</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/10">
                                                        {portfolio.holdings.map((item) => (
                                                            <tr key={item.coinId} className="hover:bg-black/5 transition-colors">
                                                                <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-2">
                                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">{item.symbol ? item.symbol[0] : '?'}</div>
                                                                    {item.symbol || 'UNK'}
                                                                </td>
                                                                <td className="px-6 py-4 text-right font-mono text-muted-foreground">${item.avgBuyPrice.toLocaleString()}</td>
                                                                <td className="px-6 py-4 text-right font-mono">${item.currentPrice.toLocaleString()}</td>
                                                                <td className="px-6 py-4 text-right font-mono">{item.quantity}</td>
                                                                <td className="px-6 py-4 text-right font-mono font-medium">${item.currentValue.toLocaleString()}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className={`flex flex-col items-end ${item.profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                        <span className="font-bold">{item.profitLoss >= 0 ? '+' : ''}{item.profitLoss.toLocaleString()}</span>
                                                                        <span className="text-xs opacity-80">
                                                                            {item.investedValue > 0 ? ((item.profitLoss / item.investedValue) * 100).toFixed(2) : '0.00'}%
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>

                                                </table>
                                                {portfolio.holdings.length === 0 && (
                                                    <div className="flex flex-col items-center justify-center p-12 text-center">
                                                        <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                                                            <Briefcase size={32} className="text-muted-foreground" />
                                                        </div>
                                                        <h3 className="text-xl font-semibold mb-2">No holdings yet</h3>
                                                        <p className="text-muted-foreground max-w-sm mb-6">
                                                            Start trading to build your portfolio and track your crypto investments.
                                                        </p>
                                                        <Button
                                                            size="lg"
                                                            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                                                            onClick={() => setActiveTab("chart")}
                                                        >
                                                            Start Trading
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : <div className="p-8 text-center text-muted-foreground"><Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" /> Loading Portfolio...</div>}
                            </TabsContent>

                            {/* --- TAB: HISTORY --- */}
                            <TabsContent value="history">
                                <div className="glass-strong rounded-3xl overflow-hidden">
                                    <div className="p-6 border-b border-white/10 flex items-center gap-2">
                                        <History className="text-primary" size={20} /> <h3 className="text-lg font-semibold">Trade History</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-black/5 text-muted-foreground uppercase text-xs font-medium">
                                                <tr>
                                                    <th className="px-6 py-4">Date</th>
                                                    <th className="px-6 py-4">Type</th>
                                                    <th className="px-6 py-4">Asset</th>
                                                    <th className="px-6 py-4 text-right">Qty</th>
                                                    <th className="px-6 py-4 text-right">Price</th>
                                                    <th className="px-6 py-4 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {trades.map((trade, index) => (
                                                    <tr key={index} className="hover:bg-black/5 transition-colors">
                                                        <td className="px-6 py-4 text-muted-foreground">{new Date(trade.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${trade.tradeType === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{trade.tradeType}</span></td>
                                                        <td className="px-6 py-4 font-semibold">
                                                            {coins.find(c => c.id === trade.coinId)?.symbol.toUpperCase() || trade.coinId}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-mono">{trade.quantity}</td>
                                                        <td className="px-6 py-4 text-right font-mono text-muted-foreground">${trade.price.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right font-mono font-medium">${(trade.price * trade.quantity).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {trades.length === 0 && <div className="p-12 text-center text-muted-foreground">No trades yet.</div>}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* RIGHT COLUMN (1/3) - SIDEBAR */}
                    <div className="glass-strong rounded-3xl p-6 h-[800px] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Assets</h3>
                            <span className="text-xs text-muted-foreground">Top 50</span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {coins.map((coin) => {
                                const inWatchlist = watchlist.some(w => w.coinId === coin.id);
                                return (
                                    <div
                                        key={coin.id} onClick={() => setSelectedCoin(coin)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:bg-black/5 flex items-center justify-between ${selectedCoin.id === coin.id ? 'bg-primary/5 border-primary/20 shadow-sm' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={coin.image} alt={coin.symbol} className="h-8 w-8 rounded-full" />
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    <p className="font-medium text-foreground text-sm">{coin.name}</p>
                                                    {inWatchlist && <Star size={10} className="fill-yellow-400 text-yellow-400" />}
                                                </div>
                                                <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-sm font-medium">
                                                {coin.currentPrice != null ? `$${coin.currentPrice.toLocaleString()}` : "--"}
                                            </p>
                                            <p className={`text-[10px] ${coin.priceChangePercentage24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {coin.priceChangePercentage24h != null
                                                    ? `${coin.priceChangePercentage24h >= 0 ? '+' : ''}${coin.priceChangePercentage24h.toFixed(2)}%`
                                                    : "--"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- DIALOGS (Preserved) --- */}

                {/* BUY */}
                <Dialog open={isBuyOpen} onOpenChange={setIsBuyOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Buy {selectedCoin.name}</DialogTitle>
                            <DialogDescription>Price: ${currentPrice.toLocaleString()} | Wallet: ${wallet?.balance.toLocaleString()}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="buy-qty" className="text-right">Qty</Label>
                                <Input id="buy-qty" type="number" value={tradeQuantity} onChange={(e) => setTradeQuantity(e.target.value)} className="col-span-3" placeholder="0.00" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Total</Label>
                                <div className="col-span-3 font-mono font-bold">${(parseFloat(tradeQuantity || "0") * currentPrice).toLocaleString()}</div>
                            </div>
                        </div>
                        <DialogFooter><Button onClick={handleBuy} disabled={actionLoading}>Confirm Buy</Button></DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* SELL */}
                <Dialog open={isSellOpen} onOpenChange={setIsSellOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Sell {selectedCoin.name}</DialogTitle>
                            <DialogDescription>Price: ${currentPrice.toLocaleString()}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sell-qty" className="text-right">Qty</Label>
                                <Input id="sell-qty" type="number" value={tradeQuantity} onChange={(e) => setTradeQuantity(e.target.value)} className="col-span-3" placeholder="0.00" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Total</Label>
                                <div className="col-span-3 font-mono font-bold">${(parseFloat(tradeQuantity || "0") * currentPrice).toLocaleString()}</div>
                            </div>
                        </div>
                        <DialogFooter><Button onClick={handleSell} disabled={actionLoading} variant="destructive">Confirm Sell</Button></DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* DEPOSIT */}
                <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Deposit Funds</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount to deposit" />
                        </div>
                        <DialogFooter><Button onClick={handleDeposit} disabled={actionLoading}>Deposit</Button></DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* WITHDRAW */}
                <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Withdraw Funds</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount to withdraw" />
                        </div>
                        <DialogFooter><Button onClick={handleWithdraw} disabled={actionLoading}>Withdraw</Button></DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </DashboardLayout>
    );
};

export default Stocks;
