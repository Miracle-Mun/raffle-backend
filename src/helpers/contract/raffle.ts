import * as anchor from '@project-serum/anchor'
import {
  Connection,
  Keypair,
  Commitment,
  ConnectionConfig,
  SystemProgram,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_SLOT_HASHES_PUBKEY,
  SYSVAR_SLOT_HISTORY_PUBKEY
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

import CONFIG from '../../config'
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

const {
  WINNER_WALLET,
  ADMIN_WALLET_PUB,
  CLUSTER_API
} = CONFIG;

const { IDL, PROGRAM_ID, POOL_SEED, PAY_TOKEN_DECIMAL } = CONFIG.RAFFLE;

const connection = new Connection(CLUSTER_API, {
  skipPreflight: true,
  preflightCommitment: 'confirmed' as Commitment,
} as ConnectionConfig);

const ADMIN_WALLET = Keypair.fromSeed(Uint8Array.from(WINNER_WALLET).slice(0, 32));

const provider = new anchor.AnchorProvider(connection, new NodeWallet(ADMIN_WALLET), {
  skipPreflight: true,
  preflightCommitment: 'confirmed' as Commitment,
} as ConnectionConfig)

const program = new anchor.Program(IDL, PROGRAM_ID, provider);

// export const createRaffle = async (
//   raffleId: number,
//   mint: PublicKey,
//   startTime: number,
//   endTime: number,
//   totalTicket: number | null,
//   price: number
// ): Promise<Boolean> => {

//   try {
//     const id = new anchor.BN(raffleId);
//     const [pool] = await PublicKey.findProgramAddress(
//       [Buffer.from(POOL_SEED),
//       id.toArrayLike(Buffer, 'le', 8),
//       mint.toBuffer()],
//       program.programId
//     );

//     let ataFrom = await getAssociatedTokenAddress(mint, ADMIN_WALLET.publicKey);
//     console.log('ataFrom', ataFrom);

//     let ataTo = await getAssociatedTokenAddress(mint, pool, true);
//     const builder = program.methods.createRaffle(
//       new anchor.BN(raffleId),
//       startTime,
//       endTime,
//       totalTicket,
//       new anchor.BN(price * PAY_TOKEN_DECIMAL)
//     );

//     builder.accounts({
//       admin: ADMIN_WALLET.publicKey,
//       mint: mint,
//       pool: pool,
//       ataFrom: ataFrom,
//       ataTo: ataTo,
//       tokenProgram: TOKEN_PROGRAM_ID,
//       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//       systemProgram: SystemProgram.programId,
//       rent: SYSVAR_RENT_PUBKEY
//     });

//     builder.signers([ADMIN_WALLET]);
//     const response = await builder.simulate({
//       commitment: 'confirmed'
//     });

//     console.log('response', response);
//     if (!response) return false;
//     const txId = await builder.rpc();
//     console.log('txId', txId);
//     if (!txId) return false;

//     return true;
//   }
//   catch (error) {
//     console.log('error', error);
//   }

//   return false;
// };

// export const editRaffle = async (
//   raffleId: number,
//   mint: PublicKey,
//   startTime: number,
//   endTime: number,
//   totalTicket: number | null,
//   price: number
// ): Promise<Boolean> => {

//   try {
//     const id = new anchor.BN(raffleId);
//     const [pool] = await PublicKey.findProgramAddress(
//       [Buffer.from(POOL_SEED),
//       id.toArrayLike(Buffer, 'le', 8),
//       mint.toBuffer()],
//       program.programId
//     );

//     const builder = program.methods.editRaffle(
//       startTime,
//       endTime,
//       totalTicket,
//       new anchor.BN(price * PAY_TOKEN_DECIMAL)
//     );

//     builder.accounts({
//       admin: ADMIN_WALLET.publicKey,
//       pool: pool
//     });

//     builder.signers([ADMIN_WALLET]);
//     const response = await builder.simulate({
//       commitment: 'confirmed'
//     });

//     if (!response) return false;
//     const txId = await builder.rpc();
//     if (!txId) return false;

//     return true;
//   }
//   catch (error) {
//     console.log('error', error);
//   }

//   return false;
// };

// export const deleteRaffle = async (
//   raffleId: number,
//   mint: PublicKey
// ): Promise<Boolean> => {

//   try {
//     console.log('raffle Id', raffleId);
//     const id = new anchor.BN(raffleId);
//     const [pool] = await PublicKey.findProgramAddress(
//       [Buffer.from(POOL_SEED),
//       id.toArrayLike(Buffer, 'le', 8),
//       mint.toBuffer()],
//       program.programId
//     );

//     const builder = program.methods.deleteRaffle();
//     let ataFrom = await getAssociatedTokenAddress(mint, pool, true);
//     let ataTo = await getAssociatedTokenAddress(mint, ADMIN_WALLET.publicKey);

//     builder.accounts({
//       admin: ADMIN_WALLET.publicKey,
//       pool: pool,
//       mint,
//       ataFrom,
//       ataTo,
//       tokenProgram: TOKEN_PROGRAM_ID,
//       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//       systemProgram: SystemProgram.programId,
//       rent: SYSVAR_RENT_PUBKEY
//     });

//     builder.signers([ADMIN_WALLET]);
//     const response = await builder.simulate({
//       commitment: 'confirmed'
//     });

//     if (!response) return false;
//     const txId = await builder.rpc();
//     if (!txId) return false;

//     return true;
//   }
//   catch (error) {
//     console.log('error', error);
//   }

//   return false;
// };


export const setWinnerForRaffle = async (
  raffleId: number,
  mint: PublicKey
): Promise<Boolean> => {

  try {
    const id = new anchor.BN(raffleId);
    const [pool] = await PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      mint.toBuffer()],
      program.programId
    );

    const builder = program.methods.setWinner();

    builder.accounts({
      admin: ADMIN_WALLET.publicKey,
      pool: pool,
      slothash: SYSVAR_SLOT_HASHES_PUBKEY
    });

    builder.signers([ADMIN_WALLET]);
    const response = await builder.simulate({
      commitment: 'confirmed'
    });
    console.log('response', response);
    if (!response) return false;
    const txId = await builder.rpc();
    console.log('txId', txId);
    if (!txId) return false;

    return true;
  }
  catch (error) {
    // console.log('error', error);
  }

  return false;
};

export const sendBackNftForRaffle = async (
  raffleId: number,
  mint: PublicKey
): Promise<Boolean> => {

  try {
    const id = new anchor.BN(raffleId);
    const [pool] = await PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      mint.toBuffer()],
      program.programId
    );


    let ataFrom = await getAssociatedTokenAddress(new PublicKey(mint), pool, true);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(mint), new PublicKey(
      ADMIN_WALLET_PUB
    ))

    const builder = program.methods.sendBackNft();

    builder.accounts({
      partner: ADMIN_WALLET.publicKey,
      admin: new PublicKey( ADMIN_WALLET_PUB ),
      pool: pool,
      mint: new PublicKey(mint),
      ataFrom: ataFrom,
      ataTo: ataTo,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });

    builder.signers([ADMIN_WALLET]);
    const response = await builder.simulate({
      commitment: 'confirmed'
    });
    console.log('response', response);
    if (!response) return false;
    const txId = await builder.rpc();
    console.log('txId', txId);
    if (!txId) return false;

    return true;
  }
  catch (error) {
    return false;
    // console.log('error', error);
  }

  return false;
};