import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
    coinId: string;
    className?: string;
    initialIsWatched?: boolean;
    onToggle?: (newState: boolean) => void;
}

export function WatchlistButton({ coinId, className, initialIsWatched, onToggle }: WatchlistButtonProps) {
    const [isWatched, setIsWatched] = useState(initialIsWatched || false);
    const [loading, setLoading] = useState(false);

    // If initialIsWatched is not provided, we might want to check status,
    // but to avoid N+1 requests, it's better if the parent provides it.
    // However, for single coin views, we can fetch.
    // For now, assume parent handles initial state or we default to false (and maybe sync later).

    useEffect(() => {
        if (initialIsWatched !== undefined) {
            setIsWatched(initialIsWatched);
        }
    }, [initialIsWatched]);

    const toggleWatchlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;

        // Optimistic Update
        const newState = !isWatched;
        setIsWatched(newState);
        setLoading(true);

        try {
            if (newState) {
                await addToWatchlist(coinId);
                toast.success("Added to watchlist");
            } else {
                await removeFromWatchlist(coinId);
                toast.success("Removed from watchlist");
            }
            onToggle?.(newState);
        } catch (error) {
            // Revert on failure
            setIsWatched(!newState);
            toast.error("Failed to update watchlist");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleWatchlist}
            className={cn("hover:bg-transparent hover:scale-110 transition-transform", className)}
            disabled={loading}
        >
            <Star
                size={20}
                className={cn(
                    "transition-colors",
                    isWatched ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                )}
            />
        </Button>
    );
}
