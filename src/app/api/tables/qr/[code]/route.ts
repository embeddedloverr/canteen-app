import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Table from '@/models/Table';

// GET /api/tables/qr/[code] - Get table by QR code
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        await connectToDatabase();

        const { code } = await params;
        const table = await Table.findOne({ qrCode: code, isActive: true });

        if (!table) {
            return NextResponse.json(
                { success: false, error: 'Table not found or inactive' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: table,
        });
    } catch (error) {
        console.error('Error fetching table by QR code:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch table' },
            { status: 500 }
        );
    }
}
