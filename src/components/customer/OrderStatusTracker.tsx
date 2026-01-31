'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Package, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

const statuses: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
    { status: 'pending', label: 'Order Placed', icon: Clock },
    { status: 'accepted', label: 'Accepted', icon: CheckCircle2 },
];

interface OrderStatusTrackerProps {
    currentStatus: OrderStatus;
    eta?: string;
}

export function OrderStatusTracker({ currentStatus, eta }: OrderStatusTrackerProps) {
    if (currentStatus === 'cancelled') {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Order Cancelled</h3>
                <p className="text-gray-400">This order has been cancelled.</p>
            </div>
        );
    }

    if (currentStatus === 'delivered') {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                >
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Order Delivered!</h3>
                <p className="text-gray-400">Thank you for ordering with us.</p>
            </div>
        );
    }

    const currentIndex = statuses.findIndex(s => s.status === currentStatus);

    return (
        <div className="p-6">
            {/* ETA Display */}
            {eta && currentStatus === 'pending' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <p className="text-gray-400 text-sm mb-1">Estimated Time</p>
                    <p className="text-3xl font-bold text-orange-500">
                        {new Date(eta).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </motion.div>
            )}

            {/* Status Timeline */}
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700">
                    <motion.div
                        className="w-full bg-gradient-to-b from-orange-500 to-red-500"
                        initial={{ height: 0 }}
                        animate={{ height: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Status Items */}
                <div className="space-y-8">
                    {statuses.map((status, index) => {
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;
                        const Icon = status.icon;

                        return (
                            <motion.div
                                key={status.status}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                <div
                                    className={cn(
                                        'w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300',
                                        isCompleted
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/25'
                                            : 'bg-gray-800 border-2 border-gray-700'
                                    )}
                                >
                                    <Icon className={cn('w-5 h-5', isCompleted ? 'text-white' : 'text-gray-500')} />
                                </div>

                                <div className="flex-1">
                                    <p className={cn(
                                        'font-semibold transition-colors',
                                        isCompleted ? 'text-white' : 'text-gray-500'
                                    )}>
                                        {status.label}
                                    </p>
                                    {isCurrent && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-orange-400 text-sm"
                                        >
                                            In Progress...
                                        </motion.p>
                                    )}
                                </div>

                                {isCompleted && (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
