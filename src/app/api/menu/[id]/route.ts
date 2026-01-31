import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import MenuItem from '@/models/MenuItem';

// GET /api/menu/[id] - Get a single menu item
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const menuItem = await MenuItem.findById(id);

        if (!menuItem) {
            return NextResponse.json(
                { success: false, error: 'Menu item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: menuItem,
        });
    } catch (error) {
        console.error('Error fetching menu item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch menu item' },
            { status: 500 }
        );
    }
}

// PUT /api/menu/[id] - Update a menu item (Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const body = await request.json();

        const menuItem = await MenuItem.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!menuItem) {
            return NextResponse.json(
                { success: false, error: 'Menu item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: menuItem,
            message: 'Menu item updated successfully',
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update menu item' },
            { status: 500 }
        );
    }
}

// DELETE /api/menu/[id] - Delete a menu item (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const menuItem = await MenuItem.findByIdAndDelete(id);

        if (!menuItem) {
            return NextResponse.json(
                { success: false, error: 'Menu item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Menu item deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete menu item' },
            { status: 500 }
        );
    }
}
