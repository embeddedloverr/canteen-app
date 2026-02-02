import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock, XCircle, X } from 'lucide-react';
import { Order } from '@/types';

interface NewOrderAlertModalProps {
    orders: Order[];
    onAccept: (orderId: string, eta?: number, notes?: string) => void;
    onReject: (orderId: string, reason: string) => void;
}

export function NewOrderAlertModal({ orders, onAccept, onReject }: NewOrderAlertModalProps) {
    // State to track which order is being interacted with and how
    const [actionState, setActionState] = useState<{
        orderId: string;
        type: 'accept' | 'reject';
    } | null>(null);

    // Form states
    const [comment, setComment] = useState('');
    const [eta, setEta] = useState<number>(15); // Default 15 mins

    if (!orders || orders.length === 0) return null;

    const handleActionClick = (orderId: string, type: 'accept' | 'reject') => {
        setActionState({ orderId, type });
        setComment('');
        setEta(15); // Reset to default
    };

    const handleCancel = () => {
        setActionState(null);
        setComment('');
    };

    const handleConfirm = (orderId: string) => {
        if (!actionState) return;

        if (actionState.type === 'accept') {
            onAccept(orderId, eta, comment);
        } else {
            if (!comment.trim()) return; // Rejection requires reason
            onReject(orderId, comment);
        }
        setActionState(null);
    };

    const etaOptions = [5, 10, 15, 20, 30];

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

                            const isActive = actionState?.orderId === order._id;
                            const isRejecting = isActive && actionState?.type === 'reject';
                            const isAccepting = isActive && actionState?.type === 'accept';

                            return (
                                <motion.div
                                    key={order._id}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`bg-gray-900 border rounded-2xl shadow-xl overflow-hidden relative group transition-colors ${isActive
                                            ? (isRejecting ? 'border-red-500' : 'border-green-500')
                                            : 'border-orange-500/50'
                                        }`}
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

                                        {isActive ? (
                                            <div className={`p-4 rounded-xl border ${isRejecting ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                                                <h4 className={`text-sm font-bold mb-3 ${isRejecting ? 'text-red-400' : 'text-green-400'}`}>
                                                    {isRejecting ? 'Reason for Rejection:' : 'Confirm Acceptance:'}
                                                </h4>

                                                {isAccepting && (
                                                    <div className="mb-4">
                                                        <label className="text-gray-400 text-xs font-bold block mb-2">ETA (minutes):</label>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {etaOptions.map(min => (
                                                                <button
                                                                    key={min}
                                                                    onClick={() => setEta(min)}
                                                                    className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${eta === min
                                                                            ? 'bg-green-500 text-white'
                                                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                                                        }`}
                                                                >
                                                                    {min}m
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mb-4">
                                                    <label className={`text-xs font-bold block mb-1 ${isRejecting ? 'text-red-400' : 'text-green-400'}`}>
                                                        {isRejecting ? 'Reason (Required)' : 'Comment (Optional)'}
                                                    </label>
                                                    <textarea
                                                        value={comment}
                                                        onChange={(e) => setComment(e.target.value)}
                                                        placeholder={isRejecting ? "E.g. Item out of stock..." : "Add a note..."}
                                                        className={`w-full bg-gray-950 border rounded-lg p-2 text-white text-sm focus:outline-none ${isRejecting ? 'border-red-500/50 focus:border-red-500' : 'border-green-500/50 focus:border-green-500'}`}
                                                        rows={2}
                                                        autoFocus
                                                    />
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleCancel}
                                                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-3 rounded-lg text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleConfirm(order._id)}
                                                        disabled={isRejecting && !comment.trim()}
                                                        className={`flex-1 font-bold py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${isRejecting
                                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                                            }`}
                                                    >
                                                        {isRejecting ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                        {isRejecting ? 'Confirm Reject' : 'Confirm Accept'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleActionClick(order._id, 'reject')}
                                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleActionClick(order._id, 'accept')}
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
