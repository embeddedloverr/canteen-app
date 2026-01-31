'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Clock } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { formatDateTime, getStatusLabel } from '@/lib/utils';
import type { Order } from '@/types';

export default function OrderHistoryPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, this would filter by the logged-in user
        // For now, we'll just show recent orders
        async function fetchOrders() {
            try {
                const res = await fetch('/api/orders?limit=20');
                const data = await res.json();
                if (data.success) {
                    setOrders(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <h1 className="text-xl font-bold text-white">Order History</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 rounded-2xl bg-gray-800/50 animate-pulse" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
                        <p className="text-gray-400">Your order history will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, index) => {
                            const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                            return (
                                <motion.div
                                    key={order._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => router.push(`/order/${order._id}`)}
                                    className="cursor-pointer"
                                >
                                    <Card hover className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-white">{order.orderNumber}</span>
                                                    <Badge
                                                        variant={
                                                            order.status === 'delivered' ? 'success' :
                                                                order.status === 'cancelled' ? 'danger' :
                                                                    'warning'
                                                        }
                                                    >
                                                        {getStatusLabel(order.status)}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{formatDateTime(order.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-orange-500 font-bold">
                                                <Package className="w-4 h-4" />
                                                <span>{totalItems} items</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <span>
                                                {order.items.slice(0, 2).map(i => i.name).join(', ')}
                                                {order.items.length > 2 && ` +${order.items.length - 2} more`}
                                            </span>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
