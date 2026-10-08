import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  category: string;
  price: number;
  coverImage: string;
  downloadUrl?: string;
  fileName?: string;
}

export interface IOrder extends Document {
  orderNumber: string; // e.g. #LB20240615
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  items: IOrderItem[];
  totalAmount: number;
  discount: number;
  netAmount: number;
  status: "pending_payment" | "processing" | "completed" | "cancelled";
  paymentMethod: "stripe" | "promptpay" | "credit_card";
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        title: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        coverImage: { type: String, required: true },
        downloadUrl: { type: String },
        fileName: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending_payment", "processing", "completed", "cancelled"],
      default: "pending_payment",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "promptpay", "credit_card"],
      default: "stripe",
    },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
