import raffleService from '../../services/raffleService';

const getRaffles = async (req, res) => {
  const result = await raffleService.getRaffles();
  return res.json(result);
}

const getRaffle = async (req, res) => {
  const { id } = req.params;
  const result = await raffleService.getRaffle(id);
  return res.json(result);
}

const createRaffle = async (req, res) => {
  const result = await raffleService.createRaffle({
    ...req.body,
    total_tickets: req.body.total_tickets !== 'null' ? Number(req.body.total_tickets) : null
  });
  return res.json(result);
}

const updateRaffle = async (req, res) => {
  const { id } = req.params;
  const result = await raffleService.updateRaffle(id, {
    image: req.file?.filename,
    ...req.body,
    total_tickets: req.body.total_tickets !== 'null' ? Number(req.body.total_tickets) : null
  });
  return res.json(result);
}

const deleteRaffle = async (req, res) => {
  const { id } = req.params;
  const result = await raffleService.deleteRaffle(id);
  return res.json(result);
}

export default {
  getRaffles,
  getRaffle,
  createRaffle,
  updateRaffle,
  deleteRaffle
}