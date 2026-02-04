import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Order from '@/models/Order';
import { auth } from '@/lib/auth';

// POST /api/orders/cleanup - Delete orders older than 7 days (Admin/System)
export async function POST(request: NextRequest) {
    try {
        // Check admin authorization
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        await connectToDatabase();

        // Calculate date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Delete only delivered or cancelled orders older than 7 days
        const result = await Order.deleteMany({
            createdAt: { $lt: sevenDaysAgo },
            status: { $in: ['delivered', 'cancelled'] }
        });

        return NextResponse.json({
            success: true,
            data: {
                deletedCount: result.deletedCount,
                cutoffDate: sevenDaysAgo.toISOString()
            },
            message: `Successfully deleted ${result.deletedCount} old orders`,
        });
    } catch (error) {
        console.error('Error cleaning up orders:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to cleanup orders' },
            { status: 500 }
        );
    }
}
