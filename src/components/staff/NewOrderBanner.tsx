'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Order } from '@/types';

interface NewOrderBannerProps {
    order: Order | null;
    onAccept: (orderId: string) => Promise<void>;
}

export function NewOrderBanner({ order, onAccept }: NewOrderBannerProps) {
    if (!order) return null;

    const itemsSummary = (order.items || [])
        .map(i => `${i.quantity}x ${i.name}`)
        .join(', ');

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-0 left-0 right-0 z-50 p-4 bg-orange-600 shadow-xl border-b border-orange-500"
            >
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-full animate-bounce">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                New Order #{order.orderNumber}
                                <span className="text-sm font-normal bg-white/20 px-2 py-0.5 rounded">
                                    {order.tableNumber}
                                </span>
                            </h3>
                            <p className="text-orange-100 text-sm max-w-xl truncate">
                                {itemsSummary}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            onClick={() => onAccept(order._id)}
                            className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 flex-1 md:flex-none"
                            size="lg"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Accept Now
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
