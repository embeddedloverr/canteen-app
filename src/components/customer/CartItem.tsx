'use client';

import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, Clock } from 'lucide-react';
import { useCartStore } from '@/store';
import { Badge } from '@/components/ui';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem, updateInstructions } = useCartStore();

    const handleIncrement = () => {
        updateQuantity(item.menuItem._id, item.quantity + 1);
    };

    const handleDecrement = () => {
        if (item.quantity <= 1) {
            removeItem(item.menuItem._id);
        } else {
            updateQuantity(item.menuItem._id, item.quantity - 1);
        }
    };

    const handleRemove = () => {
        removeItem(item.menuItem._id);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-gray-900/50 rounded-xl p-4 border border-gray-800"
        >
            <div className="flex items-start gap-4">
                {/* Item Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant={item.menuItem.isVeg ? 'veg' : 'nonveg'} className="w-4 h-4 p-0 flex items-center justify-center">
                            ●
                        </Badge>
                        <h3 className="font-bold text-white">{item.menuItem.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Clock className="w-3 h-3" />
                        <span>~{item.menuItem.preparationTime} min</span>
                    </div>

                    {/* Special Instructions */}
                    <input
                        type="text"
                        placeholder="Add cooking instructions..."
                        value={item.specialInstructions || ''}
                        onChange={(e) => updateInstructions(item.menuItem._id, e.target.value)}
                        className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500"
                    />
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={handleRemove}
                        className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 bg-gray-800 rounded-full p-1">
                        <button
                            onClick={handleDecrement}
                            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                        >
                            <Minus className="w-4 h-4 text-white" />
                        </button>
                        <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
                        <button
                            onClick={handleIncrement}
                            className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
                        >
                            <Plus className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    <span className="font-bold text-orange-500">
                        Qty: {item.quantity}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
