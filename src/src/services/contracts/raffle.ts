import * as anchor from '@project-serum/anchor'
import {
  Connection,
  Commitment,
  ConnectionConfig,
  SystemProgram,
  PublicKey,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';

import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'

import CONFIG from "../../config";
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';
import { getMetadataAccount } from '../../utils';

const {
  RAFFLE,
  CLUSTER_API,
  TokenAddress
} = CONFIG;

const connection = new Connection(CLUSTER_API, {
  skipPreflight: true,
  preflightCommitment: 'confirmed' as Commitment,
} as ConnectionConfig);


export const createForRaffle = async (
  wallet: any,
  nftInfo: any,
  id: any
) => {
  try {
    const raffleId = new anchor.BN(id)
    console.log("raffleId", raffleId)
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)
    console.log("connection", connection)
    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);
    console.log("program", program)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      raffleId.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo?.mint).toBuffer()
    ], new PublicKey(RAFFLE.PROGRAM_ID))

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), wallet.publicKey);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), pool, true)
    console.log("wallet public key", wallet.publicKey.toString())
    console.log("ataFrom", ataFrom.toBase58())
    console.log("ataTo", ataTo.toBase58())
    const startTime: any = Math.floor(nftInfo.start_date?.getTime() / 1000).toString()
    const endTime: any = Math.floor(nftInfo.end_date?.getTime() / 1000).toString()
    const totalTicket: any = nftInfo.total_tickets
    const price: any = nftInfo.price

    let builder: any;
    try {
      builder = program.methods.createRaffle(raffleId, startTime, endTime, totalTicket, new anchor.BN(price * CONFIG.DECIMAL));
    } catch (error) {
      console.log('error in createRaffle method', error);
    }
    
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

    let txId;
    
    try {
      txId = await builder.rpc();
      console.log('txId', txId)
    } catch(error) {
      console.log('error', error)
    }
    if (!txId) return false;

    return true;

  }
  catch (error) {
    return false;
  }
}

export const editForRaffle = async (
  wallet: any,
  nftInfo: any,
) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)
    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)

    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()
    ], program.programId)

    const startTime: any = Math.floor(nftInfo.start_date?.getTime() / 1000).toString()
    const endTime: any = Math.floor(nftInfo.end_date?.getTime() / 1000).toString()
    const totalTicket = nftInfo.total_tickets
    const price: any = new anchor.BN(nftInfo.price * CONFIG.DECIMAL)
    const builder = program.methods.editRaffle(startTime, endTime, totalTicket, price);
    builder.accounts({
      admin: wallet.publicKey,
      pool: pool,
    });
    builder.signers([]);

    let txId
    try {
      txId = await builder.rpc();
      console.log('txId', txId)
    } catch(error) {
      console.log('error in buidler rpc', error)
    }

    if (!txId) return false;

    return true;

  }
  catch (error) {
    return null;
  }
}

export const deleteForRaffle = async (
  wallet: any,
  nftInfo: any,

) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)

    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()
    ], new PublicKey(RAFFLE.PROGRAM_ID))

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), pool, true);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), wallet.publicKey)

    const builder = program.methods.deleteRaffle();


    builder.accounts({
      admin: wallet.publicKey,
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

export const buyTicketsForRaffle = async (
  wallet: any,
  nftInfo: any,
  amount: number,
  lists: any
) => {
  try {
    console.log('nftInfo',nftInfo)
    console.log('lists',lists)
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)


    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()
    ], new PublicKey(RAFFLE.PROGRAM_ID))

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(TokenAddress), wallet.publicKey);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(TokenAddress), pool, true)

    let MintTokenAccount = await getAssociatedTokenAddress(new PublicKey(lists[0].mint), wallet.publicKey)
    const metadata = await getMetadataAccount(lists[0].mint)

    const builder = program.methods.buyTicket(amount);
    builder.accounts({
      buyer: wallet.publicKey,
      pool: pool,
      mint: new PublicKey(lists[0].mint),
      mintToken: MintTokenAccount,
      payMint: TokenAddress,
      ataFrom: ataFrom,
      ataTo: ataTo,
      metadata: metadata,
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

export const setWinnerForRaffle = async (
  wallet: any,
  nftInfo: any,

) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)


    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      nftInfo.mint.toBuffer()
    ], new PublicKey(RAFFLE.PROGRAM_ID))


    const hash = '12123123sdfsdf1'
    const builder = program.methods.setWinner();
    builder.accounts({
      admin: wallet.publicKey,
      pool: pool,
      slothash: hash,
    });

    builder.signers([wallet]);
    const response = await builder.simulate({
      commitment: 'confirmed'
    });

    if (!response) return false;
    const txId = await builder.rpc();
    console.log('txId', txId)
    if (!txId) return false;

    return true;

  }
  catch (error) {
    return null;
  }
}

export const claimPrizeForRaffle = async (
  wallet: any,
  nftInfo: any,

) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)


    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()
    ], new PublicKey(RAFFLE.PROGRAM_ID))

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), pool, true);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), wallet?.publicKey)

    const builder = program.methods.claimPrize();
    builder.accounts({
      buyer: wallet.publicKey,
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


export const VerifyCollection = async (
  walletAddress: any,
  connection: any
) => {
  try {
    const lists = await getParsedNftAccountsByOwner({
      publicAddress: walletAddress,
      connection
    })
    try {
       const filter_lists = lists.filter((item: any) => item.data.creators && item.data.creators[0].address === CONFIG.CREATOR_ADDRESS);

       console.log('filter_lists', filter_lists)

       if (filter_lists.length > 0) {
         return {
           status: true,
           lists: filter_lists
         }
       } else {
         return {
           status: false,
           lists: []
         }
       }
    } catch (error) {
      console.log('error', error)
    }
   

  } catch (error) {
    return null
  }
}




