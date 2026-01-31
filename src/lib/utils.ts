import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDateTime(date: Date | string): string {
    return `${formatDate(date)} ${formatTime(date)}`;
}

export function generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}-${random}`;
}

export function generateTableCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-500',
        accepted: 'bg-blue-500',
        preparing: 'bg-purple-500',
        ready: 'bg-green-500',
        delivered: 'bg-gray-500',
        cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-400';
}

export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: 'Pending',
        accepted: 'Accepted',
        preparing: 'Preparing',
        ready: 'Ready for Pickup',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    };
    return labels[status] || status;
}
