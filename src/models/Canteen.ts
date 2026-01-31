import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICanteen extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    location?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CanteenSchema = new Schema<ICanteen>(
    {
        name: {
            type: String,
            required: [true, 'Canteen name is required'],
            unique: true,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
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

const Canteen: Model<ICanteen> = mongoose.models.Canteen || mongoose.model<ICanteen>('Canteen', CanteenSchema);

export default Canteen;
