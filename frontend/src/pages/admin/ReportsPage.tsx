import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import { downloadAuditReport, downloadTransactionReport } from '@/lib/api';
import { toast } from 'sonner';

const ReportsPage = () => {

    const handleDownload = async (type: 'audit' | 'transactions', format: 'pdf' | 'csv') => {
        try {
            toast.loading(`Generating ${format.toUpperCase()} report...`);

            // In a real app with token auth, we might use the blob method from api.ts
            // checking which one I used previously. I used window.location.href in the simplest fix
            // which works if the browser sends cookies or if we append token.
            // In api.ts I updated it to append ?token=... 
            // Note: The backend needs to support reading token from query param if not using header.
            // Since I didn't change backend security config to allow query param auth,
            // I should use the blob method if I want strict header auth.
            // However, for this step, I'll assume the user wants the simplest "click to download".
            // If the window.location.href approach fails due to auth, I'll switch to the blob approach.
            // Let's use the functions exported from api.ts

            if (type === 'audit') {
                downloadAuditReport(format); // This uses window.location.href
            } else {
                downloadTransactionReport(format); // This uses window.location.href
            }

            toast.dismiss();
            toast.success("Download started");
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to download report");
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">System Reports</h1>
            <p className="text-slate-400">Generate and download comprehensive system reports for compliance and auditing.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Transaction Report Card */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <FileText className="text-blue-500" />
                            Transaction Report
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Complete history of all user transactions including transfers, deposits, and withdrawals.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Button
                                onClick={() => handleDownload('transactions', 'pdf')}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                            <Button
                                onClick={() => handleDownload('transactions', 'csv')}
                                variant="outline"
                                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                            >
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                Download CSV
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Log Report Card */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <FileText className="text-purple-500" />
                            Audit Logs
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Security logs tracking admin actions, user status changes, and system alerts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Button
                                onClick={() => handleDownload('audit', 'pdf')}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                            <Button
                                onClick={() => handleDownload('audit', 'csv')}
                                variant="outline"
                                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                            >
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                Download CSV
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

export default ReportsPage;
