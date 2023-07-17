import * as anchor from '@project-serum/anchor'
import {
  Connection,
  Keypair,
  Commitment,
  ConnectionConfig,
  SystemProgram,
  PublicKey,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

import CONFIG from '../../config'
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

const {
  ADMIN_WALLET_PUB,
  WINNER_WALLET,
  CLUSTER_API
} = CONFIG;

const { IDL, PROGRAM_ID, POOL_SEED, PAY_TOKEN_DECIMAL } = CONFIG.AUCTION;

const connection = new Connection(CLUSTER_API, {
  skipPreflight: true,
  preflightCommitment: 'confirmed' as Commitment,
} as ConnectionConfig);

export const ADMIN_WALLET = Keypair.fromSeed(Uint8Array.from(WINNER_WALLET).slice(0, 32));

const provider = new anchor.AnchorProvider(connection, new NodeWallet(ADMIN_WALLET), {
  skipPreflight: true,
  preflightCommitment: 'confirmed' as Commitment,
} as ConnectionConfig)

const program = new anchor.Program(IDL, PROGRAM_ID, provider);

// export const createAuction = async (
//   auctionId: number,
//   mint: PublicKey,
//   startTime: number,
//   endTime: number,
//   minPrice: number
// ): Promise<Boolean> => {

//   try {
//     const id = new anchor.BN(auctionId);
//     const [pool] = await PublicKey.findProgramAddress(
//       [Buffer.from(POOL_SEED),
//       id.toArrayLike(Buffer, 'le', 8),
//       mint.toBuffer()],
//       program.programId
//     );

//     console.log('poolAccountPDA', pool.toString());
//     let ataFrom = await getAssociatedTokenAddress(mint, ADMIN_WALLET.publicKey);
//     let ataTo = await getAssociatedTokenAddress(mint, pool, true);
//     const builder = program.methods.createAuction(
//       new anchor.BN(auctionId),
//       startTime,
//       endTime,
//       new anchor.BN(minPrice * PAY_TOKEN_DECIMAL)
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
//     console.log('txId', txId)
//     if (!txId) return false;

//     return true;
//   }
//   catch (error) {
//     console.log('error', error);
//   }

//   return false;
// };

// export const editAuction = async (
//   auctionId: number,
//   mint: PublicKey,
//   startTime: number,
//   endTime: number,
//   minPrice: number
// ): Promise<Boolean> => {

//   try {
//     const id = new anchor.BN(auctionId);
//     const [pool] = await PublicKey.findProgramAddress(
//       [Buffer.from(POOL_SEED),
//       id.toArrayLike(Buffer, 'le', 8),
//       mint.toBuffer()],
//       program.programId
//     );
//     console.log('pool', pool.toString());
//     const builder = program.methods.editAuction(
//       startTime,
//       endTime,
//       new anchor.BN(minPrice * PAY_TOKEN_DECIMAL)
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

export const deleteAuction = async (
  auctionId: number,
  mint: PublicKey
): Promise<Boolean> => {

  try {
    const id = new anchor.BN(auctionId);
    const [pool] = await PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      mint.toBuffer()],
      program.programId
    );

    const builder = program.methods.deleteAuction();
    let ataFrom = await getAssociatedTokenAddress(mint, pool, true);
    let ataTo = await getAssociatedTokenAddress(mint, ADMIN_WALLET.publicKey);

    builder.accounts({
      admin: ADMIN_WALLET.publicKey,
      pool: pool,
      mint,
      ataFrom,
      ataTo,
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
    console.log('error', error);
  }

  return false;
};

export const sendBackNftForAuction = async (
  auctionId: number,
  mint: PublicKey
): Promise<Boolean> => {

  try {
    const id = new anchor.BN(auctionId);
    const [pool] = await PublicKey.findProgramAddress(
      [Buffer.from(POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      mint.toBuffer()],
      program.programId
    );
    
    let ataFrom = await getAssociatedTokenAddress(mint, pool, true);
    let ataTo = await getAssociatedTokenAddress(mint, new PublicKey( ADMIN_WALLET_PUB ));

    const builder = program.methods.sendBackNft();

    builder.accounts({
      partner: ADMIN_WALLET.publicKey,
      admin: new PublicKey( ADMIN_WALLET_PUB ),
      pool: pool,
      mint,
      ataFrom,
      ataTo,
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
    console.log('error', error);
    return false;
  }

  return false;
};