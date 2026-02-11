import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFlaggedTransactions, setTransactionFlag, TransactionDto } from '@/lib/api';
import { toast } from 'sonner';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

const SecurityPage = () => {
    const [flaggedTx, setFlaggedTx] = useState<TransactionDto[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFlagged = async () => {
        try {
            const data = await getFlaggedTransactions();
            setFlaggedTx(data);
        } catch (error) {
            toast.error("Failed to load flagged transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlagged();
    }, []);

    const handleResolve = async (id: string) => {
        try {
            await setTransactionFlag(id, false); // Set isFlagged = false
            toast.success("Flag resolved. Transaction marked as safe.");
            fetchFlagged(); // Refresh
        } catch (error) {
            toast.error("Failed to update flag status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Security & Fraud</h1>
                    <p className="text-slate-400 mt-1">Monitor high-risk transactions and security alerts.</p>
                </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex items-center gap-2">
                    <AlertTriangle className="text-orange-500 w-5 h-5" />
                    <h3 className="font-semibold text-white">Flagged Transactions (High Risk)</h3>
                </div>

                <Table>
                    <TableHeader className="bg-slate-900/50">
                        <TableRow className="border-slate-700 hover:bg-slate-900/50">
                            <TableHead className="text-slate-400">Date</TableHead>
                            <TableHead className="text-slate-400">User ID</TableHead>
                            <TableHead className="text-slate-400">Type</TableHead>
                            <TableHead className="text-slate-400">Amount</TableHead>
                            <TableHead className="text-slate-400">Reason</TableHead>
                            <TableHead className="text-right text-slate-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    Scanning transactions...
                                </TableCell>
                            </TableRow>
                        ) : flaggedTx.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <ShieldCheck className="w-12 h-12 text-emerald-500/20" />
                                        <p>No flagged transactions found. System is secure.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            flaggedTx.map((tx) => (
                                <TableRow key={tx.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell className="text-slate-300">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-400">
                                        {tx.keycloakUserId}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                                            {tx.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-white">
                                        ${tx.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                                            High Value
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleResolve(tx.id)}
                                            className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                        >
                                            <ShieldCheck className="w-4 h-4 mr-2" />
                                            Mark Safe
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default SecurityPage;
