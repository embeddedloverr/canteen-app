// User types
export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'staff' | 'admin';
    isGuest: boolean;
    createdAt: string;
    updatedAt: string;
}

// Menu types
export interface MenuItem {
    _id: string;
    name: string;
    description: string;
    category: MenuCategory;
    image?: string;
    isVeg: boolean;
    isAvailable: boolean;
    preparationTime: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export type MenuCategory = 'starters' | 'main-course' | 'beverages' | 'desserts' | 'snacks' | 'combos';

// Table types
export interface Table {
    _id: string;
    tableNumber: string;
    qrCode: string;
    location?: string;
    canteenLocation: CanteenLocation;
    capacity?: number;
    isActive: boolean;
    createdAt: string;
}

export type CanteenLocation = '1st Floor Canteen' | '2nd Floor Canteen';

// Order types
export interface OrderItem {
    menuItem: string;
    name: string;
    quantity: number;
    specialInstructions?: string;
}

export interface Order {
    _id: string;
    orderNumber: string;
    customerName: string;
    table: string;
    tableNumber: string;
    canteenLocation?: string;
    items: OrderItem[];
    status: OrderStatus;
    eta?: string;
    acceptedAt?: string;
    readyAt?: string;
    deliveredAt?: string;
    staffNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

// Cart types
export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    specialInstructions?: string;
}

export interface Cart {
    items: CartItem[];
    tableId: string;
    tableNumber: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Form types
export interface CreateOrderInput {
    tableId: string;
    customerName?: string;
    items: {
        menuItemId: string;
        quantity: number;
        specialInstructions?: string;
    }[];
}

export interface UpdateOrderStatusInput {
    status: OrderStatus;
    eta?: number; // minutes from now
    staffNotes?: string;
}

export interface CreateMenuItemInput {
    name: string;
    description: string;
    category: MenuCategory;
    image?: string;
    isVeg: boolean;
    isAvailable: boolean;
    preparationTime: number;
    tags: string[];
}

export interface CreateTableInput {
    tableNumber: string;
    location?: string;
    canteenLocation: CanteenLocation;
    capacity?: number;
}

// Session types for auth
export interface SessionUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'staff' | 'admin';
}
