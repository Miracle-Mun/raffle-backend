import ADMIN_KEYPAIR from './devnet.json';
import { IDL } from '../constants/idl/escrow';
import * as AUCTION_IDL from '../constants/idl/auction'
import * as RAFFLE_IDL from '../constants/idl/raffle'

export default {
  ADMIN: ADMIN_KEYPAIR,
  IDL: IDL,
  PROGRAM_ID: '3nYqaNUEhW4gwkNHanSPeTExTuerisrCU71EpxQm3W6N',
  ESCROW_SEEDS: 'escrow',
  CLUSTER_API: 'https://api.devnet.solana.com',
  BUNDLR_URL: 'https://devnet.bundlr.network',
  ENV: 'dev',
  SIGN_KEY: 'VERIFY WALLET',
  DECIMAL: 1000000000,
  PRICEPERBYTE: 0.00000001,
  SOLANA_NETWORK: 'devnet',

  AUCTION: {
    PROGRAM_ID: 'Hs3t9gHpLzrSA21eZnuQt6C9GMMTWmgrYynWLZA1K7pe',
    POOL_SEED: 'pool',
    IDL: AUCTION_IDL.IDL,
    PAY_TOKEN_DECIMAL: 1000000000,
    message: 'Auction Message'
  },
  RAFFLE: {
    PROGRAM_ID: 'HtWavE8Erfsho7v4RJzr8XSEYD79iN686RxHNGoxcUz7',
    POOL_SEED: 'pool',
    IDL: RAFFLE_IDL.IDL,
    PAY_TOKEN_DECIMAL: 1000000000,
    message: 'Raffle Message'
  }
}