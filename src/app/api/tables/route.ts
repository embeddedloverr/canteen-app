import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Table from '@/models/Table';
import { generateTableCode } from '@/lib/utils';

// GET /api/tables - Get all tables
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const canteenLocation = searchParams.get('canteenLocation');

        const query: Record<string, unknown> = {};
        if (canteenLocation) {
            query.canteenLocation = canteenLocation;
        }

        const tables = await Table.find(query).sort({ canteenLocation: 1, tableNumber: 1 });

        return NextResponse.json({
            success: true,
            data: tables,
        });
    } catch (error) {
        console.error('Error fetching tables:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch tables' },
            { status: 500 }
        );
    }
}

// POST /api/tables - Create a new table with QR code
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { tableNumber, location, canteenLocation, capacity } = body;

        // Validate canteen location - Removed hardcoded check to support dynamic canteens
        if (!canteenLocation) {
            return NextResponse.json(
                { success: false, error: 'Canteen location is required.' },
                { status: 400 }
            );
        }

        // Check if table number already exists
        const existingTable = await Table.findOne({ tableNumber });
        if (existingTable) {
            return NextResponse.json(
                { success: false, error: 'Table number already exists' },
                { status: 400 }
            );
        }

        // Generate unique QR code identifier
        const qrCode = generateTableCode();

        // Create table
        const table = await Table.create({
            tableNumber,
            qrCode,
            location,
            canteenLocation: canteenLocation || '1st Floor Canteen',
            capacity,
            isActive: true,
        });

        return NextResponse.json({
            success: true,
            data: table,
            message: 'Table created successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating table:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create table' },
            { status: 500 }
        );
    }
}
