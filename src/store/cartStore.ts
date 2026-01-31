import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem, CartItem } from '@/types';

interface CartState {
    items: CartItem[];
    tableId: string | null;
    tableNumber: string | null;

    // Actions
    setTable: (tableId: string, tableNumber: string) => void;
    addItem: (menuItem: MenuItem, quantity?: number, specialInstructions?: string) => void;
    removeItem: (menuItemId: string) => void;
    updateQuantity: (menuItemId: string, quantity: number) => void;
    updateInstructions: (menuItemId: string, instructions: string) => void;
    clearCart: () => void;

    // Computed
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            tableId: null,
            tableNumber: null,

            setTable: (tableId: string, tableNumber: string) => {
                set({ tableId, tableNumber });
            },

            addItem: (menuItem: MenuItem, quantity = 1, specialInstructions?: string) => {
                const { items } = get();
                const existingItem = items.find(item => item.menuItem._id === menuItem._id);

                if (existingItem) {
                    set({
                        items: items.map(item =>
                            item.menuItem._id === menuItem._id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    set({
                        items: [...items, { menuItem, quantity, specialInstructions }],
                    });
                }
            },

            removeItem: (menuItemId: string) => {
                set({
                    items: get().items.filter(item => item.menuItem._id !== menuItemId),
                });
            },

            updateQuantity: (menuItemId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(menuItemId);
                    return;
                }

                set({
                    items: get().items.map(item =>
                        item.menuItem._id === menuItemId
                            ? { ...item, quantity }
                            : item
                    ),
                });
            },

            updateInstructions: (menuItemId: string, instructions: string) => {
                set({
                    items: get().items.map(item =>
                        item.menuItem._id === menuItemId
                            ? { ...item, specialInstructions: instructions }
                            : item
                    ),
                });
            },

            clearCart: () => {
                set({ items: [], tableId: null, tableNumber: null });
            },

            getTotalItems: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        {
            name: 'canteen-cart',
            partialize: (state) => ({
                items: state.items,
                tableId: state.tableId,
                tableNumber: state.tableNumber,
            }),
        }
    )
);
