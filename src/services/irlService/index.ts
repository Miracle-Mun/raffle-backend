import { Metaplex, keypairIdentity, bundlrStorage, MetaplexFile, BundlrStorageDriver } from "@metaplex-foundation/js";
import {
  Connection,
  Keypair,
  Commitment,
  ConnectionConfig,
  clusterApiUrl
} from '@solana/web3.js';
import CONFIG from '../../config';
const {
  CLUSTER_API,
  BUNDLR_URL,
  SOLANA_NETWORK,
  PRICEPERBYTE,
  DECIMAL
} = CONFIG

const createIrl = async (data: any) => {
  // try {
  //   const { image, name, description, contentType } = data
  //   const connection = new Connection(CLUSTER_API, {
  //     skipPreflight: true,
  //     preflightCommitment: 'confirmed' as Commitment,
  //   } as ConnectionConfig);

  //   const ADMIN_WALLET = Keypair.fromSeed(Uint8Array.from(ADMIN_KEYPAIR).slice(0, 32));
  //   const metaplex = Metaplex.make(connection, { cluster: 'devnet' })
  //     .use(keypairIdentity(ADMIN_WALLET))
  //     .use(bundlrStorage({
  //       address:   BUNDLR_URL,
  //       providerUrl: CLUSTER_API,
  //       timeout: 60000,
  //     }));

  //   const bundlr = metaplex.storage().driver() as BundlrStorageDriver;

  //   console.log('image', image)

  //   let imageUrl;
  //   try {
  //     imageUrl = await bundlr.upload({
  //       buffer: Buffer.from(image),
  //       fileName: name,
  //       displayName: 'image',
  //       uniqueName: 'img',
  //       contentType: contentType,
  //       extension: null,
  
  //       tags: []
  //     });
  
  //     console.log('imageUrl', imageUrl)
  //   } catch (error) {
  //     console.log('imageUrl error', error)
  //   }

  //   const { uri } = await metaplex.nfts().uploadMetadata({
  //     name: name,
  //     description: description,
  //     image: imageUrl
  //   })

    
  //   // try {
  //   //   await metaplex.nfts().create({
  //   //     uri: uri,
  //   //     name: name,
  //   //     symbol: symbol,
  //   //     sellerFeeBasisPoints: 500, // Represents 5.00%.
  //   //   });

  //   // } catch (error) {
  //   //   console.log('create error', error)
  //   // }

  //   return uri
  // }
  // catch (error) {
  //   console.log('error', error);
  //   return null;
  // }
}

export default {
  createIrl
}
