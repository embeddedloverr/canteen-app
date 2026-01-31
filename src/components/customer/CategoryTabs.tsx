'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MenuCategory } from '@/types';

const categories: { id: MenuCategory | 'all'; label: string; emoji: string }[] = [
    { id: 'all', label: 'All', emoji: '🍽️' },
    { id: 'starters', label: 'Starters', emoji: '🥗' },
    { id: 'main-course', label: 'Main Course', emoji: '🍛' },
    { id: 'snacks', label: 'Snacks', emoji: '🍟' },
    { id: 'beverages', label: 'Beverages', emoji: '🥤' },
    { id: 'desserts', label: 'Desserts', emoji: '🍰' },
    { id: 'combos', label: 'Combos', emoji: '🎁' },
];

interface CategoryTabsProps {
    selectedCategory: MenuCategory | 'all';
    onSelect: (category: MenuCategory | 'all') => void;
}

export function CategoryTabs({ selectedCategory, onSelect }: CategoryTabsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
                <motion.button
                    key={category.id}
                    onClick={() => onSelect(category.id)}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200',
                        selectedCategory === category.id
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span>{category.emoji}</span>
                    <span className="font-medium">{category.label}</span>
                </motion.button>
            ))}
        </div>
    );
}
