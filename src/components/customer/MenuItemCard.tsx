'use client';

import Image from 'next/image';
import { Plus, Minus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '@/components/ui';
import { useCartStore } from '@/store';
import type { MenuItem } from '@/types';

interface MenuItemCardProps {
    item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
    const { items, addItem, updateQuantity, removeItem } = useCartStore();
    const cartItem = items.find(i => i.menuItem._id === item._id);
    const quantity = cartItem?.quantity || 0;

    const handleAdd = () => {
        addItem(item);
    };

    const handleIncrement = () => {
        updateQuantity(item._id, quantity + 1);
    };

    const handleDecrement = () => {
        if (quantity <= 1) {
            removeItem(item._id);
        } else {
            updateQuantity(item._id, quantity - 1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card hover className="overflow-hidden h-full bg-white border-gray-200">
                {/* Unavailable overlay */}
                {!item.isAvailable && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="text-gray-900 font-bold text-lg">Currently Unavailable</span>
                    </div>
                )}

                <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant={item.isVeg ? 'veg' : 'nonveg'} className="px-1.5 py-0">
                                    {item.isVeg ? '●' : '●'}
                                </Badge>
                                <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{item.name}</h3>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                            {/* Tags */}
                            {item.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                    {item.tags.slice(0, 2).map(tag => (
                                        <Badge key={tag} variant="warning" className="text-[10px]">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">~{item.preparationTime} min</span>
                        </div>

                        {item.isAvailable && (
                            quantity === 0 ? (
                                <Button
                                    onClick={handleAdd}
                                    size="sm"
                                    className="rounded-full"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 border border-gray-200">
                                    <button
                                        onClick={handleDecrement}
                                        className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-colors shadow-sm"
                                    >
                                        <Minus className="w-4 h-4 text-gray-700" />
                                    </button>
                                    <span className="w-6 text-center font-bold text-gray-900">{quantity}</span>
                                    <button
                                        onClick={handleIncrement}
                                        className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
                                    >
                                        <Plus className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
