'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Building2, MapPin, Edit2, Trash2, RotateCcw } from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';
import type { Canteen } from '@/types';

export default function AdminCanteensPage() {
    const [canteens, setCanteens] = useState<Canteen[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingCanteen, setEditingCanteen] = useState<Canteen | null>(null);

    const [form, setForm] = useState({
        name: '',
        location: '',
    });

    const fetchCanteens = async () => {
        try {
            const res = await fetch('/api/canteens');
            const data = await res.json();
            if (data.success) {
                setCanteens(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch canteens:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCanteens();
    }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCanteen(null);
        setForm({ name: '', location: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingCanteen ? `/api/canteens/${editingCanteen._id}` : '/api/canteens';
            const method = editingCanteen ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (data.success) {
                await fetchCanteens();
                handleCloseModal();
            }
        } catch (err) {
            console.error('Failed to save canteen:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (canteen: Canteen) => {
        setEditingCanteen(canteen);
        setForm({
            name: canteen.name,
            location: canteen.location || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this canteen?')) return;

        try {
            const res = await fetch(`/api/canteens/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                await fetchCanteens();
            }
        } catch (err) {
            console.error('Failed to delete canteen:', err);
        }
    };

    const handleReactivate = async (id: string) => {
        try {
            const res = await fetch(`/api/canteens/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: true }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchCanteens();
            }
        } catch (err) {
            console.error('Failed to reactivate canteen:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-white">Canteen Management</h1>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Canteen
                        </Button>
                    </div>
                </div>
            </div>

            {/* Canteens Grid */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-32 rounded-2xl bg-gray-800/50 animate-pulse" />
                        ))}
                    </div>
                ) : canteens.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏢</div>
                        <h2 className="text-xl font-bold text-white mb-2">No canteens yet</h2>
                        <p className="text-gray-400 mb-6">Start by adding your canteen locations</p>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Canteen
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {canteens.map((canteen, index) => (
                            <motion.div
                                key={canteen._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className={`p-4 ${!canteen.isActive ? 'opacity-50' : ''}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-orange-500" />
                                            <h3 className="text-lg font-bold text-white">{canteen.name}</h3>
                                        </div>
                                        <Badge variant={canteen.isActive ? 'success' : 'danger'}>
                                            {canteen.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    {canteen.location && (
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                            <MapPin className="w-4 h-4" />
                                            <span>{canteen.location}</span>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleEdit(canteen)}
                                            className="text-blue-500 hover:text-blue-400"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        {canteen.isActive ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(canteen._id)}
                                                className="text-red-500 hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleReactivate(canteen._id)}
                                                className="text-green-500 hover:text-green-400"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                        )}
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
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl"
                        >
                            <div className="border-b border-gray-800 p-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">
                                    {editingCanteen ? 'Edit Canteen' : 'Add New Canteen'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <Input
                                    label="Canteen Name"
                                    placeholder="e.g., 1st Floor Canteen"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />

                                <Input
                                    label="Location Description (optional)"
                                    placeholder="e.g., Near Main Entrance"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                />

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1" isLoading={saving}>
                                        {editingCanteen ? 'Save Changes' : 'Create Canteen'}
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
