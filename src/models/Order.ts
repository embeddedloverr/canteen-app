import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
    menuItem: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    specialInstructions?: string;
}

export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId;
    orderNumber: string;
    customerName: string;
    table: mongoose.Types.ObjectId;
    tableNumber: string;
    canteenLocation?: string;
    items: IOrderItem[];
    status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    eta?: Date;
    acceptedAt?: Date;
    readyAt?: Date;
    deliveredAt?: Date;
    staffNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
    {
        menuItem: {
            type: Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
        },
        specialInstructions: {
            type: String,
            maxlength: [200, 'Special instructions cannot exceed 200 characters'],
        },
    },
    { _id: false }
);

const OrderSchema = new Schema<IOrder>(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        customerName: {
            type: String,
            default: 'Guest',
        },
        table: {
            type: Schema.Types.ObjectId,
            ref: 'Table',
            required: true,
        },
        tableNumber: {
            type: String,
            required: true,
        },
        canteenLocation: {
            type: String,
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: function (items: IOrderItem[]) {
                    return items.length > 0;
                },
                message: 'Order must have at least one item',
            },
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'],
            default: 'pending',
        },
        eta: {
            type: Date,
        },
        acceptedAt: {
            type: Date,
        },
        readyAt: {
            type: Date,
        },
        deliveredAt: {
            type: Date,
        },
        staffNotes: {
            type: String,
            maxlength: [500, 'Staff notes cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for common queries
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ canteenLocation: 1, status: 1 });
OrderSchema.index({ table: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
