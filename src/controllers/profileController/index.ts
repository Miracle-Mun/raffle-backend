import profileService from '../../services/profileService';

const createProfile = async (req, res) => {
  const result = await profileService.createProfile(req.body);
  return res.json(result);
}

const updateProfile = async (req, res) => {
  const result = await profileService.updateProfile(req.body);
  return res.json(result);
}

const getProfile = async (req, res) => {
  const { id } = req.params;
  console.log('id', id)
  const result = await profileService.getProfile({
    id,
    ...req.body
  });
  return res.json(result);

}

export default {
  createProfile,
  updateProfile,
  getProfile
}