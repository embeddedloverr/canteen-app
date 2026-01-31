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
            <Card hover className="overflow-hidden h-full">
                <div className="relative">
                    {item.image ? (
                        <Image
                            src={item.image}
                            alt={item.name}
                            width={400}
                            height={200}
                            className="w-full h-40 object-cover"
                        />
                    ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                            <span className="text-4xl">🍽️</span>
                        </div>
                    )}

                    {/* Veg/Non-veg indicator */}
                    <div className="absolute top-3 left-3">
                        <Badge variant={item.isVeg ? 'veg' : 'nonveg'}>
                            {item.isVeg ? '●' : '●'}
                        </Badge>
                    </div>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                        <div className="absolute top-3 right-3 flex gap-1">
                            {item.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="warning" className="text-[10px]">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Unavailable overlay */}
                    {!item.isAvailable && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">Currently Unavailable</span>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-bold text-white text-lg line-clamp-1">{item.name}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2 mt-1">{item.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1 text-gray-400">
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
                                <div className="flex items-center gap-2 bg-gray-800 rounded-full p-1">
                                    <button
                                        onClick={handleDecrement}
                                        className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                                    >
                                        <Minus className="w-4 h-4 text-white" />
                                    </button>
                                    <span className="w-6 text-center font-bold text-white">{quantity}</span>
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
