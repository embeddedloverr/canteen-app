'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Building2, Trash2, X, LogOut, UserCog, Shield } from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';

interface StaffUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'staff' | 'admin';
    canteenLocation?: string;
    isActive: boolean;
    createdAt: string;
}

const canteenLocations = ['1st Floor Canteen', '2nd Floor Canteen'];

export default function AdminStaffPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [users, setUsers] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'staff',
        canteenLocation: '1st Floor Canteen',
    });

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.role !== 'admin') {
            router.push('/staff');
        } else {
            fetchUsers();
        }
    }, [session, status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Failed to create account');
                return;
            }

            await fetchUsers();
            setIsModalOpen(false);
            setForm({
                name: '',
                email: '',
                password: '',
                phone: '',
                role: 'staff',
                canteenLocation: '1st Floor Canteen',
            });
        } catch (err) {
            setError('Failed to create account');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this account?')) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                await fetchUsers();
            }
        } catch (err) {
            console.error('Failed to delete user:', err);
        }
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    // Group users by role
    const admins = users.filter(u => u.role === 'admin');
    const staff = users.filter(u => u.role === 'staff');

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Staff Management</h1>
                            <p className="text-sm text-gray-400">Welcome, {session?.user?.name}</p>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => setIsModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Staff
                            </Button>
                            <Button variant="ghost" onClick={handleLogout}>
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Navigation */}
            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button variant="secondary" onClick={() => router.push('/admin/staff')}>
                        <Users className="w-4 h-4 mr-2" />
                        Staff
                    </Button>
                    <Button variant="ghost" onClick={() => router.push('/admin/tables')}>
                        <Building2 className="w-4 h-4 mr-2" />
                        Tables
                    </Button>
                    <Button variant="ghost" onClick={() => router.push('/admin/menu')}>
                        <UserCog className="w-4 h-4 mr-2" />
                        Menu
                    </Button>
                    <Button variant="ghost" onClick={() => router.push('/staff')}>
                        <Shield className="w-4 h-4 mr-2" />
                        Orders
                    </Button>
                </div>
            </div>

            {/* Users List */}
            <div className="max-w-6xl mx-auto px-4 py-2 space-y-8">
                {/* Admins Section */}
                {admins.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-purple-500" />
                            <h2 className="text-xl font-bold text-white">Administrators</h2>
                            <Badge variant="info">{admins.length}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {admins.map((user) => (
                                <Card key={user._id} className={`p-4 ${!user.isActive ? 'opacity-50' : ''}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{user.name}</h3>
                                            <p className="text-sm text-gray-400">{user.email}</p>
                                        </div>
                                        <Badge variant="info">Admin</Badge>
                                    </div>
                                    {user.phone && (
                                        <p className="text-sm text-gray-500 mb-2">{user.phone}</p>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Staff Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-orange-500" />
                        <h2 className="text-xl font-bold text-white">Staff Members</h2>
                        <Badge variant="info">{staff.length}</Badge>
                    </div>
                    {staff.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-xl font-bold text-white mb-2">No staff members yet</h3>
                            <p className="text-gray-400 mb-6">Add staff to manage canteen orders</p>
                            <Button onClick={() => setIsModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Staff
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {staff.map((user) => (
                                <Card key={user._id} className={`p-4 ${!user.isActive ? 'opacity-50' : ''}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{user.name}</h3>
                                            <p className="text-sm text-gray-400">{user.email}</p>
                                        </div>
                                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    {user.canteenLocation && (
                                        <div className="flex items-center gap-2 text-sm text-orange-400 mb-2">
                                            <Building2 className="w-4 h-4" />
                                            <span>{user.canteenLocation}</span>
                                        </div>
                                    )}
                                    {user.phone && (
                                        <p className="text-sm text-gray-500 mb-3">{user.phone}</p>
                                    )}
                                    {user.isActive && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(user._id)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Deactivate
                                        </Button>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Staff Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl"
                        >
                            <div className="border-b border-gray-800 p-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">Add New Staff</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <Input
                                    label="Name"
                                    placeholder="Full name"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />

                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                />

                                <Input
                                    label="Phone (Optional)"
                                    placeholder="10-digit phone number"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                                    <select
                                        value={form.role}
                                        onChange={e => setForm({ ...form, role: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                {form.role === 'staff' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Canteen</label>
                                        <select
                                            value={form.canteenLocation}
                                            onChange={e => setForm({ ...form, canteenLocation: e.target.value })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                        >
                                            {canteenLocations.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Staff will manage orders for this canteen</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1" isLoading={saving}>
                                        Create Account
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
