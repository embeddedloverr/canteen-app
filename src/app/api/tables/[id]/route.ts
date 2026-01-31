import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import connectToDatabase from '@/lib/db/mongoose';
import Table from '@/models/Table';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// GET /api/tables/[id] - Get a single table
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const table = await Table.findById(id);

        if (!table) {
            return NextResponse.json(
                { success: false, error: 'Table not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: table,
        });
    } catch (error) {
        console.error('Error fetching table:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch table' },
            { status: 500 }
        );
    }
}

// GET /api/tables/[id]/qr - Get QR code image for a table
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const body = await request.json();

        const table = await Table.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!table) {
            return NextResponse.json(
                { success: false, error: 'Table not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: table,
            message: 'Table updated successfully',
        });
    } catch (error) {
        console.error('Error updating table:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update table' },
            { status: 500 }
        );
    }
}

// DELETE /api/tables/[id] - Deactivate a table
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const table = await Table.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!table) {
            return NextResponse.json(
                { success: false, error: 'Table not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Table deactivated successfully',
        });
    } catch (error) {
        console.error('Error deactivating table:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to deactivate table' },
            { status: 500 }
        );
    }
}
