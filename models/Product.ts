import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  category: "ebook" | "template" | "course" | "software" | "graphics" | "other";
  tags: ("recommended" | "bestseller" | "new")[];
  price: number;
  originalPrice?: number;
  coverImage: string;
  rating: number;
  reviewCount: number;
  downloadFileUrl: string;
  fileType: string;
  fileSize: string;
  fileName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["ebook", "template", "course", "software", "graphics", "other"],
      index: true,
    },
    tags: [
      {
        type: String,
        enum: ["recommended", "bestseller", "new"],
      },
    ],
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    coverImage: { type: String, required: true },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    downloadFileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: String, required: true },
    fileName: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
