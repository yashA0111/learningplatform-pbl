import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  interests: string[];
  completedCourses: mongoose.Types.ObjectId[] | string[];
  verified: boolean;
  otp?: string;
  otpExpiry?: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  interests: { type: [String], default: [] },
  completedCourses: { type: [Schema.Types.Mixed], default: [] },
  verified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
