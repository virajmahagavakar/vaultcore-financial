import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import {
    Users,
    Activity,
    DollarSign,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { getAdminSummary, DashboardSummaryDto, getTradingStats, TradingStatsDto } from '@/lib/api';
import { toast } from 'sonner';

const AdminDashboard = () => {
    const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
    const [tradingStats, setTradingStats] = useState<TradingStatsDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryData, tradingData] = await Promise.all([
                    getAdminSummary(),
                    getTradingStats()
                ]);
                setSummary(summaryData);
                setTradingStats(tradingData);
            } catch (error) {
                toast.error("Failed to load dashboard data");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="text-white">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    System Operational
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Users"
                    value={summary?.totalUsers || 0}
                    icon={Users}
                    color="text-blue-500"
                    bgColor="bg-blue-500/10"
                />
                <MetricCard
                    title="Active Users"
                    value={summary?.activeUsers || 0}
                    icon={Activity}
                    color="text-emerald-500"
                    bgColor="bg-emerald-500/10"
                />
                <MetricCard
                    title="Total Transactions"
                    value={summary?.totalTransactions || 0}
                    icon={DollarSign}
                    color="text-yellow-500"
                    bgColor="bg-yellow-500/10"
                />
                <MetricCard
                    title="Banned Users"
                    value={summary?.bannedUsers || 0}
                    icon={AlertTriangle}
                    color="text-red-500"
                    bgColor="bg-red-500/10"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trading Vol Logic */}
                <Card className="p-6 bg-slate-800 border-slate-700">
                    <h3 className="text-slate-400 text-sm font-medium mb-4">24h Trading Volume</h3>
                    <div className="text-4xl font-bold text-white mb-2">
                        ${tradingStats?.totalVolume24h?.toLocaleString() || '0.00'}
                    </div>
                    <p className="text-slate-500 text-sm">Global volume across all users</p>
                </Card>

                {/* Top Stocks */}
                <Card className="p-6 bg-slate-800 border-slate-700">
                    <h3 className="text-slate-400 text-sm font-medium mb-4">Most Traded Assets (24h)</h3>
                    <div className="space-y-3">
                        {tradingStats?.topTradedStocks?.length ? (
                            tradingStats.topTradedStocks.map((stock, i) => (
                                <div key={stock.symbol} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                i === 1 ? 'bg-slate-500/20 text-slate-400' :
                                                    'bg-orange-500/20 text-orange-500'
                                            }`}>
                                            {i + 1}
                                        </span>
                                        <span className="text-white font-medium">{stock.symbol}</span>
                                    </div>
                                    <span className="text-slate-400 text-sm">{stock.tradeCount} trades</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm">No trading activity yet.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
    <Card className="p-6 bg-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-200">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
        </div>
    </Card>
);

export default AdminDashboard;
