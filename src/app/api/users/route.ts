import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import Canteen from '@/models/Canteen';
import { auth } from '@/lib/auth';

// GET /api/users - Get all staff users (admin only)
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const users = await User.find({ role: { $in: ['staff', 'admin'] } })
            .select('-password')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// POST /api/users - Create a new staff account (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const body = await request.json();
        const { name, email, password, phone, role, canteenLocation } = body;

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Validate role
        if (role && !['staff', 'admin'].includes(role)) {
            return NextResponse.json(
                { success: false, error: 'Invalid role' },
                { status: 400 }
            );
        }

        // Validate canteen location/id for staff
        let resolvedCanteenLocation = canteenLocation;
        let canteenId = undefined;

        if (role === 'staff') {
            if (body.canteenId) {
                const canteen = await Canteen.findById(body.canteenId);
                if (!canteen) {
                    return NextResponse.json(
                        { success: false, error: 'Invalid canteen ID' },
                        { status: 400 }
                    );
                }
                canteenId = canteen._id;
                resolvedCanteenLocation = canteen.name;
            } else if (canteenLocation) {
                // Fallback for legacy hardcoded locations or if just name is sent
                // Ideally we want to move away from this, but keep for now or validate against DB if needed
                // For now, if we have dynamic canteens, we might want to ensure the name exists?
                // Let's stick to the plan: if canteenId sent, use it.
            }
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: role || 'staff',
            canteenLocation: role === 'staff' ? resolvedCanteenLocation : undefined,
            canteen: canteenId,
            isGuest: false,
            isActive: true,
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return NextResponse.json({
            success: true,
            data: userResponse,
            message: 'Staff account created successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
