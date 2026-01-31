import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Canteen from '@/models/Canteen';

// GET /api/canteens/[id] - Get a single canteen
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const canteen = await Canteen.findById(id);

        if (!canteen) {
            return NextResponse.json(
                { success: false, error: 'Canteen not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: canteen,
        });
    } catch (error) {
        console.error('Error fetching canteen:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch canteen' },
            { status: 500 }
        );
    }
}

// PUT /api/canteens/[id] - Update a canteen
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const body = await request.json();

        const canteen = await Canteen.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!canteen) {
            return NextResponse.json(
                { success: false, error: 'Canteen not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: canteen,
            message: 'Canteen updated successfully',
        });
    } catch (error) {
        console.error('Error updating canteen:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update canteen' },
            { status: 500 }
        );
    }
}

// DELETE /api/canteens/[id] - Deactivate a canteen
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const canteen = await Canteen.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!canteen) {
            return NextResponse.json(
                { success: false, error: 'Canteen not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Canteen deactivated successfully',
        });
    } catch (error) {
        console.error('Error deactivating canteen:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to deactivate canteen' },
            { status: 500 }
        );
    }
}
