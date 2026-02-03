'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, QrCode, Download, Trash2, X, MapPin, Building2, Edit2, RotateCcw } from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';
import type { Table, Canteen } from '@/types';



export default function AdminTablesPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [qrModalData, setQrModalData] = useState<{ qrDataUrl: string; tableNumber: string; menuUrl: string; canteenLocation: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [canteens, setCanteens] = useState<Canteen[]>([]);

    // Form state
    const [form, setForm] = useState({
        tableNumber: '',
        location: 'Main Hall',
        canteenLocation: '', // Will be set dynamically from fetched canteens
        capacity: '4',
    });

    const fetchTables = async () => {
        try {
            const res = await fetch('/api/tables', { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setTables(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch tables:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCanteens = async () => {
        try {
            const res = await fetch('/api/canteens');
            const data = await res.json();
            if (data.success) {
                setCanteens(data.data);
                // Set default canteen location if available and not yet set
                if (data.data.length > 0) {
                    setForm(prev => ({ ...prev, canteenLocation: prev.canteenLocation || data.data[0].name }));
                }
            }
        } catch (err) {
            console.error('Failed to fetch canteens:', err);
        }
    };

    useEffect(() => {
        fetchTables();
        fetchCanteens();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingTable ? `/api/tables/${editingTable._id}` : '/api/tables';
            const method = editingTable ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableNumber: form.tableNumber,
                    location: form.location,
                    canteenLocation: form.canteenLocation,
                    capacity: parseInt(form.capacity),
                }),
            });

            const data = await res.json();

            if (data.success) {
                await fetchTables();
                handleCloseModal();
            }
        } catch (err) {
            console.error('Failed to save table:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTable(null);
        // Use first canteen from list as default, or empty string
        const defaultCanteen = canteens.length > 0 ? canteens[0].name : '';
        setForm({ tableNumber: '', location: 'Main Hall', canteenLocation: defaultCanteen, capacity: '4' });
    };

    const handleEdit = (table: Table) => {
        setEditingTable(table);
        setForm({
            tableNumber: table.tableNumber,
            location: table.location || 'Main Hall',
            canteenLocation: table.canteenLocation || (canteens.length > 0 ? canteens[0].name : ''),
            capacity: String(table.capacity || 4),
        });
        setIsModalOpen(true);
    };

    const handleReactivate = async (id: string) => {
        try {
            const res = await fetch(`/api/tables/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: true }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchTables();
            }
        } catch (err) {
            console.error('Failed to reactivate table:', err);
        }
    };

    const handleShowQR = async (tableId: string) => {
        try {
            const res = await fetch(`/api/tables/${tableId}/qr`);
            const data = await res.json();

            if (data.success) {
                setQrModalData(data.data);
            }
        } catch (err) {
            console.error('Failed to generate QR code:', err);
        }
    };

    const handleDownloadQR = () => {
        if (!qrModalData) return;

        const link = document.createElement('a');
        link.download = `table-${qrModalData.tableNumber}-qr.png`;
        link.href = qrModalData.qrDataUrl;
        link.click();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this table?')) return;

        try {
            const res = await fetch(`/api/tables/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                await fetchTables();
            }
        } catch (err) {
            console.error('Failed to deactivate table:', err);
        }
    };

    const handlePermanentDelete = async (id: string) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this table? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/tables/${id}?permanent=true`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                await fetchTables();
            }
        } catch (err) {
            console.error('Failed to delete table:', err);
        }
    };

    // Group tables by canteen location
    const tablesByLocation = tables.reduce((acc, table) => {
        const loc = table.canteenLocation || 'Unknown';
        if (!acc[loc]) acc[loc] = [];
        acc[loc].push(table);
        return acc;
    }, {} as Record<string, Table[]>);

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-white">Table & QR Management</h1>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Table
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tables Grid - Grouped by Canteen Location */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-40 rounded-2xl bg-gray-800/50 animate-pulse" />
                        ))}
                    </div>
                ) : tables.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <h2 className="text-xl font-bold text-white mb-2">No tables yet</h2>
                        <p className="text-gray-400 mb-6">Start by adding tables and generating QR codes</p>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Table
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(tablesByLocation).map(([location, locationTables]) => (
                            <div key={location}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Building2 className="w-5 h-5 text-orange-500" />
                                    <h2 className="text-xl font-bold text-white">{location}</h2>
                                    <Badge variant="info">{locationTables.length} tables</Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {locationTables.map((table, index) => (
                                        <motion.div
                                            key={table._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card className={`p-4 ${!table.isActive ? 'opacity-50' : ''}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-xl font-bold text-white">{table.tableNumber}</h3>
                                                    <Badge variant={table.isActive ? 'success' : 'danger'}>
                                                        {table.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{table.location}</span>
                                                    {table.capacity && <span>• {table.capacity} seats</span>}
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleShowQR(table._id)}
                                                        className="flex-1"
                                                    >
                                                        <QrCode className="w-4 h-4 mr-1" />
                                                        QR
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEdit(table)}
                                                        className="text-blue-500 hover:text-blue-400"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    {table.isActive ? (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(table._id)}
                                                            className="text-red-500 hover:text-red-400"
                                                            title="Deactivate Table"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleReactivate(table._id)}
                                                                className="text-green-500 hover:text-green-400"
                                                                title="Reactivate Table"
                                                            >
                                                                <RotateCcw className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handlePermanentDelete(table._id)}
                                                                className="text-red-500 hover:text-red-400"
                                                                title="Delete Permanently"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Table Modal */}
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
                                <h2 className="text-xl font-bold text-white">{editingTable ? 'Edit Table' : 'Add New Table'}</h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Canteen</label>
                                    <select
                                        value={form.canteenLocation}
                                        onChange={e => setForm({ ...form, canteenLocation: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                        required
                                    >
                                        {canteens.map(canteen => (
                                            <option key={canteen._id} value={canteen.name}>{canteen.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Staff will deliver orders to this canteen's tables</p>
                                </div>

                                <Input
                                    label="Table Number"
                                    placeholder="e.g., T-01, Counter-1"
                                    value={form.tableNumber}
                                    onChange={e => setForm({ ...form, tableNumber: e.target.value })}
                                    required
                                />

                                <Input
                                    label="Table Location (within canteen)"
                                    placeholder="e.g., Window Side, Near Counter"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                />

                                <Input
                                    label="Seating Capacity"
                                    type="number"
                                    min="1"
                                    value={form.capacity}
                                    onChange={e => setForm({ ...form, capacity: e.target.value })}
                                />

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1" isLoading={saving}>
                                        {editingTable ? 'Save Changes' : 'Create Table'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* QR Code Modal */}
            <AnimatePresence>
                {qrModalData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setQrModalData(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Table {qrModalData.tableNumber}</h3>
                            <p className="text-orange-600 text-sm font-medium mb-1">{qrModalData.canteenLocation}</p>
                            <p className="text-gray-500 text-sm mb-6">Scan to order • Staff delivers to table</p>

                            <div className="bg-white p-4 rounded-xl inline-block mb-6">
                                <img
                                    src={qrModalData.qrDataUrl}
                                    alt={`QR Code for Table ${qrModalData.tableNumber}`}
                                    className="w-64 h-64"
                                />
                            </div>

                            <p className="text-xs text-gray-400 mb-6 break-all">{qrModalData.menuUrl}</p>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 text-gray-700 border-gray-300"
                                    onClick={() => setQrModalData(null)}
                                >
                                    Close
                                </Button>
                                <Button className="flex-1" onClick={handleDownloadQR}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
