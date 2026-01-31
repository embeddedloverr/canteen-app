'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X, Clock } from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';
import type { MenuItem, MenuCategory } from '@/types';

const categories: MenuCategory[] = ['starters', 'main-course', 'beverages', 'desserts', 'snacks', 'combos'];

export default function AdminMenuPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: 'main-course' as MenuCategory,
        isVeg: true,
        isAvailable: true,
        preparationTime: '15',
        tags: '',
    });

    const fetchMenuItems = async () => {
        try {
            const res = await fetch('/api/menu');
            const data = await res.json();
            if (data.success) {
                setMenuItems(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch menu items:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const openModal = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
            setForm({
                name: item.name,
                description: item.description,
                category: item.category as MenuCategory,
                isVeg: item.isVeg,
                isAvailable: item.isAvailable,
                preparationTime: item.preparationTime.toString(),
                tags: item.tags.join(', '),
            });
        } else {
            setEditingItem(null);
            setForm({
                name: '',
                description: '',
                category: 'main-course',
                isVeg: true,
                isAvailable: true,
                preparationTime: '15',
                tags: '',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                name: form.name,
                description: form.description,
                category: form.category,
                isVeg: form.isVeg,
                isAvailable: form.isAvailable,
                preparationTime: parseInt(form.preparationTime),
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            };

            const url = editingItem ? `/api/menu/${editingItem._id}` : '/api/menu';
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                await fetchMenuItems();
                closeModal();
            }
        } catch (err) {
            console.error('Failed to save menu item:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                setMenuItems(menuItems.filter(item => item._id !== id));
            }
        } catch (err) {
            console.error('Failed to delete menu item:', err);
        }
    };

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-white">Menu Management</h1>
                        <Button onClick={() => openModal()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                            placeholder="Search menu items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12"
                        />
                    </div>
                </div>
            </div>

            {/* Menu Items Grid */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 rounded-2xl bg-gray-800/50 animate-pulse" />
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🍽️</div>
                        <h2 className="text-xl font-bold text-white mb-2">No menu items</h2>
                        <p className="text-gray-400 mb-6">Start by adding your first menu item</p>
                        <Button onClick={() => openModal()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={item.isVeg ? 'veg' : 'nonveg'}>●</Badge>
                                            <h3 className="font-bold text-white">{item.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openModal(item)}
                                                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                                            >
                                                <Edit className="w-4 h-4 text-gray-400" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">~{item.preparationTime} min</span>
                                        </div>
                                        <Badge variant={item.isAvailable ? 'success' : 'danger'}>
                                            {item.isAvailable ? 'Available' : 'Unavailable'}
                                        </Badge>
                                    </div>

                                    <div className="mt-3">
                                        <Badge>{item.category}</Badge>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl"
                        >
                            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">
                                    {editingItem ? 'Edit Item' : 'Add New Item'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <Input
                                    label="Name"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <Input
                                    label="Prep Time (min)"
                                    type="number"
                                    value={form.preparationTime}
                                    onChange={e => setForm({ ...form, preparationTime: e.target.value })}
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value as MenuCategory })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat.replace('-', ' ').toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>

                                <Input
                                    label="Tags (comma separated)"
                                    placeholder="spicy, bestseller, new"
                                    value={form.tags}
                                    onChange={e => setForm({ ...form, tags: e.target.value })}
                                />

                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.isVeg}
                                            onChange={e => setForm({ ...form, isVeg: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-gray-300">Vegetarian</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.isAvailable}
                                            onChange={e => setForm({ ...form, isAvailable: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500"
                                        />
                                        <span className="text-gray-300">Available</span>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1" isLoading={saving}>
                                        {editingItem ? 'Update' : 'Add Item'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
