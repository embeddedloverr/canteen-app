'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store';

export function CartButton() {
    const { getTotalItems, tableId } = useCartStore();
    const totalItems = getTotalItems();

    if (totalItems === 0 || !tableId) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent"
            >
                <Link href="/cart">
                    <motion.div
                        className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 shadow-2xl shadow-orange-500/25 flex items-center justify-between cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6 text-white" />
                                <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {totalItems}
                                </span>
                            </div>
                            <div>
                                <p className="text-white font-bold">{totalItems} item{totalItems > 1 ? 's' : ''}</p>
                                <p className="text-white/80 text-sm">View Cart</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <span className="font-bold">Proceed</span>
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </motion.div>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}
