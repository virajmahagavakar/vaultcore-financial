import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import {
    Users,
    LayoutDashboard,
    Activity,
    FileText,
    ShieldAlert,
    LogOut,
    ArrowLeft
} from 'lucide-react';

const AdminLayout: React.FC = () => {
    const { user, logout, hasRole, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!user || !hasRole('ADMIN')) {
        return <Navigate to="/" replace />;
    }

    const navItems = [
        { name: 'Overview', path: '/admin', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Trading', path: '/admin/trading', icon: Activity },
        { name: 'Reports', path: '/admin/reports', icon: FileText },
        { name: 'Fraud & Security', path: '/admin/security', icon: ShieldAlert },
    ];

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight">VaultCore</h1>
                    </div>
                    <p className="text-xs text-red-400 font-mono font-semibold tracking-wider ml-10">ADMIN CONSOLE</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-700 space-y-2">
                    <Link
                        to="/market"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Market</span>
                    </Link>

                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-white">
                        {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 font-bold border border-red-600/30">
                                A
                            </div>
                            <div className="text-sm">
                                <p className="text-white font-medium">Administrator</p>
                                <p className="text-slate-400 text-xs">Super User</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
