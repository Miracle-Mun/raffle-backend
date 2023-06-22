import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { signAndSendTransaction } from "../../solana/connection";
import { makeDepositCoinTx } from "../escrow";
import CONFIG from '../../../config';

const { CLUSTER_API } = CONFIG;
const connection = new Connection(CLUSTER_API);

(async() => {
  const employeer = Keypair.fromSecretKey(bs58.decode('66UxUtexN2Mods9P3oaaz4A6pr6Zr1mMt8SnVmZ9XxFjRpreNdmW2VT6n5niUUtoJX3153DEZzJ1t3g4wTTTt92p'));
  const jobId = "job12345";
  const amount = 0.5;

  const wallet = new NodeWallet(employeer);
  
  const tx = await makeDepositCoinTx(employeer.publicKey, amount, jobId);
  // sign and send transaction
  await signAndSendTransaction(connection, wallet, tx);
})()