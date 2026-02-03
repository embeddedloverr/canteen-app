'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, UtensilsCrossed, QrCode, BarChart3, Settings, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/admin/canteens', label: 'Canteens', icon: Building2 },
    { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/admin/tables', label: 'Tables & QR', icon: QrCode },
    { href: '/admin/staff', label: 'Staff', icon: Users },
    { href: '/staff', label: 'Staff Dashboard', icon: BarChart3 },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                                <UtensilsCrossed className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-white">Canteen Admin</span>
                        </Link>

                        <div className="flex items-center gap-1">
                            {navItems.map(item => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href ||
                                    (item.href !== '/' && pathname.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-orange-500/20 text-orange-400'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>{children}</main>
        </div>
    );
}
