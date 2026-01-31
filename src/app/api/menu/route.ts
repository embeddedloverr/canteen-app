import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import MenuItem from '@/models/MenuItem';

// GET /api/menu - Get all menu items
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const available = searchParams.get('available');

        // Build query
        const query: Record<string, unknown> = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (available === 'true') {
            query.isAvailable = true;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

        return NextResponse.json({
            success: true,
            data: menuItems,
        });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch menu items' },
            { status: 500 }
        );
    }
}

// POST /api/menu - Create a new menu item (Admin only)
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();

        const menuItem = await MenuItem.create(body);

        return NextResponse.json({
            success: true,
            data: menuItem,
            message: 'Menu item created successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create menu item' },
            { status: 500 }
        );
    }
}
