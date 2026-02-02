import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock, XCircle, X } from 'lucide-react';
import { Order } from '@/types';

interface NewOrderAlertModalProps {
    orders: Order[];
    onAccept: (orderId: string) => void;
    onReject: (orderId: string, reason: string) => void;
}

export function NewOrderAlertModal({ orders, onAccept, onReject }: NewOrderAlertModalProps) {
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    if (!orders || orders.length === 0) return null;

    const handleRejectClick = (orderId: string) => {
        setRejectingId(orderId);
        setRejectionReason('');
    };

    const handleCancelReject = () => {
        setRejectingId(null);
        setRejectionReason('');
    };

    const handleConfirmReject = (orderId: string) => {
        if (!rejectionReason.trim()) return; // Prevent empty rejection
        onReject(orderId, rejectionReason);
        setRejectingId(null);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <div className="w-full max-w-4xl max-h-[80vh] flex flex-col gap-4 overflow-hidden relative">
                    {/* Header */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex items-center justify-center gap-3 text-white mb-4"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-500 blur-lg opacity-50 animate-pulse" />
                            <Bell className="w-10 h-10 text-orange-500 relative z-10 animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-bold">{orders.length} New Order{orders.length > 1 ? 's' : ''}!</h2>
                    </motion.div>

                    {/* Scrollable Grid */}
                    <div className="overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 px-2 pb-4 scrollbar-hide">
                        {orders.map((order, index) => {
                            const itemsSummary = (order.items || [])
                                .map(i => `${i.quantity}x ${i.name}`)
                                .join(', ');

                            const isRejecting = rejectingId === order._id;

                            return (
                                <motion.div
                                    key={order._id}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-gray-900 border border-orange-500/50 rounded-2xl shadow-xl overflow-hidden relative group"
                                >
                                    <div className="p-6 relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-2xl font-bold text-orange-400">Table {order.tableNumber}</h3>
                                                <span className="text-gray-400 text-sm">#{order.orderNumber}</span>
                                            </div>
                                            <span className="flex items-center gap-1 text-xs font-bold bg-orange-500/20 text-orange-400 px-2 py-1 rounded-lg border border-orange-500/30">
                                                <Clock className="w-3 h-3" /> Just now
                                            </span>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 min-h-[80px]">
                                            <p className="text-white font-medium leading-relaxed line-clamp-3">
                                                {itemsSummary}
                                            </p>
                                        </div>

                                        {isRejecting ? (
                                            <div className="space-y-3 bg-red-500/10 p-4 rounded-xl border border-red-500/30">
                                                <label className="text-red-400 text-sm font-bold block mb-1">Reason for Rejection:</label>
                                                <textarea
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    placeholder="E.g. Item out of stock..."
                                                    className="w-full bg-gray-950 border border-red-500/50 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-red-500"
                                                    rows={2}
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleCancelReject}
                                                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-3 rounded-lg text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleConfirmReject(order._id)}
                                                        disabled={!rejectionReason.trim()}
                                                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Confirm Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleRejectClick(order._id)}
                                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => onAccept(order._id)}
                                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-orange-500/20"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                    Accept
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {/* Background glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
