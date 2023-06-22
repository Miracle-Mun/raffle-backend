import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
// import passport from 'passport';
import routes from './routes';
import RaffleModel from './models/raffle';
import { setWinner } from './helpers/contract/raffle';
import { PublicKey } from '@solana/web3.js';
import { delay } from './helpers/utils';

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
        let res;
        try {
          res = await setWinner(raffle.id, new PublicKey(raffle.mint));
        } catch(error) {
          // console.log('error', error)
        }
         
        if (res) {
          raffle.state = 1;
          await raffle.save();
        }
      }
    }
  }
  catch (error) {
    // console.log('error', error);
  }
}


(async () => {
  for (let i = 0; i < 1;) {
    await checkRaffles();
    await delay(60 * 1000)
  }
})()