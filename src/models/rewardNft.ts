import { model, Schema, models } from 'mongoose';

export interface RewardNft {
  address: string,
  status: number
}

const RewardNft: Schema = new Schema({
  address: {type: String, unique: true},
  status: {type: Number, default: 0}
})


export default models['rewardNft'] || model<RewardNft>('reward_nfts', RewardNft);
