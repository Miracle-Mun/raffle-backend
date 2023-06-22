import { model, Schema, models, Model } from 'mongoose';

export interface Profile {
  id: string | null,
  birthday: string | null,
  dreamNft: string | null,
  dreamvacation: string | null,
  travel: string | null,
  kindWatch: string | null,
  kindPet: string | null,
  walletAddress: string | null
}

const Profile: Schema<Profile> = new Schema<Profile>({
  id: { type: String, required: true, unique: true },
  birthday: { type: String, required: true },
  dreamNft: { type: String, required: true },
  dreamvacation: { type: String, required: true },
  travel: { type: String, required: true },
  kindWatch: { type: String, required: true },
  kindPet: { type: String, required: true },
  walletAddress: { type: String, required: true },
})


const ProfileModel: Model<Profile> = models['profile'] || model<Profile>('profile', Profile);
export default ProfileModel;
