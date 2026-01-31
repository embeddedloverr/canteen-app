'use client';

import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Clock, CheckCircle, ChefHat, Package, Bell, LogOut, Volume2, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui';
import { OrderCard, OrderDetailModal } from '@/components/staff';
import type { Order, OrderStatus } from '@/types';

const statusFilters: { id: OrderStatus | 'all' | 'active'; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: RefreshCw },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'accepted', label: 'Accepted', icon: CheckCircle },
    { id: 'preparing', label: 'Preparing', icon: ChefHat },
    { id: 'ready', label: 'Ready', icon: Package },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function StaffDashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<OrderStatus | 'all' | 'active'>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);

    // Ref to track previous pending count for notifications
    const prevPendingRef = useRef(0);
    // Ref to track last sound time for recurring notifications
    const lastSoundTimeRef = useRef(0);

    const playNotification = (text: string) => {
        if (!soundEnabled) return;

        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error('Audio notification failed:', e);
        }
    };

    const fetchOrders = async (showLoading = true) => {
        if (showLoading) setRefreshing(true);

        try {
            const res = await fetch('/api/orders?limit=100');
            const data = await res.json();

            if (data.success) {
                const newOrders = data.data as Order[];

                // Check for new pending orders or recurring reminder
                const newPendingCount = newOrders.filter(o => o.status === 'pending').length;

                const now = Date.now();
                const hasNewOrders = newPendingCount > prevPendingRef.current;
                const timeSinceLastSound = now - lastSoundTimeRef.current;
                const shouldPlayRecurring = newPendingCount > 0 && timeSinceLastSound >= 15000; // 15 seconds

                if (hasNewOrders) {
                    playNotification('New order received');
                    lastSoundTimeRef.current = now;
                } else if (shouldPlayRecurring) {
                    const pendingOrders = newOrders.filter(o => o.status === 'pending');
                    const itemDetails = pendingOrders
                        .flatMap(o => o.items?.map(i => `${i.quantity} ${i.name}`) || [])
                        .join(', ');

                    playNotification(`Please accept order until accepted. Items are: ${itemDetails}`);
                    lastSoundTimeRef.current = now;
                }

                prevPendingRef.current = newPendingCount;

                setOrders(newOrders);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders(false);

        // Poll for new orders every 5 seconds
        const interval = setInterval(() => fetchOrders(false), 5000);

        return () => clearInterval(interval);
    }, [soundEnabled]); // Re-bind effect if sound preference changes (mostly for closures, though using ref should be fine)

    const handleUpdateOrder = async (orderId: string, status: OrderStatus, eta?: number, notes?: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, eta, staffNotes: notes }),
            });

            const data = await res.json();

            if (data.success) {
                // Update local state
                setOrders(orders.map(o => o._id === orderId ? data.data : o));

                // Update ref count if status changed from pending
                if (status !== 'pending') {
                    // We don't necessarily need to decrement ref here because the next fetch will sync it, 
                    // but syncing strictly is safer.
                    // However, fetchOrders runs frequently so it will self-correct.
                }
            }
        } catch (err) {
            console.error('Failed to update order:', err);
        }
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    const filteredOrders = orders.filter(order => {
        if (selectedFilter === 'all') return order.status !== 'delivered' && order.status !== 'cancelled';
        if (selectedFilter === 'active') return ['pending', 'accepted', 'preparing', 'ready'].includes(order.status);
        return order.status === selectedFilter;
    });

    const pendingCount = orders.filter(o => o.status === 'pending').length;

    const stats = [
        { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-yellow-500' },
        { label: 'Preparing', value: orders.filter(o => o.status === 'preparing').length, color: 'text-purple-500' },
        { label: 'Ready', value: orders.filter(o => o.status === 'ready').length, color: 'text-green-500' },
    ];

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white">Staff Dashboard</h1>
                            {pendingCount > 0 && (
                                <Badge variant="warning" className="animate-pulse">
                                    <Bell className="w-3 h-3 mr-1" />
                                    {pendingCount} new
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className={`p-2 rounded-xl transition-colors ${soundEnabled ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                                title={soundEnabled ? 'Mute Notifications' : 'Enable Sound Notifications'}
                            >
                                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => fetchOrders(true)}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-white"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {stats.map(stat => (
                            <div key={stat.label} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                                <p className="text-gray-400 text-sm">{stat.label}</p>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {statusFilters.map(filter => {
                            const Icon = filter.icon;
                            const count = filter.id === 'all'
                                ? orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length
                                : orders.filter(o => o.status === filter.id).length;

                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => setSelectedFilter(filter.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${selectedFilter === filter.id
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {filter.label}
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedFilter === filter.id ? 'bg-white/20' : 'bg-gray-700'
                                        }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-40 rounded-2xl bg-gray-800/50 animate-pulse" />
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <h2 className="text-xl font-bold text-white mb-2">No orders</h2>
                        <p className="text-gray-400">Orders will appear here when customers place them</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredOrders.map(order => (
                                <OrderCard
                                    key={order._id}
                                    order={order}
                                    onSelect={setSelectedOrder}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <OrderDetailModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onUpdate={handleUpdateOrder}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
