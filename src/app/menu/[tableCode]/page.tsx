'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin, History } from 'lucide-react';
import { Input } from '@/components/ui';
import { MenuItemCard, CartButton } from '@/components/customer';
import { useCartStore } from '@/store';
import type { MenuItem } from '@/types';

interface MenuPageProps {
    params: Promise<{ tableCode: string }>;
}

export default function MenuPage({ params }: MenuPageProps) {
    const { tableCode } = use(params);
    const router = useRouter();
    const { setTable } = useCartStore();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tableInfo, setTableInfo] = useState<{ tableNumber: string; location: string } | null>(null);

    const [searchQuery, setSearchQuery] = useState('');

    // Fetch table info from QR code
    useEffect(() => {
        async function fetchTable() {
            try {
                const res = await fetch(`/api/tables/qr/${tableCode}`);
                const data = await res.json();

                if (!data.success) {
                    setError('Invalid QR code. Please scan again.');
                    return;
                }

                setTableInfo({
                    tableNumber: data.data.tableNumber,
                    location: data.data.location,
                });
                setTable(data.data._id, data.data.tableNumber);
            } catch (err) {
                setError('Failed to load table information.');
            }
        }

        fetchTable();
    }, [tableCode, setTable]);

    // Fetch menu items
    useEffect(() => {
        async function fetchMenu() {
            try {
                const res = await fetch('/api/menu?available=true');
                const data = await res.json();

                if (data.success) {
                    setMenuItems(data.data);
                    setFilteredItems(data.data);
                } else {
                    setError('Failed to load menu.');
                }
            } catch (err) {
                setError('Failed to load menu.');
            } finally {
                setLoading(false);
            }
        }

        fetchMenu();
    }, []);

    // Filter items based on search
    useEffect(() => {
        let filtered = [...menuItems];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                item =>
                    item.name.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query)
            );
        }

        setFilteredItems(filtered);
    }, [menuItems, searchQuery]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
                    <p className="text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen pb-32 relative bg-gray-50/10"
            style={{
                backgroundImage: 'url(/images/cartoonish-food-bg-blue.png)',
                backgroundSize: '400px',
                backgroundRepeat: 'repeat',
                backgroundAttachment: 'fixed',
                backgroundBlendMode: 'overlay',
            }}
        >
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    {/* Table Info */}
                    {tableInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between mb-4"
                        >
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    {process.env.NEXT_PUBLIC_APP_NAME || 'Canteen Express'}
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4" />
                                    <span>{tableInfo.tableNumber} • {tableInfo.location}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/history')}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <History className="w-5 h-5 text-gray-600" />
                            </button>
                        </motion.div>
                    )}

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search for dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                        />
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="h-64 rounded-2xl bg-gray-800/50 animate-pulse"
                            />
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm relative z-10">
                        <div className="text-6xl mb-4">🍽️</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No items found</h2>
                        <p className="text-gray-500">Try adjusting your search</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <MenuItemCard item={item} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Button */}
            <CartButton />
        </div>
    );
}
