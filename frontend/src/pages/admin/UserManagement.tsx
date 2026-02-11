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
import { getAllUsers, updateUserStatus, UserDto } from '@/lib/api';
import { toast } from 'sonner';
import { Ban, CheckCircle, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

const UserManagement = () => {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleStatusChange = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'BANNED' ? 'ACTIVE' : 'BANNED';
        try {
            await updateUserStatus(id, newStatus);
            toast.success(`User ${newStatus === 'BANNED' ? 'banned' : 'activated'} successfully`);
            fetchUsers(); // Refresh list
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.fullName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8 bg-slate-800 border-slate-700 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900/50">
                        <TableRow className="border-slate-700 hover:bg-slate-900/50">
                            <TableHead className="text-slate-400">Name</TableHead>
                            <TableHead className="text-slate-400">Email</TableHead>
                            <TableHead className="text-slate-400">Joined</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    Loading users...
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell className="font-medium text-white">{user.fullName}</TableCell>
                                    <TableCell className="text-slate-300">{user.email}</TableCell>
                                    <TableCell className="text-slate-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}
                                            className={user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleStatusChange(user.id, user.status)}
                                            className={user.status === 'BANNED'
                                                ? "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                                : "text-red-500 hover:text-red-400 hover:bg-red-500/10"}
                                        >
                                            {user.status === 'BANNED' ? (
                                                <><CheckCircle className="w-4 h-4 mr-2" /> Activate</>
                                            ) : (
                                                <><Ban className="w-4 h-4 mr-2" /> Ban User</>
                                            )}
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

export default UserManagement;
