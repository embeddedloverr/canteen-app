import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock, X } from 'lucide-react';
import { Order } from '@/types';

interface NewOrderAlertModalProps {
    order: Order | null;
    onAccept: (orderId: string) => void;
}

export function NewOrderAlertModal({ order, onAccept }: NewOrderAlertModalProps) {
    if (!order) return null;

    const itemsSummary = (order.items || [])
        .map(i => `${i.quantity}x ${i.name}`)
        .join(', ');

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gray-900 border-2 border-orange-500 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative"
                >
                    {/* Pulsing Border Effect */}
                    <div className="absolute inset-0 border-4 border-orange-500/30 rounded-3xl animate-pulse pointer-events-none" />

                    <div className="p-8 text-center relative z-10">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-500 blur-xl opacity-50 animate-pulse" />
                                <div className="bg-orange-500 p-4 rounded-full relative z-10">
                                    <Bell className="w-12 h-12 text-white animate-bounce" />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">New Order Alert!</h2>
                        <p className="text-orange-400 font-medium text-lg mb-8">Table {order.tableNumber}</p>

                        <div className="bg-gray-800/50 rounded-2xl p-6 mb-8 text-left border border-gray-700">
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-400 text-sm uppercase tracking-wider font-semibold">
                                    <span>Order #{order.orderNumber}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Just now</span>
                                </div>
                                <div className="text-white text-lg font-medium leading-relaxed">
                                    {itemsSummary}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => onAccept(order._id)}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl text-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-lg shadow-orange-500/20"
                            >
                                <CheckCircle className="w-6 h-6" />
                                Accept Order
                            </button>
                        </div>

                        <p className="text-gray-500 text-sm mt-6 animate-pulse">
                            Please accept to stop the alarm
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
