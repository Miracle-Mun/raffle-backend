import escrowService from '../../services/escrowService';

const depositCoinTx = async (req, res) => {
  const { employeer, amount, jobId } = req.body;
  const result = await escrowService.depositCoinTx(employeer, amount, jobId);
  return res.json(result);
}

const withdrawCoinTx = async (req, res) => {
  const { employeer, employee, amount, jobId } = req.body;
  const result = await escrowService.withdrawCoinTx(employeer, employee, amount, jobId);
  return res.json(result);
}


const depositTokenTx = async (req, res) => {
  const { employeer, mint, amount, jobId, decimal } = req.body;
  const result = await escrowService.depositTokenTx(employeer, mint, decimal, amount, jobId);
  return res.json(result);
}

const withdrawTokenTx = async (req, res) => {
  const { employeer, employee, mint, decimal, amount, jobId } = req.body;
  const result = await escrowService.withdrawTokenTx(employeer, employee, mint, decimal, amount, jobId);
  return res.json(result);
}

const depositCoin = async (req, res) => {
  const { employeer, jobId, signature } = req.body;
  const result = await escrowService.depositCoin(signature, employeer, jobId);
  return res.json(result);
}

const withdrawCoin = async (req, res) => {
  const { employeer, employee, jobId, signature } = req.body;
  const result = await escrowService.withdrawCoin(signature, employeer, employee, jobId);
  return res.json(result);
}


const depositToken = async (req, res) => {
  const { employeer, mint, jobId, signature } = req.body;
  const result = await escrowService.depositToken(signature, employeer, mint, jobId);
  return res.json(result);
}

const withdrawToken = async (req, res) => {
  const { employeer, employee, mint, jobId, signature } = req.body;
  const result = await escrowService.withdrawToken(signature, employeer, employee, mint, jobId);
  return res.json(result);
}

export default {
  depositCoinTx,
  withdrawCoinTx,
  depositTokenTx,
  withdrawTokenTx,
  depositCoin,
  withdrawCoin,
  depositToken,
  withdrawToken
}