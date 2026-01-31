import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Canteen from '@/models/Canteen';

// GET /api/canteens - Get all canteens
export async function GET() {
    try {
        await connectToDatabase();

        const canteens = await Canteen.find().sort({ createdAt: 1 });

        return NextResponse.json({
            success: true,
            data: canteens,
        });
    } catch (error) {
        console.error('Error fetching canteens:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch canteens' },
            { status: 500 }
        );
    }
}

// POST /api/canteens - Create a new canteen
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { name, location } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Canteen name is required' },
                { status: 400 }
            );
        }

        const canteen = await Canteen.create({
            name,
            location,
        });

        return NextResponse.json({
            success: true,
            data: canteen,
            message: 'Canteen created successfully',
        }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating canteen:', error);
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json(
                { success: false, error: 'A canteen with this name already exists' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to create canteen' },
            { status: 500 }
        );
    }
}
