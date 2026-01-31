'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, CheckCircle, XCircle, ChefHat, Truck, Package } from 'lucide-react';
import { Button, Badge, Card } from '@/components/ui';
import { formatDateTime, getStatusLabel } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
    onUpdate: (orderId: string, status: OrderStatus, eta?: number, notes?: string) => Promise<void>;
}

const etaOptions = [5, 10, 15, 20, 25, 30, 45, 60];

export function OrderDetailModal({ order, onClose, onUpdate }: OrderDetailModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedEta, setSelectedEta] = useState<number>(15);
    const [staffNotes, setStaffNotes] = useState(order.staffNotes || '');

    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    const handleStatusUpdate = async (status: OrderStatus) => {
        setLoading(true);
        try {
            await onUpdate(
                order._id,
                status,
                status === 'accepted' ? selectedEta : undefined,
                staffNotes
            );
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl"
            >
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">{order.orderNumber}</h2>
                        <p className="text-sm text-gray-400">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Current Status</span>
                        <Badge
                            variant={
                                order.status === 'pending' ? 'warning' :
                                    order.status === 'ready' ? 'success' :
                                        order.status === 'cancelled' ? 'danger' :
                                            'info'
                            }
                            className="text-sm px-3 py-1"
                        >
                            {getStatusLabel(order.status)}
                        </Badge>
                    </div>

                    {/* Customer Info */}
                    <Card className="p-4">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Customer</h3>
                        <p className="text-white font-semibold">{order.customerName}</p>
                        <p className="text-gray-500 text-sm mt-1">Table {order.tableNumber}</p>
                    </Card>

                    {/* Order Items */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-gray-400">Order Items</h3>
                            <div className="flex items-center gap-1 text-orange-500">
                                <Package className="w-4 h-4" />
                                <span className="font-bold">{totalItems} items</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {order.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded text-sm">
                                            {item.quantity}x
                                        </span>
                                        <div>
                                            <p className="text-white">{item.name}</p>
                                            {item.specialInstructions && (
                                                <p className="text-yellow-500 text-xs">⚠️ {item.specialInstructions}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ETA Selection (for pending orders) */}
                    {order.status === 'pending' && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Set ETA (minutes)</h3>
                            <div className="flex flex-wrap gap-2">
                                {etaOptions.map(eta => (
                                    <button
                                        key={eta}
                                        onClick={() => setSelectedEta(eta)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedEta === eta
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                    >
                                        {eta} min
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Staff Notes */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Staff Notes</h3>
                        <textarea
                            value={staffNotes}
                            onChange={e => setStaffNotes(e.target.value)}
                            placeholder="Add notes for the customer..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                            rows={2}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {order.status === 'pending' && (
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="default"
                                    onClick={() => handleStatusUpdate('accepted')}
                                    isLoading={loading}
                                    className="flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Accept
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleStatusUpdate('cancelled')}
                                    isLoading={loading}
                                    className="flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </Button>
                            </div>
                        )}

                        {order.status === 'accepted' && (
                            <Button
                                variant="default"
                                onClick={() => handleStatusUpdate('preparing')}
                                isLoading={loading}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <ChefHat className="w-4 h-4" />
                                Start Preparing
                            </Button>
                        )}

                        {order.status === 'preparing' && (
                            <Button
                                variant="default"
                                onClick={() => handleStatusUpdate('ready')}
                                isLoading={loading}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <Truck className="w-4 h-4" />
                                Mark as Ready
                            </Button>
                        )}

                        {order.status === 'ready' && (
                            <Button
                                variant="default"
                                onClick={() => handleStatusUpdate('delivered')}
                                isLoading={loading}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Mark as Delivered
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
