import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    getPortfolio,
    PortfolioResponseDto,
    PortfolioItemDto,
    MarketCoinDto
} from "@/lib/api";
import { Loader2, TrendingUp, TrendingDown, Wallet, Briefcase, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeHistory } from "@/components/market/TradeHistory";

const Portfolio = () => {
    const navigate = useNavigate();
    const [portfolio, setPortfolio] = useState<PortfolioResponseDto | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPortfolio = async () => {
        setLoading(true);
        try {
            const data = await getPortfolio();
            console.log("Portfolio Data:", data);
            setPortfolio(data);
        } catch (error) {
            console.error("Failed to fetch portfolio", error);
            toast.error("Failed to load portfolio");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const handleRowClick = (coinId: string) => {
        navigate(`/market/coin/${coinId}`);
    };

    // Helper to safely get percentage if not provided by backend
    const getProfitLossPercentage = (item: PortfolioItemDto) => {
        if (item.profitOrLossPercentage !== undefined) return item.profitOrLossPercentage;
        if (item.investedValue === 0) return 0;
        return (item.profitLoss / item.investedValue) * 100;
    };

    const getTotalProfitLossPercentage = (portfolio: PortfolioResponseDto) => {
        // Backend response might have it, API DTO definition was updated to possibly not have it if JSON structure in prompt didn't include it. 
        // Prompt JSON for response:
        // {
        //   holdings: [...],
        //   totalInvested: number,
        //   currentValue: number,
        //   profitLoss: number
        // }
        // It does NOT have percentage. I should calculate it.
        if (portfolio.totalInvested === 0) return 0;
        return (portfolio.profitLoss / portfolio.totalInvested) * 100;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-950 to-purple-900 drop-shadow-sm">
                        My Portfolio
                    </h1>
                    <p className="text-muted-foreground">
                        Track your crypto investments and performance.
                    </p>
                </div>

                {portfolio ? (
                    <>
                        {/* Summary Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SummaryCard
                                label="Total Invested"
                                value={`$${portfolio.totalInvested.toLocaleString()}`}
                                icon={Wallet}
                                colorClass="text-indigo-500"
                                bgClass="bg-indigo-500/10"
                            />
                            <SummaryCard
                                label="Current Value"
                                value={`$${portfolio.currentValue.toLocaleString()}`}
                                icon={Briefcase}
                                colorClass="text-purple-500"
                                bgClass="bg-purple-500/10"
                            />
                            <div className="glass-strong p-6 rounded-3xl border border-white/5 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 ${portfolio.profitLoss >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                    {portfolio.profitLoss >= 0 ? <TrendingUp size={80} /> : <TrendingDown size={80} />}
                                </div>
                                <div className="relative z-10">
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Net Profit / Loss</p>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className={`font-display text-3xl font-bold tracking-tight ${portfolio.profitLoss >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                            {portfolio.profitLoss >= 0 ? "+" : ""}${Math.abs(portfolio.profitLoss).toLocaleString()}
                                        </h2>
                                    </div>
                                    <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md text-sm font-medium ${portfolio.profitLoss >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                                        {portfolio.profitLoss >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        {Math.abs(getTotalProfitLossPercentage(portfolio)).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Areas */}
                        <div className="glass-strong rounded-3xl overflow-hidden border border-white/10 shadow-xl p-1">
                            <Tabs defaultValue="holdings" className="w-full">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/5">
                                    <TabsList className="bg-muted/20">
                                        <TabsTrigger value="holdings">Holdings</TabsTrigger>
                                        <TabsTrigger value="history">Trade History</TabsTrigger>
                                    </TabsList>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={fetchPortfolio}
                                        disabled={loading}
                                    >
                                        Refresh
                                    </Button>
                                </div>

                                <TabsContent value="holdings" className="m-0">
                                    {portfolio.holdings.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="hover:bg-transparent border-white/10">
                                                        <TableHead className="w-[180px]">Asset</TableHead>
                                                        <TableHead className="text-right">Quantity</TableHead>
                                                        <TableHead className="text-right">Avg Buy Price</TableHead>
                                                        <TableHead className="text-right">Current Price</TableHead>
                                                        <TableHead className="text-right">Invested Value</TableHead>
                                                        <TableHead className="text-right">Current Value</TableHead>
                                                        <TableHead className="text-right">Profit / Loss</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {portfolio.holdings.map((item) => (
                                                        <TableRow
                                                            key={item.coinId}
                                                            onClick={() => handleRowClick(item.coinId)}
                                                            className="cursor-pointer hover:bg-black/5 border-white/5 transition-colors group"
                                                        >
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-3">
                                                                    {/* We might not have image in PortfolioItemDto unless backend sends it. 
                                                                If not, we can show symbol or fetching is needed. 
                                                                Assuming name/symbol is present. 
                                                                The prompt says "Coin (use coinId for routing, display symbol/name)". 
                                                                Let's assume name/symbol are in DTO or mapped. 
                                                                I added name/symbol to DTO. */}
                                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                                        {item.symbol ? item.symbol.substring(0, 1) : "?"}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold">{item.name || item.coinId}</div>
                                                                        <div className="text-xs text-muted-foreground uppercase">{item.symbol || item.coinId}</div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono">{item.quantity.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-mono text-muted-foreground">${item.avgBuyPrice.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-mono">${item.currentPrice.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-mono text-muted-foreground">${item.investedValue.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-mono font-medium">${item.currentValue.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right">
                                                                <div className={`flex flex-col items-end ${item.profitLoss >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                                                    <span className="font-bold flex items-center gap-1">
                                                                        {item.profitLoss >= 0 ? "+" : ""}{item.profitLoss.toLocaleString()}
                                                                    </span>
                                                                    <span className="text-xs opacity-80">
                                                                        {getProfitLossPercentage(item).toFixed(2)}%
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-12 text-center">
                                            <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                                                <Briefcase size={32} className="text-muted-foreground" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">No holdings yet</h3>
                                            <p className="text-muted-foreground max-w-sm mb-6">
                                                Start trading to build your portfolio and track your crypto investments.
                                            </p>
                                            <Link to="/market">
                                                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan">
                                                    Start Trading
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="history" className="m-0">
                                    <TradeHistory />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <p className="text-destructive font-medium">Failed to load portfolio data.</p>
                        <Button variant="link" onClick={fetchPortfolio}>Try Again</Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

const SummaryCard = ({ label, value, icon: Icon, colorClass, bgClass }: any) => (
    <div className="glass-strong p-6 rounded-3xl border border-white/5 bg-card/40 backdrop-blur-xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
        <div className={`absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 ${colorClass}`}>
            <Icon size={80} />
        </div>
        <div className="relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${bgClass}`}>
                <Icon size={20} className={colorClass} />
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">{value}</h2>
        </div>
    </div>
);

export default Portfolio;
