'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Trash2, Package } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { CartItem } from '@/components/customer';
import { useCartStore } from '@/store';

export default function CartPage() {
    const router = useRouter();
    const { items, tableId, tableNumber, getTotalItems, clearCart } = useCartStore();

    const [customerName, setCustomerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalItems = getTotalItems();

    const handlePlaceOrder = async () => {
        if (!tableId || items.length === 0) {
            setError('Your cart is empty');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableId,
                    customerName: customerName.trim() || 'Guest',
                    items: items.map(item => ({
                        menuItemId: item.menuItem._id,
                        quantity: item.quantity,
                        specialInstructions: item.specialInstructions,
                    })),
                }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Failed to place order');
                return;
            }

            // Clear cart and redirect to order tracking
            clearCart();
            router.push(`/order/${data.data._id}`);
        } catch (err) {
            setError('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!tableId || items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
                    <p className="text-gray-400 mb-6">Scan a QR code to start ordering</p>
                    <Button onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white">Your Cart</h1>
                                <p className="text-sm text-gray-400">Table {tableNumber}</p>
                            </div>
                        </div>
                        <button
                            onClick={clearCart}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Cart Items */}
                <div className="space-y-3 mb-8">
                    <AnimatePresence mode="popLayout">
                        {items.map(item => (
                            <CartItem key={item.menuItem._id} item={item} />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Customer Details - Optional */}
                <Card className="p-6 mb-6">
                    <h2 className="text-lg font-bold text-white mb-2">Your Details</h2>
                    <p className="text-sm text-gray-400 mb-4">Optional - helps us identify your order</p>
                    <Input
                        label="Name (Optional)"
                        placeholder="Enter your name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />
                </Card>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                        <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                )}

                {/* Order Summary */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-400">
                            <span>Total Items</span>
                            <span className="text-white font-bold">{totalItems}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                <span>Items in cart</span>
                            </div>
                            <span className="text-white">{items.length} different items</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Place Order Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                <div className="max-w-2xl mx-auto">
                    <Button
                        className="w-full h-14 text-lg"
                        onClick={handlePlaceOrder}
                        isLoading={loading}
                    >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Place Order ({totalItems} items)
                    </Button>
                </div>
            </div>
        </div>
    );
}
