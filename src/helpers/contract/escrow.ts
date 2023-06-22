import * as anchor from '@project-serum/anchor'
import { 
  Connection, 
  Keypair, 
  Commitment, 
  ConnectionConfig, 
  SystemProgram, 
  Transaction, 
  TransactionInstruction,
  PublicKey,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';

import CONFIG from '../../config'
import { makeTransaction } from '../solana/connection';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { delay, INTERVAL, LOOP, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from '../utils';
import RewardNftModel from '../../models/rewardNft';
const {
  ADMIN,
  IDL,
  CLUSTER_API,
  PROGRAM_ID,
  ESCROW_SEEDS
} = CONFIG;

const connection = new Connection(CLUSTER_API, {
  skipPreflight: true,
  preflightCommitment: 'confirmed' as Commitment,
} as ConnectionConfig);

const ADMIN_WALLET = Keypair.fromSeed(Uint8Array.from(ADMIN).slice(0, 32));

const provider = new anchor.AnchorProvider(connection, new NodeWallet(ADMIN_WALLET), {
  skipPreflight: true,
  preflightCommitment: 'confirmed' as Commitment,
} as ConnectionConfig)

const program = new anchor.Program(IDL, PROGRAM_ID, provider);

export const makeDepositCoinTx = async (
  employeer: anchor.web3.PublicKey,
  amount: number,
  jobId: string
): Promise<Transaction> => {

  try {
    const [escrow] = await PublicKey.findProgramAddress( [
      Buffer.from(ESCROW_SEEDS),
      employeer.toBuffer(),
      Buffer.from(jobId)
    ], new PublicKey(PROGRAM_ID));

    console.log('escrow', escrow.toString());
    let instructions: TransactionInstruction[] = [];
    let signers: Keypair[] = [];

    instructions.push(program.instruction.depositCoin(jobId, Math.floor(amount), (amount - Math.floor(amount)) * LAMPORTS_PER_SOL, {
      accounts: {
        escrow: escrow,
        admin: ADMIN_WALLET.publicKey,
        employeer: employeer,
        systemProgram: SystemProgram.programId
      }
    }));

    signers.push(ADMIN_WALLET);

    const transaction = await makeTransaction(connection, instructions, signers, employeer);

    return transaction;
  }
  catch (error) {
    console.log('error', error);
  }

  return null;
};

export const makeWithdrawCoinTx = async (
  employeer: anchor.web3.PublicKey,
  employee: anchor.web3.PublicKey,
  amount: number,
  jobId: string
): Promise<Transaction> => {

  try {
    const [escrow] = await PublicKey.findProgramAddress( [
      Buffer.from(ESCROW_SEEDS),
      employeer.toBuffer(),
      Buffer.from(jobId)
    ], new PublicKey(PROGRAM_ID));

    let instructions: TransactionInstruction[] = [];
    let signers: Keypair[] = [];

    instructions.push(program.instruction.withdrawCoin(Math.floor(amount), (amount - Math.floor(amount)) * LAMPORTS_PER_SOL, {
      accounts: {
        escrow: escrow,
        admin: ADMIN_WALLET.publicKey,
        employeer: employeer,
        employee: employee,
        systemProgram: SystemProgram.programId
      }
    }));

    signers.push(ADMIN_WALLET);

    const transaction = await makeTransaction(connection, instructions, signers, employeer);

    return transaction;
  }
  catch (error) {
    console.log('error', error);
  }

  return null;
};


export const makeDepositTokenTx = async (
  employeer: anchor.web3.PublicKey,
  mint: anchor.web3.PublicKey,
  decimal: number,
  amount: number,
  jobId: string
): Promise<Transaction> => {

  try {
    const [escrow] = await PublicKey.findProgramAddress( [
      Buffer.from(ESCROW_SEEDS),
      employeer.toBuffer(),
      Buffer.from(jobId)
    ], new PublicKey(PROGRAM_ID));

    let instructions: TransactionInstruction[] = [];
    let signers: Keypair[] = [];

    let ataFrom = await getAssociatedTokenAddress(mint, employeer);
    const ataFromInfo = await connection.getAccountInfo(ataFrom);
    if (!ataFromInfo) {
      const aTokenAccounts = await connection.getParsedTokenAccountsByOwner(employeer, { mint: mint });
      if (aTokenAccounts.value.length === 0) {
        return null;
      }
      ataFrom = aTokenAccounts.value[0].pubkey;
    }

    const ataTo = await getAssociatedTokenAddress(mint, escrow, true);
    const ataToInfo = await connection.getAccountInfo(ataTo);

    if (!ataToInfo) {
      instructions.push(createAssociatedTokenAccountInstruction(employeer, ataTo, escrow, mint))
    }

    instructions.push(program.instruction.depositToken(
      jobId, 
      Math.floor(amount), 
      (amount - Math.floor(amount)) * Math.pow(10, decimal), 
      decimal,  {
        accounts: {
          escrow: escrow,
          admin: ADMIN_WALLET.publicKey,
          mint: mint,
          tokenFrom: ataFrom,
          tokenTo: ataTo,
          employeer: employeer,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID
        }
      })
    );

    signers.push(ADMIN_WALLET);

    const transaction = await makeTransaction(connection, instructions, signers, employeer);

    return transaction;
  }
  catch (error) {
    console.log('error', error);
  }

  return null;
};

export const makeWithdrawTokenTx = async (
  employeer: anchor.web3.PublicKey,
  employee: anchor.web3.PublicKey,
  mint: anchor.web3.PublicKey,
  decimal: number,
  amount: number,
  jobId: string
): Promise<Transaction> => {

  try {
    const [escrow] = await PublicKey.findProgramAddress( [
      Buffer.from(ESCROW_SEEDS),
      employeer.toBuffer(),
      Buffer.from(jobId)
    ], new PublicKey(PROGRAM_ID));

    let instructions: TransactionInstruction[] = [];
    let signers: Keypair[] = [];

    let ataFrom = await getAssociatedTokenAddress(mint, escrow, true);
    const ataFromInfo = await connection.getAccountInfo(ataFrom);
    if (!ataFromInfo) {
      const aTokenAccounts = await connection.getParsedTokenAccountsByOwner(escrow, { mint: mint });
      if (aTokenAccounts.value.length === 0) {
        return null;
      }
      ataFrom = aTokenAccounts.value[0].pubkey;
    }

    const ataTo = await getAssociatedTokenAddress(mint, employee, true);
    const ataToInfo = await connection.getAccountInfo(ataTo);

    if (!ataToInfo) {
      instructions.push(createAssociatedTokenAccountInstruction(employeer, ataTo, employee, mint))
    }

    instructions.push(program.instruction.withdrawToken(
      jobId,
      Math.floor(amount), 
      (amount - Math.floor(amount)) * Math.pow(10, decimal), 
      decimal,  {
        accounts: {
          escrow: escrow,
          admin: ADMIN_WALLET.publicKey,
          mint: mint,
          tokenFrom: ataFrom,
          tokenTo: ataTo,
          employeer: employeer,
          employee: employee,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID
        }
      })
    );

    signers.push(ADMIN_WALLET);

    const transaction = await makeTransaction(connection, instructions, signers, employeer);

    return transaction;
  }
  catch (error) {
    console.log('error', error);
  }

  return null;
};

export const parseTx = async (signature: string) => {
  try {
    let parsedTxn = await connection.getParsedTransaction(signature)
    if (!parsedTxn) {
      for (let i = 0; i < LOOP; i ++) {
        await delay(INTERVAL);
        parsedTxn = await connection.getParsedTransaction(signature);
        if (parsedTxn) break;
      }
    }
    if (!parsedTxn || !parsedTxn.meta || parsedTxn.meta.err) {
      return null;
    }

    return parsedTxn;
  }
  catch (error) {
    console.log('error', error);
  }

  return null;


  
}
