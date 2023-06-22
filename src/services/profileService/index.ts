import ProfileModel from '../../models/profile';
import { Profile } from '../../models/profile';

const getProfile = async (data: Profile) => {
  try {
    const { id } = data
    let ProfileId = await ProfileModel.findOne({
      walletAddress: id
    });

    return ProfileId

    // if (ProfileId) {
    //   Object.keys(data).map(key => {
    //     ProfileId[key] = data[key];
    //   })

    //   await ProfileId.save()
    //   return ProfileId

    // } else {
    //   const Profile = new ProfileModel(data);
    //   await Profile.save();
    //   return Profile;
    // }

  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}

const updateProfile = async (data: Profile) => {
  try {
    let ProfileId = await ProfileModel.findOne({
      walletAddress: data.walletAddress
    });
    if (ProfileId) {
      Object.keys(data).map(key => {
        ProfileId[key] = data[key];
      })

      await ProfileId.save()
      return ProfileId
    }
  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}

const createProfile = async (data: Profile) => {
  try {
    console.log('data', data)
    const Profile = new ProfileModel(data);
    await Profile.save();
    return Profile;

  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}


export default {
  getProfile,
  createProfile,
  updateProfile
}