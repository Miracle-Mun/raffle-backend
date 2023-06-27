import { useState, useEffect } from 'react';

import Countdown, { CountdownApi } from 'react-countdown'
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import {
  Connection,
  Commitment,
  ConnectionConfig,
  PublicKey,
} from "@solana/web3.js";
import { Link } from "react-router-dom";

import { getAuctionById } from '../../../services/api';
import { createBidForAuction } from '../../../services/contracts/auction';
import CONFIG from "../../../config";
import UnionIcons from "../../../assets/Union-icons.png";
import VerificationIcon from "../../../assets/Verification-icon.png";
import { ToastContainer, toast } from "react-toastify";

const { CLUSTER_API, AUCTION, DECIMAL } = CONFIG;

const FilterUserAuction = (props: any) => {
  const { item, id } = props;
  const anchorWallet: any = useAnchorWallet();
  const [isLoading, setLoading] = useState(false);

  const [biddingStatus, setBiddingStatus] = useState(0);
  const [amount, setAmount] = useState(0);
  const [currentBid, setCurrentBid] = useState(0)

  let startCountdownApi: CountdownApi | null = null
  let endCountdownApi: CountdownApi | null = null

  const setStartCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      startCountdownApi = countdown.getApi()
    }
  }

  const setEndCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      endCountdownApi = countdown.getApi()
    }
  }

  const startCountdownRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
    if (api.isPaused()) api.start()
    return (
      completed ?
        <Countdown
          ref={setEndCountdownRef}
          date={item.end_date * 1000}
          zeroPadTime={3}

          renderer={endCountdownRenderer}
        />
        :
        <div>
          <p>Starts In</p>
          <p>
            {days.toString().length === 1 ? `0${days}` : days}:
            {hours.toString().length === 1 ? `0${hours}` : hours}:
            {minutes.toString().length === 1 ? `0${minutes}` : minutes}:
            {seconds.toString().length === 1 ? `0${seconds}` : seconds}
          </p>
        </div>
    )
  }

  const endCountdownRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
    if (api.isPaused()) api.start()
    return (
      completed ?
        <p>Ended</p>
        :
        <div>
          <p>Live</p>
          <p>
            {days.toString().length === 1 ? `0${days}` : days}:
            {hours.toString().length === 1 ? `0${hours}` : hours}:
            {minutes.toString().length === 1 ? `0${minutes}` : minutes}:
            {seconds.toString().length === 1 ? `0${seconds}` : seconds}
          </p>
        </div>

    )
  }
  const handleBidAuction = async (bidItem: any, idx: any) => {
    try {
      if (amount < bidItem.min_bid_amount) {
        toast.error(`Bidding amount must be bigger than Min.Bid Amount`)
        return
      }

      if (biddingStatus === 1) {
        // toast.error("You can update in this View Auction Page")
        return
      }
      if (Date.now() / 1000 < bidItem?.start_date || Date.now() / 1000 > bidItem?.end_date) {
        toast.error(`You can't buy NFT`);
        return;
      }
      setLoading(true)

      const createRes = await createBidForAuction(
        anchorWallet,
        item,
        amount
      );
      if (createRes) {
        toast("Success on creating bid");
        setBiddingStatus(1);
        setCurrentBid(amount)

      } else {
        toast("Fail on creating bid");
      }
      setLoading(false)

    } catch (error) {
      console.log('error', error)
      toast("Fail on creating bid");

      setLoading(false)

    }
  }

  const getUserInfo = async (bids: any[]) => {
    const bid = bids.find((item: any) => {
      return item.bidder.toString() === anchorWallet?.publicKey?.toString();
    });

    if (bid) {
      setBiddingStatus(1);
      setCurrentBid(bid.price.toNumber() / DECIMAL)
    }
  };

  useEffect(() => {
    (
      async () => {
        try {
          if (!anchorWallet) return
          setLoading(true)
          const connection = new Connection(CLUSTER_API, {
            skipPreflight: true,
            preflightCommitment: "confirmed" as Commitment,
          } as ConnectionConfig);

          const provider = new anchor.AnchorProvider(connection, anchorWallet, {
            skipPreflight: true,
            preflightCommitment: "confirmed" as Commitment,
          } as ConnectionConfig);

          const program = new anchor.Program(
            AUCTION.IDL,
            AUCTION.PROGRAM_ID,
            provider
          );

          const nftInfoById: any = await getAuctionById(item._id);
          const auctionId = new anchor.BN(nftInfoById.id);
          const [pool] = await PublicKey.findProgramAddress(
            [
              Buffer.from(AUCTION.POOL_SEED),
              auctionId.toArrayLike(Buffer, "le", 8),
              new PublicKey(item.mint).toBuffer(),
            ],
            program.programId
          );
          const poolData = await program.account.pool.fetch(pool);
          getUserInfo(poolData.bids);
          setLoading(false)


        } catch (error) {
          console.log('error', error)
          setLoading(false)
        }
      }
    )()
  }, [anchorWallet])

  return (
    <>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div
        className={`lg:basis-[32%] md:basis-[48%] sm:basis-[48%] basis-[100%] mt-6`}
        key={item._id}
      >

        <div className="rounded-[0.9rem] overflow-hidden border-4 border-[#606060]">
          <div className="relative">
            <img
              src={item?.image}
              alt="CoodeImage"
              className="lg:h-[300px] w-full object-cover"
            />
            <div className="absolute top-0 left-0 h-full w-full">
              <div className="flex flex-col justify-between h-full p-2">
                <div className="flex justify-end">
                  <div className="border-black bg-[#949494] border flex rounded-md overflow-hidden">
                    <p className="bg-white text-base py-1 pl-2 pr-4 para-clip">
                      {item.tokenName}
                    </p>
                    <p className="py-1 px-2 text-base text-white">#{item.tokenId}</p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="border-black bg-[#949494] border flex rounded-md overflow-hidden">
                    <p className="bg-white text-base pt-[4px] pl-2 pr-3 para-clip-2">
                      <img
                        src={UnionIcons}
                        alt="UnionIcons"
                        className="w-[10px]"
                      />
                    </p>
                    <p className="py-[2px] pl-[2px] pr-[5px] text-[12px] text-white">
                      #0001
                    </p>
                  </div>
                  <div className="border-black bg-[#949494] border flex rounded-md overflow-hidden">
                    <p className="bg-white text-[12px] pt-[2px] pl-2 pr-3 para-clip-3">
                      Floor
                    </p>
                    <p className="py-[2px] pl-[2px] pr-[5px] text-[12px] text-white">
                      9.9
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white -mt-1">
            <div className="pt-2 pl-3 pb-2 border-b-[#D9D9D9] border">
              <div className="flex items-center">
                <img src={VerificationIcon} alt="VerificationIcon" />
                <span className="text-base leading-none inline-block ml-1">
                  {item.tokenName}
                </span>
              </div>
              <h1 className="text-xl">{item.tokenName}</h1>
            </div>
            <div className="pt-2 pl-3 pr-2">
              <div className="flex justify-between">
                <div className="basis-[49%]">
                  <p className="text-sm">Time Remaining</p>
                  <p className="text-sm text-[#4A4A4A]">
                    <Countdown
                      ref={setStartCountdownRef}
                      date={item.start_date * 1000}
                      zeroPadTime={3}

                      renderer={startCountdownRenderer}
                    />
                  </p>
                </div>
                <div className="basis-[49%]">
                  <p className="text-sm">Min. Bid Amount</p>
                  <p className="text-sm text-[#4A4A4A]">{item.min_bid_amount}</p>
                </div>
              </div>
              <div className="flex justify-between pt-2 pb-9">
                <div className="basis-[50%]">
                  <p className="text-sm">Current Bid</p>
                  <p className="text-sm text-[#4A4A4A]">{currentBid}</p>
                </div>
                {
                  Date.now() / 1000 < item.end_date && <div className="flex basis-[50%] justify-between items-start">
                    <input
                      type="number"
                      placeholder="QTY"
                      className={`${biddingStatus === 1 ? `opacity-70 cursor-no-drop ` : ``}  w-[49%] text-center outline-none text-sm border border-black bg-[#82828240] text-[#000] py-1 rounded-md`}
                      value={amount}
                      disabled={biddingStatus === 1 ? true : false}
                      onChange={(e: any) => {
                        if (biddingStatus === 1) {
                          return
                        } else
                          if (id >= 0) {
                            setAmount(e.target.value)
                          }
                      }}

                    />
                    <button
                      type="button"
                      className={`${biddingStatus === 1 ? `opacity-70 cursor-no-drop ` : ``}  basis-[49%] text-sm bg-black rounded-md text-white py-1 border border-black`}
                      onClick={() => handleBidAuction(item, id)}
                    >
                      Bid
                    </button>
                  </div>
                }

              </div>
            </div>
          </div>
        </div>
        <div className="-mt-[26px] text-center">
          <Link
            to={`/auction/${item._id}`}
            className="bg-black text-white border-4 rounded-md inline-block py-2 px-6  border-[#606060]"
          >
            View Auction
          </Link>
        </div>
        <ToastContainer />

      </div>
    </>
  );
};

export default FilterUserAuction;
