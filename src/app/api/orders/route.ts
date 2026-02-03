import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Order from '@/models/Order';
import MenuItem from '@/models/MenuItem';
import Table from '@/models/Table';
import { generateOrderNumber } from '@/lib/utils';
import { auth } from '@/lib/auth';

// GET /api/orders - Get orders (filtered by role/user)
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const customerId = searchParams.get('customerId');
        const tableId = searchParams.get('tableId');
        const canteenLocation = searchParams.get('canteenLocation');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Build query
        const query: Record<string, unknown> = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (customerId) {
            query.customer = customerId;
        }

        if (tableId) {
            query.table = tableId;
        }

        if (canteenLocation) {
            query.canteenLocation = canteenLocation;
        }

        // Staff restriction: Only show orders for their assigned canteen AND created today
        const session = await auth();
        if (session?.user?.role === 'staff') {
            if (session.user.canteenLocation) {
                query.canteenLocation = session.user.canteenLocation;
            }

            // Filter for today's orders (local time approximation or UTC day)
            // Using setHours(0,0,0,0) might be tricky with timezone if server/client differ.
            // For simplicity and robustness, let's grab last 24 hours or just start of today based on server time.
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query.createdAt = { $gte: today };
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('table', 'tableNumber location');

        return NextResponse.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { tableId, customerName, items } = body;

        // Validate table exists
        const table = await Table.findById(tableId);
        if (!table || !table.isActive) {
            return NextResponse.json(
                { success: false, error: 'Invalid or inactive table' },
                { status: 400 }
            );
        }

        // Validate and get menu items
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItemId);
            if (!menuItem) {
                return NextResponse.json(
                    { success: false, error: `Menu item not found: ${item.menuItemId}` },
                    { status: 400 }
                );
            }
            if (!menuItem.isAvailable) {
                return NextResponse.json(
                    { success: false, error: `${menuItem.name} is currently unavailable` },
                    { status: 400 }
                );
            }

            orderItems.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                quantity: item.quantity,
                specialInstructions: item.specialInstructions,
            });
        }

        // Create order - no customer account needed, just name
        const order = await Order.create({
            orderNumber: generateOrderNumber(),
            customerName: customerName || 'Guest',
            table: table._id,
            tableNumber: table.tableNumber,
            canteenLocation: table.canteenLocation, // Strictly use the canteen location defined in the table
            items: orderItems,
            status: 'pending',
        });

        // TODO: Emit real-time event for staff

        return NextResponse.json({
            success: true,
            data: order,
            message: 'Order placed successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
