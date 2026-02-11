import React, { useState, useEffect } from 'react';
import { Line } from '@ant-design/plots';
import { Loader2, AlertCircle } from 'lucide-react';
import { getMarketChart } from '@/lib/api';

interface PriceChartProps {
    coinId: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ coinId }) => {
    const [data, setData] = useState<{ date: Date; value: number }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Use the shared API client which handles base URL, auth headers, and errors
                const response = await getMarketChart(coinId, "30"); // Default 30 days

                if (!isMounted) return;

                if (response && response.prices && Array.isArray(response.prices)) {
                    const formattedData = response.prices.map((item) => {
                        // Handle both array [ts, price] and object {timestamp, price} formats
                        let timestamp, price;
                        if (Array.isArray(item)) {
                            [timestamp, price] = item;
                        } else {
                            // Assuming object format based on updated interface
                            timestamp = (item as any).timestamp;
                            price = (item as any).price;
                        }

                        return {
                            date: new Date(timestamp),
                            value: Number(price),
                        };
                    });
                    setData(formattedData);
                } else {
                    setData([]);
                }

            } catch (err: any) {
                if (isMounted) {
                    console.error("PriceChart fetch error:", err);
                    if (err.message && (err.message.includes("429") || err.message.includes("available"))) {
                        setError("Market data temporarily unavailable (Rate Limit)");
                    } else if (err.message && err.message.includes("HTML")) {
                        setError("Connection error (Invalid Response)");
                    } else {
                        setError(err.message || 'Failed to load chart');
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [coinId]);

    // Loading State
    if (loading) {
        return (
            <div className="flex h-[300px] w-full items-center justify-center bg-gray-50/5 rounded-lg border border-white/5">
                <Loader2 className="animate-spin text-primary" size={24} />
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex h-[300px] w-full flex-col items-center justify-center bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-500">
                <AlertCircle className="mb-2" size={24} />
                <p className="text-sm font-medium">{error}</p>
            </div>
        );
    }

    // Empty State
    if (data.length === 0) {
        return (
            <div className="flex h-[300px] w-full items-center justify-center bg-gray-50/5 rounded-lg border border-white/5 text-muted-foreground">
                No chart data available
            </div>
        );
    }

    // Chart Configuration
    const config = {
        data,
        xField: 'date',
        yField: 'value',
        xAxis: {
            type: 'time',
            mask: 'MMM DD',
            label: {
                style: { fill: 'rgba(255,255,255,0.45)' },
            },
            line: { style: { stroke: 'rgba(255,255,255,0.1)' } },
        },
        yAxis: {
            label: {
                formatter: (v: string) => `$${parseFloat(v).toLocaleString()}`,
                style: { fill: 'rgba(255,255,255,0.45)' },
            },
            grid: { line: { style: { stroke: 'rgba(255,255,255,0.05)' } } },
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: 'Price', value: `$${datum.value.toLocaleString()}` };
            },
        },
        smooth: true,
        color: '#6366f1', // Indigo-500 matches the theme roughly
        areaStyle: () => {
            return {
                fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
            };
        },
    };

    return (
        <div className="w-full h-[400px]">
            <Line {...config} />
        </div>
    );
};

export default PriceChart;
