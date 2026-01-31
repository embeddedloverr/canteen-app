import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
    providers: [], // Providers configured in auth.ts for Node.js environment
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.canteenLocation = user.canteenLocation;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.canteenLocation = token.canteenLocation as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
};
