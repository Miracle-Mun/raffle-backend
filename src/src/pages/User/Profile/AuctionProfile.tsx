import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as anchor from "@project-serum/anchor";
import { PublicKey, Commitment, ConnectionConfig } from '@solana/web3.js';
import { useAnchorWallet, useConnection, useWallet, } from '@solana/wallet-adapter-react';
import { Link } from "react-router-dom";
import base58 from "bs58";

import AuctionRarticipant from "../Participant/AuctionParticipant";
import CONFIG from "../../../config";
import { checkDiscordStatus, checkTwitterStatus, createUser, getAllAuctions, getUser } from "../../../services/api";
import { delay, getNftMetaDataByMint } from "../../../utils";
import Navbar from "../../../components/Navbar";
import TwitterBlack from "../../../assets/Twitter-black.png";
import DiscordBlack from "../../../assets/Discord-Black.png";
import infoIconBlack from "../../../assets/InfoIconBlack.png";
import { toast } from "react-toastify";

const { AUCTION, Backend_URL, SIGN_KEY } = CONFIG;

const AuctionProfile = () => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [discord, setDiscord] = useState('');
  const [twitter, setTwitter] = useState('');
  const [social, setSocial] = useState(false);

  const [participantLists, setParticipantLists] = useState<any[]>([])

  const getData = async () => {
    try {
      if (!anchorWallet) return
      if (anchorWallet.publicKey.toBase58() === CONFIG.ADMIN_WALLET) {
        navigate('/auction')
      }
      const getAuctions: any = await getAllAuctions();

      const provider = new anchor.AnchorProvider(connection, anchorWallet, {
        skipPreflight: true,
        preflightCommitment: "confirmed" as Commitment,
      } as ConnectionConfig);

      const program = new anchor.Program(
        AUCTION.IDL,
        AUCTION.PROGRAM_ID,
        provider
      );

      let get_filterField = []
      for (let i = 0; i < getAuctions.length; i++) {
        const raffleId = new anchor.BN(getAuctions[i].id);
        const raffleParam = getAuctions[i]?._id

        const [pool] = await PublicKey.findProgramAddress(
          [
            Buffer.from(AUCTION.POOL_SEED),
            raffleId.toArrayLike(Buffer, "le", 8),
            new PublicKey(getAuctions[i].mint).toBuffer(),
          ],
          program.programId
        );
        const poolData: any = await program.account.pool.fetch(pool);
        const findMeINPoolData = poolData.bids.find((item: any) =>
          item?.bidder?.toString() === anchorWallet?.publicKey?.toString()
        )
        const currentBid = Number(findMeINPoolData?.price) / CONFIG.DECIMAL

        const getMetadata = await getNftMetaDataByMint(getAuctions[i].mint)

        if (findMeINPoolData) {
          get_filterField.push({
            ...poolData,
            id: raffleParam,
            image: getMetadata?.image,
            name: getMetadata?.data?.name,
            tokenName: getMetadata?.data?.name.split('#')[0],
            tokenId: getMetadata?.data?.name.split('#')[1],
            currentBid
          })
        }
      }
      setParticipantLists(get_filterField)
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleConnectDiscord = async () => {
    try {
      if (discord) {
        toast.error(`You have already Discord Account`)
        return;
      }
      if (!anchorWallet) toast.error("Connect your Wallet!");
      let user = await getUser(anchorWallet!.publicKey.toString());
      let signedMessage = null;
      if (!user) {
        signedMessage = await wallet!.signMessage!(new TextEncoder().encode(SIGN_KEY));
      }
      const verifyToken: any = await createUser(anchorWallet!.publicKey.toString(), signedMessage ? base58.encode(signedMessage!) : null);
      localStorage.setItem('token', JSON.stringify(verifyToken));
      setToken(verifyToken);
      if (verifyToken) {
        const res = window.open(Backend_URL + "/api/oauth/discord?token=" + verifyToken);
        setSocial(!social);

        if (res) {
          setTimeout(() => {
            toast.error(`It's time out to discord connecting`)
            setLoading(false)
            return
          }, 300 * 1000)
          for (let i = 0; i < 1;) {
            const user: any = await getUser(anchorWallet!.publicKey.toString());
            await delay(5 * 1000)
            if (user.discordName) {
              setDiscord(user?.discordName)
              toast.success(`Successfully connected`)

              break
            }
          }
        }

      }
    }
    catch (error) {
      console.log('error', error);
    }
  }

  const handleConnectTwitter = async () => {
    try {
      if (twitter) {
        toast.error(`You have already Twitter Account`)
        return
      };

      if (!anchorWallet) toast.error("Connect your Wallet!");
      let user = await getUser(anchorWallet!.publicKey.toString());
      let signedMessage: any = null;
      if (!user) {
        signedMessage = await wallet!.signMessage!(new TextEncoder().encode(SIGN_KEY));
      }
      const verifyToken: any = await createUser(anchorWallet!.publicKey.toString(), signedMessage);
      localStorage.setItem('token', JSON.stringify(verifyToken));
      setToken(verifyToken);
      if (verifyToken) {
        const res = window.open(CONFIG.Backend_URL + "/api/oauth/twitter?token=" + verifyToken);
        setSocial(!social);
        if (res) {
          setTimeout(() => {
            toast.error(`It's time out to twitter connecting`)
            setLoading(false)
            return
          }, 300 * 1000)
          for (let i = 0; i < 1;) {
            const user: any = await getUser(anchorWallet!.publicKey.toString());
            await delay(5 * 1000)
            if (user.twitterName) {
              setDiscord(user?.twitterName)
              toast.success(`Successfully connected`)
              break
            }
          }
        }
      }
    }
    catch (error) {
      console.log('error', error);
    }
  }

  useEffect(() => {
    (async () => {
      if (!anchorWallet) return;
      const discord: any = await checkDiscordStatus(anchorWallet?.publicKey.toString());
      if (discord) setDiscord(discord);
      const twitter: any = await checkTwitterStatus(anchorWallet?.publicKey.toString());
      if (twitter) setTwitter(twitter);
    })();
  }, [anchorWallet, token, social])

  useEffect(() => {
    (async () => {
      setLoading(true);
      await getData();
      setLoading(false);
    })();
  }, [anchorWallet]);

  useEffect(() => {
    (async () => {
      if (!anchorWallet) return;
      const discord: any = await checkDiscordStatus(anchorWallet.publicKey.toBase58());
      if (discord) setDiscord(discord);
      const twitter: any = await checkTwitterStatus(anchorWallet.publicKey.toBase58());
      if (twitter) setTwitter(twitter);
    })();
  }, [anchorWallet, token, social])

  return (
    <>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <Navbar />
      <div className="border-white border-b-2">
        <div className="flex items-center justify-between py-5 px-4">
          <h1 className="text-2xl text-white">Welcome Coode</h1>
          <div className="flex">
            <button
              type="button"
              className="py-3 px-4 bg-white rounded-md flex items-center"
              onClick={handleConnectTwitter}
            >
              <img src={TwitterBlack} alt="TwitterBlack" className="w-[25px]" />
              <span className="ml-3">{twitter ? twitter : `Connect Twitter`}</span>
            </button>
            <button
              type="button"
              className="py-3 px-4 bg-white rounded-md flex items-center ml-4"
              onClick={handleConnectDiscord}
            >
              <img src={DiscordBlack} alt="TwitterBlack" className="w-[25px]" />
              <span className="ml-3">{discord ? discord : `Connect Discord`}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-[1360px] m-auto px-4 py-4">
        <h1 className="text-4xl text-white">Participations</h1>
        <div className="relative h-[100px] w-full">
          <div className="absolute -mt-5 top-0 left-[-12px] ">
            <div className="sm:px-4 px-2">

              <div className="sm:mt-12 mt-8 flex justify-end max-w-[1280px] m-auto">
                <div className="flex justify-between items-center max-w-3xl w-full">
                  <div className="w-[300px] border bg-white rounded-[0.7rem] p-[1px]">
                    <div className="flex items-center justify-between text-white text-base">
                      <Link
                        to={`/profile/raffle`}
                        className="duration-75 transition basis-[49%] text-center text-black py-3 rounded-[0.7rem]"

                      >
                        Raffles
                      </Link>
                      <Link
                        to={`/profile/auction`}
                        className=" transition duration-75 btn-background basis-[49%] text-center py-3 rounded-[0.7rem] bg-black"
                      >
                        Auctions
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {
        participantLists.length > 0 ?
          participantLists.map((item: any, idx: any) =>
            <AuctionRarticipant item={item} idx={idx} key={idx} />
          )
          :
          isLoading ? <></>
            :
            <div className="max-w-[1280px] m-auto px-4">
              <div className="bg-white rounded-md py-8 px-8 flex items-center">
                <img src={infoIconBlack} alt="infoIconBlack" />
                <h1 className="xl:text-[3.2rem] lg:text-[2.5rem] md:text-[1.8rem] ml-10">
                  You haven’t participated in any Raffles!
                </h1>
              </div>
            </div>
      }

    </>
  );
};

export default AuctionProfile;
