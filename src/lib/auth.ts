import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/lib/auth.config';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await connectToDatabase();

                const user = await User.findOne({
                    email: credentials.email,
                    isActive: true,
                }).select('+password');

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await user.comparePassword(credentials.password as string);

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    canteenLocation: user.canteenLocation,
                };
            },
        }),
    ],
});
