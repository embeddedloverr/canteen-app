'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { formatDateTime, getStatusLabel } from '@/lib/utils';
import type { Order } from '@/types';

export default function OrderHistoryPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [cleaningUp, setCleaningUp] = useState(false);

    const isAdmin = session?.user?.role === 'admin';

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            const res = await fetch('/api/orders?limit=100');
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

    const handleDeleteOrder = async (orderId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (deleteConfirm !== orderId) {
            setDeleteConfirm(orderId);
            return;
        }

        setDeleting(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                setOrders(orders.filter(o => o._id !== orderId));
            } else {
                alert(data.error || 'Failed to delete order');
            }
        } catch (err) {
            console.error('Failed to delete order:', err);
            alert('Failed to delete order');
        } finally {
            setDeleting(false);
            setDeleteConfirm(null);
        }
    };

    const handleCleanup = async () => {
        if (!confirm('This will delete all delivered/cancelled orders older than 7 days. Continue?')) {
            return;
        }

        setCleaningUp(true);
        try {
            const res = await fetch('/api/orders/cleanup', {
                method: 'POST',
            });
            const data = await res.json();

            if (data.success) {
                alert(`Cleaned up ${data.data.deletedCount} old orders`);
                fetchOrders();
            } else {
                alert(data.error || 'Failed to cleanup orders');
            }
        } catch (err) {
            console.error('Failed to cleanup orders:', err);
            alert('Failed to cleanup orders');
        } finally {
            setCleaningUp(false);
        }
    };

    const canDelete = (order: Order) => {
        return isAdmin && ['delivered', 'cancelled'].includes(order.status);
    };

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
                            <h1 className="text-xl font-bold text-white">Order History</h1>
                        </div>
                        {isAdmin && (
                            <Button
                                variant="destructive"
                                onClick={handleCleanup}
                                isLoading={cleaningUp}
                                className="text-sm"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Cleanup Old
                            </Button>
                        )}
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
                            const isConfirming = deleteConfirm === order._id;

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
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-orange-500 font-bold">
                                                    <Package className="w-4 h-4" />
                                                    <span>{totalItems}</span>
                                                </div>
                                                {canDelete(order) && (
                                                    <button
                                                        onClick={(e) => handleDeleteOrder(order._id, e)}
                                                        disabled={deleting}
                                                        className={`p-2 rounded-lg transition-colors ${isConfirming
                                                                ? 'bg-red-500 text-white'
                                                                : 'bg-gray-800 text-gray-400 hover:bg-red-500/20 hover:text-red-400'
                                                            }`}
                                                        title={isConfirming ? 'Click again to confirm' : 'Delete order'}
                                                    >
                                                        {isConfirming ? (
                                                            <AlertTriangle className="w-4 h-4" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <span>
                                                {order.items.slice(0, 2).map(i => i.name).join(', ')}
                                                {order.items.length > 2 && ` +${order.items.length - 2} more`}
                                            </span>
                                        </div>

                                        {isConfirming && (
                                            <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                Click delete again to confirm
                                            </div>
                                        )}
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
