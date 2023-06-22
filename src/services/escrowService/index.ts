import { PublicKey } from "@solana/web3.js"
import CONFIG from "../../config";
import { 
  makeDepositCoinTx,
  makeWithdrawCoinTx,
  makeDepositTokenTx,
  makeWithdrawTokenTx,
  parseTx,
} from '../../helpers/contract/escrow'

const { PROGRAM_ID, ESCROW_SEEDS } = CONFIG;
const depositCoinTx = async (employeer: string, amount: number, jobId: string) => {
  try {
    const transaction = await makeDepositCoinTx(
      new PublicKey(employeer), amount, jobId
    );

    return { 
      tx: transaction.serialize({requireAllSignatures: false, verifySignatures: false})
    };
  }
  catch (error) {
    console.log('error', error)
  }

  return null;
}

const withdrawCoinTx = async (employeer: string, employee: string, amount: number, jobId: string) => {
  try {
    const transaction = await makeWithdrawCoinTx(
      new PublicKey(employeer), new PublicKey(employee), amount, jobId
    );

    return { 
      tx: transaction.serialize({requireAllSignatures: false, verifySignatures: false})
    };
  }
  catch (error) {
    console.log('error', error)
  }

  return null;
}

const depositTokenTx = async (employeer: string, mint: string, decimal: number, amount: number, jobId: string) => {
  try {
    const transaction = await makeDepositTokenTx(
      new PublicKey(employeer), new PublicKey(mint), decimal, amount, jobId
    );

    return { 
      tx: transaction.serialize({requireAllSignatures: false, verifySignatures: false})
    };
  }
  catch (error) {
    console.log('error', error)
  }

  return null;
}

const withdrawTokenTx = async (employeer: string, employee: string, mint: string, decimal: number, amount: number, jobId: string) => {
  try {
    const transaction = await makeWithdrawTokenTx(
      new PublicKey(employeer), new PublicKey(employee), new PublicKey(mint), decimal, amount, jobId
    );

    return { 
      tx: transaction.serialize({requireAllSignatures: false, verifySignatures: false})
    };
  }
  catch (error) {
    console.log('error', error)
  }

  return null;
}

const depositCoin = async (signature: string, employeer: string, jobId: string) => {
  try {
    const result = await parseTx(signature);
    if (!result) return false;
    
    const [escrow] = await PublicKey.findProgramAddress( [
      Buffer.from(ESCROW_SEEDS),
      new PublicKey(employeer).toBuffer(),
      Buffer.from(jobId)
    ], new PublicKey(PROGRAM_ID));

    const isProgram = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === PROGRAM_ID);
    if (!isProgram) return false;

    const isEmployeer = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === employeer);
    if (!isEmployeer) return false;

    const isEscrow = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === escrow.toString());
    if (!isEscrow) return false;

    const isDeposit = result.meta.logMessages.find(message => message === 'Program log: Instruction: DepositCoin');
    if (!isDeposit) return false;

    return true;
  }
  catch (error) {
    console.log('error', error);
  }

  return false;
}


const withdrawCoin = async (signature: string, employeer: string, employee: string, jobId: string) => {
  try {
    const result = await parseTx(signature);
    if (!result) return false;
    
    const [escrow] = await PublicKey.findProgramAddress( [
      Buffer.from(ESCROW_SEEDS),
      new PublicKey(employeer).toBuffer(),
      Buffer.from(jobId)
    ], new PublicKey(PROGRAM_ID));

    const isProgram = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === PROGRAM_ID);
    if (!isProgram) return false;

    const isEmployeer = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === employeer);
    if (!isEmployeer) return false;

    const isEmployee = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === employee);
    if (!isEmployee) return false;


    const isEscrow = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === escrow.toString());
    if (!isEscrow) return false;

    const isWithdraw = result.meta.logMessages.find(message => message === 'Program log: Instruction: WithdrawCoin');
    if (!isWithdraw) return false;

    return true;
  }
  catch (error) {
    console.log('error', error);
  }
  return null;
}

const depositToken = async (signature: string, employeer: string, mint: string, jobId: string) => {
  try {
    const result = await parseTx(signature);
    if (!result) return false;
    
    const [escrow] = await PublicKey.findProgramAddress( [
      Buffer.from(ESCROW_SEEDS),
      new PublicKey(employeer).toBuffer(),
      Buffer.from(jobId)
    ], new PublicKey(PROGRAM_ID));

    const isProgram = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === PROGRAM_ID);
    if (!isProgram) return false;

    const isEmployeer = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === employeer);
    if (!isEmployeer) return false;

    const isEscrow = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === escrow.toString());
    if (!isEscrow) return false;

    const isMint = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === mint);
    if (!isMint) return false;

    const isDeposit = result.meta.logMessages.find(message => message === 'Program log: Instruction: DepositToken');
    if (!isDeposit) return false;
    return true;
  }
  catch (error) {
    console.log('error', error);
  }
  return null;
}


const withdrawToken = async (signature: string, employeer: string, employee: string, mint: string, jobId: string) => {
  try {
    const result = await parseTx(signature);
    if (!result) return false;

    const [escrow] = await PublicKey.findProgramAddress( [
      Buffer.from(ESCROW_SEEDS),
      new PublicKey(employeer).toBuffer(),
      Buffer.from(jobId)
    ], new PublicKey(PROGRAM_ID));

    const isProgram = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === PROGRAM_ID);
    if (!isProgram) return false;

    const isEmployeer = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === employeer);
    if (!isEmployeer) return false;

    const isEmployee = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === employee);
    if (!isEmployee) return false;

    const isEscrow = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === escrow.toString());
    if (!isEscrow) return false;

    const isMint = result.transaction.message.accountKeys.find((key) => key.pubkey.toString() === mint);
    if (!isMint) return false;

    const isWithdraw = result.meta.logMessages.find(message => message === 'Program log: Instruction: WithdrawToken');
    if (!isWithdraw) return false;
    return true;
  }
  catch (error) {
    console.log('error', error);
  }
  return null;
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