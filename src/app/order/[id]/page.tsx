'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, MapPin, Package } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { OrderStatusTracker } from '@/components/customer';
import { formatDateTime, getStatusLabel } from '@/lib/utils';
import type { Order } from '@/types';

interface OrderPageProps {
    params: Promise<{ id: string }>;
}

export default function OrderPage({ params }: OrderPageProps) {
    const { id } = use(params);
    const router = useRouter();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrder = async (showLoading = true) => {
        if (showLoading) setRefreshing(true);

        try {
            const res = await fetch(`/api/orders/${id}`);
            const data = await res.json();

            if (!data.success) {
                setError('Order not found');
                return;
            }

            setOrder(data.data);
        } catch (err) {
            setError('Failed to load order');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrder(false);

        // Poll for updates every 10 seconds
        const interval = setInterval(() => fetchOrder(false), 10000);

        return () => clearInterval(interval);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Button onClick={() => router.push('/')}>Go Home</Button>
                </div>
            </div>
        );
    }

    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white">{order.orderNumber}</h1>
                                <p className="text-sm text-gray-400">{formatDateTime(order.createdAt)}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchOrder(true)}
                            disabled={refreshing}
                            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Order Status */}
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 px-6 py-4 border-b border-gray-800">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Order Status</h2>
                            <Badge
                                variant={
                                    order.status === 'delivered' ? 'success' :
                                        order.status === 'cancelled' ? 'danger' :
                                            order.status === 'ready' ? 'success' :
                                                'warning'
                                }
                            >
                                {getStatusLabel(order.status)}
                            </Badge>
                        </div>
                    </div>
                    <OrderStatusTracker currentStatus={order.status} eta={order.eta} />
                </Card>

                {/* Table Info */}
                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-white font-semibold">Table {order.tableNumber}</p>
                            <p className="text-gray-400 text-sm">Your order will be delivered here</p>
                        </div>
                    </div>
                </Card>

                {/* Order Items */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">Order Items</h2>
                        <div className="flex items-center gap-2 text-gray-400">
                            <Package className="w-4 h-4" />
                            <span>{totalItems} items</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-orange-500 bg-orange-500/10 px-2 py-1 rounded">
                                        {item.quantity}x
                                    </span>
                                    <div>
                                        <p className="text-white font-medium">{item.name}</p>
                                        {item.specialInstructions && (
                                            <p className="text-gray-500 text-sm">{item.specialInstructions}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>

                {/* Staff Notes */}
                {order.staffNotes && (
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-white mb-2">Note from Staff</h2>
                        <p className="text-gray-400">{order.staffNotes}</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
