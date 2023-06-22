import ADMIN_KEYPAIR from './devnet.json';
import { IDL } from '../constants/idl/escrow';
import * as AUCTION_IDL from '../constants/idl/auction'
import * as RAFFLE_IDL from '../constants/idl/raffle'

export default {
  ADMIN: ADMIN_KEYPAIR,
  IDL: IDL,
  PROGRAM_ID: '3nYqaNUEhW4gwkNHanSPeTExTuerisrCU71EpxQm3W6N',
  ESCROW_SEEDS: 'escrow',
  CLUSTER_API: 'https://capable-burned-shape.solana-mainnet.quiknode.pro/904288623a1e9c412e5da6f5204baa74aa652938/',
  BUNDLR_URL: 'https://node1.bundlr.network',
  ENV: 'dev',
  SIGN_KEY: 'VERIFY WALLET',
  DECIMAL: 1000000000,
  PRICEPERBYTE: 0.00000001,
  SOLANA_NETWORK: 'mainnet',

  AUCTION: {
    PROGRAM_ID: 'HQYQ5NCn8bSZkeXrECGXrrQX6xnj312rNyH4KJSMniK5',
    POOL_SEED: 'pool',
    IDL: AUCTION_IDL.IDL,
    PAY_TOKEN_DECIMAL: 1000000000,
    message: 'Auction Message'
  },
  RAFFLE: {
    PROGRAM_ID: 'BMqGz73MkSqc2q28ecGDBhjPYB59WwXn6hiZBTpkqxqL',
    POOL_SEED: 'pool',
    IDL: RAFFLE_IDL.IDL,
    PAY_TOKEN_DECIMAL: 1000000000,
    message: 'Raffle Message'
  }
}


