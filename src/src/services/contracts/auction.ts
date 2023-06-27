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

import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'

import CONFIG from "../../config";
import { AnchorWallet, WalletContext, WalletContextState } from '@solana/wallet-adapter-react';

const {
  AUCTION,
  CLUSTER_API,
  TokenAddress,
  DECIMAL
} = CONFIG;

const connection = new Connection(CLUSTER_API, {
  skipPreflight: true,
  preflightCommitment: 'confirmed' as Commitment,
} as ConnectionConfig);

export const createForAuction = async (
  wallet: any,
  nftInfo: any,
  auctionId: number
) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)

    const program = new anchor.Program(AUCTION.IDL, AUCTION.PROGRAM_ID, provider);

    const id = new anchor.BN(auctionId);
    const [pool] = await PublicKey.findProgramAddress(
      [Buffer.from(AUCTION.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()],
      program.programId
    );

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), wallet.publicKey);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), pool, true);

    const startTime = Math.floor(nftInfo.start_date?.getTime() / 1000).toString()
    const endTime = Math.floor(nftInfo.end_date?.getTime() / 1000).toString()
    const builder = program.methods.createAuction(
      id,
      startTime,
      endTime,
      new anchor.BN(nftInfo.min_bid_amount * CONFIG.DECIMAL)
    );

    builder.accounts({
      admin: wallet.publicKey,
      mint: new PublicKey(nftInfo.mint),
      pool: pool,
      ataFrom: ataFrom,
      ataTo: ataTo,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });

    builder.signers([]);

    let txId;
    try {
      txId = await builder.rpc();
      console.log('txId', txId)
    } catch (error) {
      console.log('error', error)
    }

    if (!txId) 
      return false;

    return true;
  } catch (error) {
  
  }
}

export const updateForAuction = async (
  wallet: any,
  nftInfo: any
) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)

    const program = new anchor.Program(AUCTION.IDL, AUCTION.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id);
    const [pool] = await PublicKey.findProgramAddress(
      [Buffer.from(AUCTION.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()],
      program.programId
    );
    const startTime = Math.floor(nftInfo.start_date?.getTime() / 1000)
    const endTime = Math.floor(nftInfo.end_date?.getTime() / 1000)
    const builder = program.methods.editAuction(
      startTime,
      endTime,
      new anchor.BN(nftInfo.min_bid_amount * CONFIG.DECIMAL)
    );
    builder.accounts({
      admin: wallet.publicKey,
      pool: pool
    });

    builder.signers([]);

    const txId = await builder.rpc();
    console.log('txId', txId)

    if (!txId) return false;

    return true;

  } catch (error) {
    return null
  }
}

export const deleteForAuction = async (
  wallet: any,
  nftInfo: any
) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)

    const program = new anchor.Program(AUCTION.IDL, AUCTION.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id);
    const [pool] = await PublicKey.findProgramAddress(
      [Buffer.from(AUCTION.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()],
      program.programId
    );

    const builder = program.methods.deleteAuction();
    let ataFrom = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), pool, true);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), wallet.publicKey);
    builder.accounts({
      admin: wallet.publicKey,
      pool: pool,
      mint: new PublicKey(nftInfo.mint),
      ataFrom,
      ataTo,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });
    builder.signers([]);
    const txId = await builder.rpc();
    console.log('txId', txId);
    if (!txId) return false;

    return true;
  } catch (error) {
  }
}

export const createBidForAuction = async (
  wallet: AnchorWallet,
  nftInfo: any,
  price: number
) => {
  try {
    console.log('nftInfo',nftInfo)
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)

    const program = new anchor.Program(AUCTION.IDL, AUCTION.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id);
    const [pool] = await PublicKey.findProgramAddress(
      [Buffer.from(AUCTION.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()],
      program.programId
    );

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(TokenAddress), wallet.publicKey);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(TokenAddress), pool, true)
    const builder = program.methods.createBid(new anchor.BN(price * DECIMAL));
    builder.accounts({
      bidder: wallet.publicKey,
      pool: pool,
      payMint: new PublicKey(TokenAddress),
      ataFrom: ataFrom,
      ataTo: ataTo,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });

    builder.signers([]);

    const txId = await builder.rpc();
    if (!txId) return false;
    console.log('txId', txId)
    return true;

  }
  catch (error) {
    console.log('error',error)
    return false;
  }
}

export const updateBidForAuction = async (
  wallet: any,
  nftInfo: any,
  price: number
) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)

    const program = new anchor.Program(AUCTION.IDL, AUCTION.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id);
    const [pool] = await PublicKey.findProgramAddress(
      [Buffer.from(AUCTION.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()],
      program.programId
    );

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(TokenAddress), wallet.publicKey);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(TokenAddress), pool, true)
    const builder = program.methods.updateBid(new anchor.BN(price * DECIMAL));
    builder.accounts({
      bidder: wallet.publicKey,
      pool: pool,
      payMint: TokenAddress,
      ataFrom: ataFrom,
      ataTo: ataTo,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });

    builder.signers([]);
    const txId = await builder.rpc();
    if (!txId) return false;
    console.log('txId', txId)
    return true;

  }
  catch (error) {
    return null;
  }
}

export const cancelBidForAuction = async (
  wallet: any,
  nftInfo: any,

) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)

    const program = new anchor.Program(AUCTION.IDL, AUCTION.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id);
    const [pool] = await PublicKey.findProgramAddress(
      [Buffer.from(AUCTION.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()],
      program.programId
    );

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(TokenAddress), pool, true);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(TokenAddress), wallet?.publicKey);
    const builder = program.methods.cancelBid();
    builder.accounts({
      bidder: wallet.publicKey,
      pool: pool,
      payMint: new PublicKey(TokenAddress),
      ataFrom: ataFrom,
      ataTo: ataTo,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });
    builder.signers([]);

    const txId = await builder.rpc();
    console.log('txId', txId)
    if (!txId) return false;

    return true;
  }
  catch (error) {
    return null;
  }
}

export const claimBid = async (
  wallet: any,
  nftInfo: any,
) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)


    const program = new anchor.Program(AUCTION.IDL, AUCTION.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(AUCTION.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()
    ], new PublicKey(AUCTION.PROGRAM_ID))

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(TokenAddress), pool, true);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(TokenAddress), wallet.publicKey)

    const builder = program.methods.claimBid();
    builder.accounts({
      bidder: wallet.publicKey,
      pool: pool,
      payMint: TokenAddress,
      ataFrom: ataFrom,
      ataTo: ataTo,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });

    builder.signers([]);
    const txId = await builder.rpc();
    console.log('txId', txId)
    if (!txId) return false;

    return true;

  }
  catch (error) {
    return null;
  }
}

export const claimPrize = async (
  wallet: any,
  nftInfo: any,

) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)


    const program = new anchor.Program(AUCTION.IDL, AUCTION.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(AUCTION.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()
    ], new PublicKey(AUCTION.PROGRAM_ID))

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), pool, true);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), wallet.publicKey)

    const builder = program.methods.claimPrize();
    builder.accounts({
      bidder: wallet.publicKey,
      pool: pool,
      mint: new PublicKey(nftInfo.mint),
      ataFrom: ataFrom,
      ataTo: ataTo,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });

    builder.signers([]);
    const txId = await builder.rpc();
    console.log('txId', txId)
    if (!txId) return false;

    return true;

  }
  catch (error) {
    return null;
  }
}