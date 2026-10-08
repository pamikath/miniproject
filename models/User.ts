import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  supabaseId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: "user" | "admin";
  rewardPoints: number;
  wishlist: mongoose.Types.ObjectId[];
  ordersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    supabaseId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, default: "Pamika Thamnamuang" },
    avatarUrl: { type: String, default: "https://i.pinimg.com/736x/2f/d2/1b/2fd21bd35fbe51140cb7d534b157ce2d.jpg" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    rewardPoints: { type: Number, default: 120 },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    ordersCount: { type: Number, default: 3 },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
