import { Schema, model, models } from "mongoose";

export interface IUserProfile {
  email: string;
  name: string;
  country: string;
  investmentGoals: string;
  riskTolerance: string;
  preferredIndustry: string;
  createdAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  country: { type: String, required: true },
  investmentGoals: { type: String, required: true },
  riskTolerance: { type: String, required: true },
  preferredIndustry: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UserProfile =
  models.UserProfile || model<IUserProfile>("UserProfile", UserProfileSchema);

export default UserProfile;
