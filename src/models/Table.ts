import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITable extends Document {
    _id: mongoose.Types.ObjectId;
    tableNumber: string;
    qrCode: string;
    location?: string;
    canteenLocation: string;
    capacity?: number;
    isActive: boolean;
    createdAt: Date;
}

const TableSchema = new Schema<ITable>(
    {
        tableNumber: {
            type: String,
            required: [true, 'Table number is required'],
            unique: true,
            trim: true,
        },
        qrCode: {
            type: String,
            required: true,
            unique: true,
        },
        location: {
            type: String,
            trim: true,
            default: 'Main Hall',
        },
        canteenLocation: {
            type: String,
            required: [true, 'Canteen location is required'],
            trim: true,
            // enum removed to allow dynamic canteen names
            default: '1st Floor Canteen',
        },
        capacity: {
            type: Number,
            default: 4,
            min: [1, 'Capacity must be at least 1'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for QR code lookup
TableSchema.index({ qrCode: 1 });
TableSchema.index({ canteenLocation: 1 });

// Prevent model caching in development to allow schema updates


const Table: Model<ITable> = mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema);

export default Table;
