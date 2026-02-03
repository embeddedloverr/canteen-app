'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle, ChefHat, Truck, XCircle, Package } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { formatTime, getStatusLabel } from '@/lib/utils';
import type { Order } from '@/types';

interface OrderCardProps {
    order: Order;
    onSelect: (order: Order) => void;
    isDarkMode?: boolean;
}

const statusIcons = {
    pending: Clock,
    accepted: CheckCircle,
    preparing: ChefHat,
    ready: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
};

const statusColors = {
    pending: 'border-yellow-500 bg-yellow-500/10',
    accepted: 'border-blue-500 bg-blue-500/10',
    preparing: 'border-purple-500 bg-purple-500/10',
    ready: 'border-green-500 bg-green-500/10',
    delivered: 'border-gray-500 bg-gray-500/10',
    cancelled: 'border-red-500 bg-red-500/10',
};

export function OrderCard({ order, onSelect, isDarkMode = true }: OrderCardProps) {
    const Icon = statusIcons[order.status];
    const totalItems = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(order)}
            className="cursor-pointer"
        >
            <Card className={`p-4 border-l-4 ${statusColors[order.status]} hover:shadow-xl transition-all`}>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.orderNumber}</span>
                            <Badge
                                variant={
                                    order.status === 'pending' ? 'warning' :
                                        order.status === 'delivered' ? 'success' :
                                            order.status === 'cancelled' ? 'danger' :
                                                'info'
                                }
                            >
                                {getStatusLabel(order.status)}
                            </Badge>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{order.tableNumber}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-orange-500 font-bold">
                            <Package className="w-4 h-4" />
                            <span>{totalItems} items</span>
                        </div>
                        <p className="text-xs text-gray-500">{formatTime(order.createdAt)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                        <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.customerName}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{order.tableNumber}</p>
                    </div>
                </div>

                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{(order.items || []).length} item{(order.items || []).length > 1 ? 's' : ''}</span>
                    {' • '}
                    {(order.items || []).slice(0, 2).map(i => i.name).join(', ')}
                    {(order.items || []).length > 2 && ` +${order.items.length - 2} more`}
                </div>

                {order.eta && order.status !== 'delivered' && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-400">
                            ETA: {formatTime(order.eta)}
                        </span>
                    </div>
                )}

                {order.status === 'delivered' && order.deliveredAt && order.createdAt && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                            Delivered in {Math.round((new Date(order.deliveredAt).getTime() - new Date(order.createdAt).getTime()) / 60000)} minutes
                        </span>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}
