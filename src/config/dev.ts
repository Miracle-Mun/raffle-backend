import WINNER_KEYPAIR from './winner_dev.json';
import * as AUCTION_IDL from '../constants/idl/auction'
import * as RAFFLE_IDL from '../constants/idl/raffle'

export default {
  WINNER_WALLET: WINNER_KEYPAIR,
  ADMIN_WALLET_PUB: '3ttYrBAp5D2sTG2gaBjg8EtrZecqBQSBuFRhsqHWPYxX',
  PROGRAM_ID: '3nYqaNUEhW4gwkNHanSPeTExTuerisrCU71EpxQm3W6N',
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