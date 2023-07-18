import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
// import passport from 'passport';
import routes from './routes';
import RaffleModel from './models/raffle';
import AuctionModel from './models/auction';
import { setWinner, sendBackNftForRaffle } from './helpers/contract/raffle';
import { sendBackNftForAuction } from './helpers/contract/auction';
import * as anchor from "@project-serum/anchor";
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { 
  PublicKey,   
  Keypair,
  Connection,
  Commitment,
  ConnectionConfig,
} from '@solana/web3.js';
import { delay } from './helpers/utils';
import { getUnixTs } from './helpers/solana/connection';
import CONFIG from './config'

const { WINNER_WALLET, DECIMAL } = CONFIG
// require('./helpers/discordPassport');
// require('./helpers/twitterPassport');

dotenv.config();
mongoose.connect(
  process.env.MONGO_URI).then(
    () => console.log("Database Connected"))
  .catch(() => console.log("Database Connection Failed")
  )
  console.log("mongo uri", process.env.MONGO_URI)
const app = express();

app.use(cors());
app.use(bodyParser.json())
app.use(
  require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  })
);
// app.use(passport.initialize());
// app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(`${__dirname}/build`))
app.use(express.static(`${__dirname}/uploads`))
app.use(express.json({ limit: '100mb' }));
app.use('/api', routes);
app.use('/*', (req, res) => {
  res.sendFile(`${__dirname}/build/index.html`)
})

const port = process.env.PORT
app.listen(port, () => {
  console.info(`server started on port ${port}`)
})


const checkRaffles = async () => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const raffles = await RaffleModel.find({ state: 0 });
    for (let i = 0; i < raffles.length; i++) {
      let raffle = raffles[i];
      if (currentTime > raffle.end_date) {
        console.log('raffleID', raffle.id);
        console.log('raffle mint', raffle.mint);
        let res1;
        try {
          res1 = await setWinner(raffle.id, new PublicKey(raffle.mint));
        } catch(error) {
          // console.log('error', error)
        }
        if (res1) {
          raffle.state = 1;
          await raffle.save();
        }

        let res2;
        try {
          res2 = await sendBackNftForRaffle(raffle.id, new PublicKey(raffle.mint));
        } catch(error) {
        
        }
        if (res2) {
          raffle.state = 3;
          await raffle.save();
        } else {
          const connection = new Connection(CONFIG.CLUSTER_API, {
            skipPreflight: true,
            preflightCommitment: "confirmed" as Commitment,
          } as ConnectionConfig);

          const ADMIN_WALLET = Keypair.fromSeed(Uint8Array.from(WINNER_WALLET).slice(0, 32));
          const provider = new anchor.AnchorProvider(connection,  new NodeWallet(ADMIN_WALLET), {
            skipPreflight: true,
            preflightCommitment: "confirmed" as Commitment,
          } as ConnectionConfig);

          const program = new anchor.Program(
            CONFIG.AUCTION.IDL,
            CONFIG.AUCTION.PROGRAM_ID,
            provider
          );
            
          const raffleId = new anchor.BN(raffle.id);
          const [pool] = await PublicKey.findProgramAddress(
            [
              Buffer.from(CONFIG.RAFFLE.POOL_SEED),
              raffleId.toArrayLike(Buffer, "le", 8),
              new PublicKey(raffle.mint).toBuffer(),
            ],
            program.programId
          );
          const poolData = await program.account.pool.fetch(pool);
          if(poolData.state === 2) {
            raffle.state = 2;
            await raffle.save();
          }
        }
      }
    }
  }
  catch (error) {
    // console.log('error', error);
  }
}


const checkAuctions = async () => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const auctions = await AuctionModel.find({ state: 0 });
    for (let i = 0; i < auctions.length; i++) {
      let auction = auctions[i];
      if (currentTime > auction.end_date) {
        console.log('raffleID', auction.id);
        console.log('raffle mint', auction.mint);
        let res;
        try {
          res = await sendBackNftForAuction(auction.id, new PublicKey(auction.mint));
        } catch(error) {
          // console.log('error', error)
        }
        if (res) {
          auction.state = 3;
          await auction.save();
        } else {
          const connection = new Connection(CONFIG.CLUSTER_API, {
            skipPreflight: true,
            preflightCommitment: "confirmed" as Commitment,
          } as ConnectionConfig);

          const ADMIN_WALLET = Keypair.fromSeed(Uint8Array.from(WINNER_WALLET).slice(0, 32));
          const provider = new anchor.AnchorProvider(connection,  new NodeWallet(ADMIN_WALLET), {
            skipPreflight: true,
            preflightCommitment: "confirmed" as Commitment,
          } as ConnectionConfig);

          const program = new anchor.Program(
            CONFIG.AUCTION.IDL,
            CONFIG.AUCTION.PROGRAM_ID,
            provider
          );

        let pool;
          try {
            const auctionId = new anchor.BN(auction.id);
            [pool] = await PublicKey.findProgramAddress(
              [
                Buffer.from(CONFIG.RAFFLE.POOL_SEED),
                auctionId.toArrayLike(Buffer, "le", 8),
                new PublicKey(auction.mint).toBuffer(),
              ],
              program.programId
            );
          } catch (error) {

          }

          const poolData = await program.account.pool.fetch(pool);
          
          if(poolData.state === 2) {
            auction.state = 2;
            await auction.save();
          }
        }
      }
    }
  }
  catch (error) {
    // console.log('error', error);
  }
}

const updateFloorPrice = async () => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const auctions = await AuctionModel.find({ state: 0 });
    for (let i = 0; i < auctions.length; i++) {
      let auction = auctions[i];
      if (currentTime > auction.start_date && currentTime < auction.end_date) {
        if( auction.tokenName.split('#').length < 2)
          continue;
        const collection = auction.tokenName.split('#')[0]
        const collectionName = collection.slice(0, -1)  

        const ME_Api = `https://api-mainnet.magiceden.io/rpc/getCollectionEscrowStats/${collectionName}?edge_cache=true&agg=3`
        const result: any = await axios.get(ME_Api)
        console.log('result', result)
        if(result?.results.floorPrice){
          const floorPrice = result?.results.floorPrice
          await AuctionModel.findOneAndUpdate({ id: auction.id}, { floor_price: Number(floorPrice) / DECIMAL, last_updated_fp: Math.floor(getUnixTs())})
        }
      }
    }

    const raffles = await RaffleModel.find({ state: 0 });
    for (let i = 0; i < raffles.length; i++) {
      let raffle = raffles[i];
      if (currentTime > raffle.start_date && currentTime < raffle.end_date) {
        if( raffle.tokenName.split('#').length < 2)
          continue;
        const collection = raffle.tokenName.split('#')[0]
        const collectionName = collection.slice(0, -1)  

        const ME_Api = `https://api-mainnet.magiceden.io/rpc/getCollectionEscrowStats/${collectionName}?edge_cache=true&agg=3`
        const result: any = await axios.get(ME_Api)
        if(result?.results.floorPrice){
          const floorPrice = result?.results.floorPrice
          await RaffleModel.findOneAndUpdate({ id: raffle.id}, { floor_price: Number(floorPrice) / DECIMAL, last_updated_fp: Math.floor(getUnixTs())})
        }
      }
    }
  }
  catch (error) {
    console.log('error', error);
  }
}


(async () => {
  for (let i = 0; i < 1;) {
    await checkRaffles();
    await checkAuctions();
    await delay(60 * 1000)
  }
})()

setInterval(async () => {
  await updateFloorPrice();
}, 10 * 60 * 1000);


