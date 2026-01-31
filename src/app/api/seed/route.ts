import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db/mongoose';
import MenuItem from '@/models/MenuItem';
import Table from '@/models/Table';
import User from '@/models/User';
import { generateTableCode } from '@/lib/utils';

// Sample menu items data
const sampleMenuItems = [
    {
        name: 'Paneer Tikka',
        description: 'Succulent cubes of paneer marinated in spices and grilled to perfection',
        category: 'starters',
        isVeg: true,
        isAvailable: true,
        preparationTime: 15,
        tags: ['bestseller', 'spicy'],
    },
    {
        name: 'Chicken Wings',
        description: 'Crispy fried chicken wings tossed in spicy buffalo sauce',
        category: 'starters',
        isVeg: false,
        isAvailable: true,
        preparationTime: 20,
        tags: ['spicy'],
    },
    {
        name: 'Masala Dosa',
        description: 'Crispy South Indian crepe filled with spiced potato filling',
        category: 'main-course',
        isVeg: true,
        isAvailable: true,
        preparationTime: 15,
        tags: ['south-indian', 'bestseller'],
    },
    {
        name: 'Butter Chicken',
        description: 'Tender chicken pieces in rich, creamy tomato-based curry',
        category: 'main-course',
        isVeg: false,
        isAvailable: true,
        preparationTime: 25,
        tags: ['bestseller', 'creamy'],
    },
    {
        name: 'Veg Biryani',
        description: 'Fragrant basmati rice layered with mixed vegetables and aromatic spices',
        category: 'main-course',
        isVeg: true,
        isAvailable: true,
        preparationTime: 25,
        tags: ['rice'],
    },
    {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender chicken pieces and house spices',
        category: 'main-course',
        isVeg: false,
        isAvailable: true,
        preparationTime: 30,
        tags: ['bestseller', 'rice'],
    },
    {
        name: 'Samosa',
        description: 'Crispy fried pastry filled with spiced potatoes and peas',
        category: 'snacks',
        isVeg: true,
        isAvailable: true,
        preparationTime: 10,
        tags: ['quick', 'crispy'],
    },
    {
        name: 'French Fries',
        description: 'Golden crispy fries served with ketchup and mayo',
        category: 'snacks',
        isVeg: true,
        isAvailable: true,
        preparationTime: 10,
        tags: ['quick'],
    },
    {
        name: 'Masala Chai',
        description: 'Traditional Indian spiced tea with milk',
        category: 'beverages',
        isVeg: true,
        isAvailable: true,
        preparationTime: 5,
        tags: ['hot'],
    },
    {
        name: 'Fresh Lime Soda',
        description: 'Refreshing lime juice with soda, available sweet or salted',
        category: 'beverages',
        isVeg: true,
        isAvailable: true,
        preparationTime: 5,
        tags: ['cold', 'refreshing'],
    },
    {
        name: 'Cold Coffee',
        description: 'Chilled coffee blended with ice cream and topped with whipped cream',
        category: 'beverages',
        isVeg: true,
        isAvailable: true,
        preparationTime: 8,
        tags: ['cold', 'bestseller'],
    },
    {
        name: 'Gulab Jamun',
        description: 'Soft milk dumplings soaked in rose-flavored sugar syrup',
        category: 'desserts',
        isVeg: true,
        isAvailable: true,
        preparationTime: 5,
        tags: ['sweet', 'traditional'],
    },
    {
        name: 'Chocolate Brownie',
        description: 'Warm chocolate brownie served with vanilla ice cream',
        category: 'desserts',
        isVeg: true,
        isAvailable: true,
        preparationTime: 10,
        tags: ['chocolate', 'bestseller'],
    },
    {
        name: 'Thali Meal Combo',
        description: 'Complete meal with rice, 2 rotis, dal, sabzi, raita, and dessert',
        category: 'combos',
        isVeg: true,
        isAvailable: true,
        preparationTime: 20,
        tags: ['value', 'complete-meal'],
    },
    {
        name: 'Non-Veg Thali Combo',
        description: 'Complete meal with rice, 2 rotis, chicken curry, dal, raita, and dessert',
        category: 'combos',
        isVeg: false,
        isAvailable: true,
        preparationTime: 25,
        tags: ['value', 'complete-meal'],
    },
];

// Sample tables data - 1st Floor and 2nd Floor Canteens
const sampleTables = [
    // 1st Floor Canteen Tables
    { tableNumber: '1F-01', location: 'Window Side', canteenLocation: '1st Floor Canteen', capacity: 4 },
    { tableNumber: '1F-02', location: 'Window Side', canteenLocation: '1st Floor Canteen', capacity: 4 },
    { tableNumber: '1F-03', location: 'Center', canteenLocation: '1st Floor Canteen', capacity: 6 },
    { tableNumber: '1F-04', location: 'Near Counter', canteenLocation: '1st Floor Canteen', capacity: 2 },
    // 2nd Floor Canteen Tables
    { tableNumber: '2F-01', location: 'Balcony', canteenLocation: '2nd Floor Canteen', capacity: 4 },
    { tableNumber: '2F-02', location: 'Balcony', canteenLocation: '2nd Floor Canteen', capacity: 4 },
    { tableNumber: '2F-03', location: 'Indoor', canteenLocation: '2nd Floor Canteen', capacity: 6 },
    { tableNumber: '2F-04', location: 'Near Counter', canteenLocation: '2nd Floor Canteen', capacity: 2 },
];

// Default admin and staff accounts
const defaultUsers = [
    {
        name: 'Admin',
        email: 'admin@canteen.com',
        password: 'admin123',
        role: 'admin',
        isGuest: false,
        isActive: true,
    },
    {
        name: 'Staff 1F',
        email: 'staff1@canteen.com',
        password: 'staff123',
        role: 'staff',
        canteenLocation: '1st Floor Canteen',
        isGuest: false,
        isActive: true,
    },
    {
        name: 'Staff 2F',
        email: 'staff2@canteen.com',
        password: 'staff123',
        role: 'staff',
        canteenLocation: '2nd Floor Canteen',
        isGuest: false,
        isActive: true,
    },
];

// POST /api/seed - Seed database with sample data
export async function POST() {
    try {
        await connectToDatabase();

        // Clear existing data
        await MenuItem.deleteMany({});
        await Table.deleteMany({});
        await User.deleteMany({ role: { $in: ['staff', 'admin'] } });

        // Insert menu items
        await MenuItem.insertMany(sampleMenuItems);

        // Insert tables with generated QR codes
        const tablesWithQR = sampleTables.map(table => ({
            ...table,
            qrCode: generateTableCode(),
            isActive: true,
        }));
        await Table.insertMany(tablesWithQR);

        // Insert users with hashed passwords
        for (const user of defaultUsers) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await User.create({
                ...user,
                password: hashedPassword,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            data: {
                menuItems: sampleMenuItems.length,
                tables: sampleTables.length,
                users: defaultUsers.length,
            },
            credentials: {
                admin: { email: 'admin@canteen.com', password: 'admin123' },
                staff1f: { email: 'staff1@canteen.com', password: 'staff123' },
                staff2f: { email: 'staff2@canteen.com', password: 'staff123' },
            },
        });
    } catch (error) {
        console.error('Error seeding database:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, error: 'Failed to seed database', details: errorMessage },
            { status: 500 }
        );
    }
}
