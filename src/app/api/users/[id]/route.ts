import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import Canteen from '@/models/Canteen';
import { auth } from '@/lib/auth';

// GET /api/users/[id] - Get a single user
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const { id } = await params;
        const user = await User.findById(id).select('-password');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// PATCH /api/users/[id] - Update a user
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const { id } = await params;
        const body = await request.json();
        const { name, phone, canteenLocation, canteenId, isActive } = body;

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Update fields
        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;

        // Handle canteen update
        if (canteenId) {
            const canteen = await Canteen.findById(canteenId);
            if (!canteen) {
                return NextResponse.json(
                    { success: false, error: 'Invalid canteen ID' },
                    { status: 400 }
                );
            }
            user.canteen = canteen._id;
            user.canteenLocation = canteen.name;
        } else if (canteenLocation !== undefined) {
            // Fallback for string-only updates if needed, though UI should send canteenId
            user.canteenLocation = canteenLocation;
        }

        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        return NextResponse.json({
            success: true,
            data: user,
            message: 'User updated successfully',
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id] - Deactivate a user
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const { id } = await params;

        // Prevent self-deletion
        if (id === session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        const user = await User.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'User deactivated successfully',
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
