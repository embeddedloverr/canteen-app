import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface User {
        id: string;
        role: string;
        canteenLocation?: string;
    }

    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            canteenLocation?: string;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: string;
        canteenLocation?: string;
    }
}
