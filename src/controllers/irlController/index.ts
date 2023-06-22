import irlService from "../../services/irlService";

const createIrl = async (req, res) => {
  const result = await irlService.createIrl({
    ...req.body,
    image: req.body?.image
    // image: req.file?.filename,
  });
  return res.json(result);
}

export default {
  createIrl,
}