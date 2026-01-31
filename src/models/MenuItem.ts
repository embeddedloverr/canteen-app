import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenuItem extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    category: string;
    image?: string;
    isVeg: boolean;
    isAvailable: boolean;
    preparationTime: number;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
    {
        name: {
            type: String,
            required: [true, 'Item name is required'],
            trim: true,
            maxlength: [100, 'Name cannot be more than 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: [500, 'Description cannot be more than 500 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['starters', 'main-course', 'beverages', 'desserts', 'snacks', 'combos'],
        },
        image: {
            type: String,
            default: null,
        },
        isVeg: {
            type: Boolean,
            default: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        preparationTime: {
            type: Number,
            default: 15, // in minutes
            min: [1, 'Preparation time must be at least 1 minute'],
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for common queries
MenuItemSchema.index({ category: 1, isAvailable: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });

const MenuItem: Model<IMenuItem> = mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;
