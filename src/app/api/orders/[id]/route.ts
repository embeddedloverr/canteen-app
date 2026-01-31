import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Order from '@/models/Order';

// GET /api/orders/[id] - Get a single order
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const order = await Order.findById(id)
            .populate('table', 'tableNumber location');

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

// PATCH /api/orders/[id] - Update order status/details (Staff only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const body = await request.json();
        const { status, eta, staffNotes } = body;

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        // Update fields
        if (status) {
            order.status = status;

            // Set timestamps based on status
            if (status === 'accepted' && !order.acceptedAt) {
                order.acceptedAt = new Date();
            }
            if (status === 'ready' && !order.readyAt) {
                order.readyAt = new Date();
            }
            if (status === 'delivered' && !order.deliveredAt) {
                order.deliveredAt = new Date();
            }
        }

        if (eta) {
            // eta is minutes from now
            order.eta = new Date(Date.now() + eta * 60000);
        }

        if (staffNotes !== undefined) {
            order.staffNotes = staffNotes;
        }

        await order.save();

        // TODO: Emit real-time event for customer

        return NextResponse.json({
            success: true,
            data: order,
            message: 'Order updated successfully',
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update order' },
            { status: 500 }
        );
    }
}
