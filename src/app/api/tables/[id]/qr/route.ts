import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import connectToDatabase from '@/lib/db/mongoose';
import Table from '@/models/Table';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// GET /api/tables/[id]/qr - Get QR code image as data URL
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

        // Generate QR code URL that points to menu page
        const menuUrl = `${APP_URL}/menu/${table.qrCode}`;

        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(menuUrl, {
            width: 512,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                qrDataUrl,
                menuUrl,
                tableNumber: table.tableNumber,
                location: table.location,
                canteenLocation: table.canteenLocation,
            },
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate QR code' },
            { status: 500 }
        );
    }
}
