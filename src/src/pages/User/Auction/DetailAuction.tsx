import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import {
  Connection,
  Commitment,
  ConnectionConfig,
  PublicKey,
} from "@solana/web3.js";
import { Link } from "react-router-dom";
import Countdown, { CountdownApi } from 'react-countdown'

import CONFIG from "../../../config";
import { getAuctionById } from "../../../services/api";
import {
  cancelBidForAuction,
  claimBid,
  claimPrize,
  createBidForAuction,
  updateBidForAuction,
} from "../../../services/contracts/auction";
import UnionIcons from "../../../assets/Union-icons.png";
import VerificationIcon from "../../../assets/Verification-icon-2.png";
import ReturnIcon from "../../../assets/return-icon.png";
import TimingIcon from "../../../assets/Subtract-timing-icon.png";
import TicketIcon from "../../../assets/Subtract-ticket-icon.png";
import DateIcon from "../../../assets/Subtract.-date-icon.png";
import ShareIcon from "../../../assets/Share-icon.png";
import BidIcon from "../../../assets/Subtract-bid-icon.png";
import CurrentBidIcon from "../../../assets/Subtract-sol-price-icon.png";
import TimingAuctionIcon from "../../../assets/Subtract-tiiming-auction.png";
import Navbar from "../../../components/Navbar";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import commonService from "../../../services/common.service";

const { CLUSTER_API, AUCTION, TokenAddress, DECIMAL, API_URL } =
  CONFIG;

const connection = new Connection(CLUSTER_API, {
  skipPreflight: true,
  preflightCommitment: "confirmed" as Commitment,
} as ConnectionConfig);

const DetailUserAuction = () => {
  const anchorWallet: any = useAnchorWallet();
  const { id } = useParams();
  const [isLoading, setLoading] = useState(false);
  const [nftInfo, setNftInfo] = useState<any>([]);
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(0);

  const [biddingStatus, setBiddingStatus] = useState(0);
  const [auctionStatus, setAuctionStatus] = useState(0);
  const [bidInfo, setBidInfo] = useState<any>(null);
  const [raffleInfo, showraffleInfo] = useState<string>("raffleinfo");
  const [ticketBuyerLists, setTicketBuyerLists] = useState<any>([])
  const [currentBid, setCurrentBid] = useState(0)
  const [auctionWinner, setAuctionWinner] = useState(false)
  const [auctionClaimed, setAutionClaimed] = useState(false)
  const [auctionClaimPrized, setAuctionClaimPrized] = useState(false)

  let startCountdownApi: CountdownApi | null = null
  let countdownEndApi: CountdownApi | null = null

  const setStartCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      startCountdownApi = countdown.getApi()
    }
  }

  const setEndCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      countdownEndApi = countdown.getApi()
    }
  }

  const startCountdownRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
    if (api.isPaused()) api.start()
    return (
      completed ?
        <Countdown
          ref={setEndCountdownRef}
          date={nftInfo.end_date * 1000}
          zeroPadTime={3}
          onComplete={handleAuctionComplete}
          renderer={countdownEndRenderer}
        />
        :
        <div className="flex gap-1" >
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

  const countdownEndRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
    if (api.isPaused()) api.start()
    return (
      completed ?
        <p >ENDED</p>
        :
        <div className="flex gap-1"  >
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

  const handleCreateOrUpdateBid = async () => {
    try {
      if (!balance) {
        toast.error(`The token isn't exist in your wallet`)
        return
      }
      if (auctionStatus !== 1) {
        toast.error(`You can't bid now`)
        return
      }

      if (amount < nftInfo.min_bid_amount || balance < nftInfo.min_bid_amount) {
        toast.error(`Bidding Or Owned Token amount must be bigger than Min.Increment`)
        return
      }

      setLoading(true);
      const price = amount;
      if (biddingStatus === 1) {
        const updateRes = await updateBidForAuction(
          anchorWallet,
          nftInfo,
          price
        );

        if (updateRes) {
          toast("Success on updating bid");
          setCurrentBid(amount)

          setBalance(balance + (price - bidInfo.amount / DECIMAL));
          const findIdx = ticketBuyerLists.findIndex((item: any) =>
            item?.bidder?.toString() === anchorWallet?.publicKey?.toString())

          const new_buyerLists = ticketBuyerLists.map((item: any, idx: any) => {
            return idx === findIdx ? { ...ticketBuyerLists[findIdx], price: Number(amount) * CONFIG.DECIMAL } : item
          })

          setTicketBuyerLists(new_buyerLists)

        } else {
          toast("Fail on updating bid");
        }
      } else {

        const createRes = await createBidForAuction(
          anchorWallet,
          nftInfo,
          price
        );
        if (createRes) {
          toast("Success on creating bid");
          setBiddingStatus(1);
          setBalance(balance - price);
          setCurrentBid(amount)

          setTicketBuyerLists([...ticketBuyerLists, {
            bidder: new PublicKey(anchorWallet?.publicKey.toString()),
            price: Number(amount) * CONFIG.DECIMAL,
            isWinner: 0
          }])
        } else {
          toast("Fail on creating bid");
        }
      }
      setLoading(false);
    } catch (error) {
      if (biddingStatus === 1) toast("Fail on updating bid");
      else toast("Fail on creating bid");
      setLoading(false);
    }
  };

  const handleDeleteBid = async () => {
    try {
      if (auctionStatus !== 1) return;
      setLoading(true);
      const res = await cancelBidForAuction(anchorWallet, nftInfo);
      if (res) {
        toast("Success on canceling bid");
        setBiddingStatus(0);
        setBalance(balance + bidInfo.price.toNumber() / DECIMAL);
        const findIdx = ticketBuyerLists.findIndex((item: any) =>
          item?.bidder?.toString() === anchorWallet?.publicKey?.toString())

        const new_buyerLists = ticketBuyerLists.splice(findIdx, 1)

        const final_buyerLists = ticketBuyerLists.filter((item: any) =>
          item?.bidder?.toString() !== new_buyerLists[0]?.item?.bidder?.toString()
        )

        setTicketBuyerLists(final_buyerLists)
        setCurrentBid(0)
      } else {
        toast("Fail on canceling bid");
      }
      setLoading(false);
    } catch (error) {

      setLoading(false);
      toast("Fail on canceling bid");
    }
  };

  const handleClaimPrize = async () => {
    try {
      if (auctionClaimPrized) {
        toast.error(`Already You have claimed `)
        return
      }
      setLoading(true);
      const res = await claimPrize(anchorWallet, nftInfo);
      if (res) {
        toast("Success on claiming prize");
        setAuctionClaimPrized(true)
      } else {
        toast("Fail on claiming prize");
      }
      setLoading(false);
    } catch (error) {

      setLoading(false);
      toast("Fail on claiming prize");
    }
  };

  const handleClaimBid = async () => {
    try {
      if (auctionClaimed) {
        toast.error(`Already You have claimed `)
        return
      };
      setLoading(true);
      const res = await claimBid(anchorWallet, nftInfo);
      if (res) {

        toast("Success on claiming bid");
        setAutionClaimed(true)
      } else {
        toast("Fail on claiming bid");
      }
      setLoading(false);
    } catch (error) {

      setLoading(false);
      toast("Fail on claiming bid");
    }
  };

  const onChangeSol = (e: any) => {
    setAmount(e.target.value);
  };

  const getUserInfo = async (bids: any[], bidCount: any) => {
    const filterBuyerLists: any = []
    for (let i = 0; i < bids.length; i++) {
      if (i < bidCount) {
        filterBuyerLists.push(bids[i])
      }
    }

    let winner_buyerLists = [];
    for (let i = 0; i < filterBuyerLists.length; i++) {
      winner_buyerLists.push(filterBuyerLists[i].price.toNumber())
    }
    const high = Math.max.apply(Math, winner_buyerLists);
    const result: any = filterBuyerLists.find((item: any) => item.price.toNumber() === high)
    if (result?.bidder?.toString() === anchorWallet?.publicKey?.toString()) {
      setAuctionWinner(true)
    } else {
      setAuctionWinner(false)
    }

    const get_user: any = await commonService({
      method: `get`,
      route: `${API_URL}/user/${anchorWallet?.publicKey.toBase58()}`
    })

    if (get_user) {
      if (get_user?.twitterName) {
        const filter = filterBuyerLists.map((item: any) => {
          return item?.bidder?.toString() === get_user?.walletAddress ? { ...item, name: get_user?.twitterName }
            : item
        })
        setTicketBuyerLists(filter)
      } else if (get_user?.discordName) {
        const filter = filterBuyerLists.map((item: any) => {
          return item?.bidder?.toString() === get_user?.walletAddress ? { ...item, name: get_user?.discordName }
            : item
        })
        setTicketBuyerLists(filter)
      } else {
        setTicketBuyerLists(filterBuyerLists)
      }

    } else {
      setTicketBuyerLists(filterBuyerLists)

    }

    setTicketBuyerLists(filterBuyerLists)

    const bid: any = filterBuyerLists.find((item: any) => {
      return item.bidder.toString() === anchorWallet?.publicKey?.toString()
    });

    if (bid) {
      setAmount(bid.price.toNumber() / DECIMAL);
      setBiddingStatus(1);
      setBidInfo(bid);
    } else {
      setCurrentBid(0)
      setBiddingStatus(0);
      setAmount(0)
    }
  };

  const getAuctionStatus = async (poolData: any) => {
    const currentTime = Math.floor(Date.now() / 1000);
    let status = 0;
    if (currentTime > poolData.endTime) status = 2;
    else if (currentTime >= poolData.startTime) status = 1;
    setAuctionStatus(status);
  };

  const handleAuctionComplete = async () => {
    try {
      const provider = new anchor.AnchorProvider(connection, anchorWallet, {
        skipPreflight: true,
        preflightCommitment: "confirmed" as Commitment,
      } as ConnectionConfig);

      const program = new anchor.Program(
        AUCTION.IDL,
        AUCTION.PROGRAM_ID,
        provider
      );

      const [pool] = await PublicKey.findProgramAddress(
        [
          Buffer.from(AUCTION.POOL_SEED), new anchor.BN(nftInfo.id).toArrayLike(Buffer, "le", 8),
          new PublicKey(nftInfo?.mint).toBuffer(),
        ],
        program.programId
      );

      const poolData = await program.account.pool.fetch(pool);

      const filterBuyerLists: any = []
      for (let i = 0; i < poolData.bids.length; i++) {
        if (i < poolData.count) {
          filterBuyerLists.push(poolData.bids[i])
        }
      }

      let winner_buyerLists = []
      for (let i = 0; i < filterBuyerLists.length; i++) {
        winner_buyerLists.push(filterBuyerLists[i].price.toNumber())
      }
      if (winner_buyerLists.length > 0) {
        const high = Math.max.apply(Math, winner_buyerLists);
        const result: any = filterBuyerLists.find((item: any) => item.price.toNumber() === high)
        if (result?.bidder?.toString() === anchorWallet?.publicKey?.toString()) {
          setAuctionWinner(true)
        } else {
          setAuctionWinner(false)
        }
      }
      setAuctionStatus(2)
    } catch (error) {

    }
  }

  useEffect(() => {
    (async () => {
      try {
        if (!anchorWallet) return
        setLoading(true);
        const nftInfoById: any = await getAuctionById(id);
        const provider = new anchor.AnchorProvider(connection, anchorWallet, {
          skipPreflight: true,
          preflightCommitment: "confirmed" as Commitment,
        } as ConnectionConfig);

        const program = new anchor.Program(
          AUCTION.IDL,
          AUCTION.PROGRAM_ID,
          provider
        );
        const auctionId = new anchor.BN(nftInfoById.id);
        const [pool] = await PublicKey.findProgramAddress(
          [
            Buffer.from(AUCTION.POOL_SEED),
            auctionId.toArrayLike(Buffer, "le", 8),
            new PublicKey(nftInfoById.mint).toBuffer(),
          ],
          program.programId
        );

        const ataUser = await getAssociatedTokenAddress(
          new PublicKey(TokenAddress),
          anchorWallet?.publicKey
        );
        const ataInfo: any = await connection.getParsedAccountInfo(ataUser);
        const walletBalance = ataInfo?.value?.data?.parsed?.info?.tokenAmount?.uiAmount
        if (ataInfo) {
          setBalance(walletBalance);
        }

        const poolData = await program.account.pool.fetch(pool);
        console.log('poolData',poolData)
        if (!poolData) {
          return
        }
        const poolData_filteredOwner = poolData?.bids.find((item: any) => item?.bidder?.toString() === anchorWallet?.publicKey?.toString());
        setCurrentBid(Number(poolData_filteredOwner?.price) / DECIMAL)
        if (poolData_filteredOwner?.claimed === 1) {
          setAutionClaimed(true)
        }
        console.log('poolData',poolData)
        if (poolData?.state === 2) {
          setAuctionClaimPrized(true)
        }

        getUserInfo(poolData?.bids, poolData?.count);
        getAuctionStatus(poolData);

        startCountdownApi?.start()
        countdownEndApi?.start()
        setLoading(false);

      } catch (error) {

        setLoading(false)
      }
    })();
  }, [anchorWallet]);

  useEffect(()=>{
    (
      async() => {
        setLoading(true);
        const nftInfoById: any = await getAuctionById(id);

        const dateFormat = new Date(nftInfoById.start_date * 1000)
        const result_date = dateFormat.getDate() +
          "/" + (dateFormat.getMonth() + 1) +
          "/" + dateFormat.getFullYear() +
          " " + dateFormat.getHours() +
          ":" + dateFormat.getMinutes() +
          ":" + dateFormat.getSeconds()
        
        setNftInfo({
          ...nftInfoById,
          start: result_date
        });

        setLoading(false)
      }
    )()
  },[])

  return (
    <>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div className="bg-black">
        <Navbar />
        <div className="max-w-[1240px] m-auto pt-8 pb-16 px-4">
          <div className="xl:flex justify-between block">
            <div className="xl:basis-[35%] max-w-[450px] m-auto xl:max-w-auto xl:m-0 pb-6 xl:pb-0">
              <div className="rounded-[0.9rem] overflow-hidden border-4 border-[#606060] transition duration-1000">
                <div className="relative">
                  <img
                    src={nftInfo?.image}
                    alt="CoodeImage"
                    className="h-[450px] w-full object-cover"
                  />
                  <div className="absolute top-0 left-0 h-full w-full">
                    <div className="flex justify-between items-end h-full p-2">
                      <div className="flex justify-between items-start w-full">
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
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    name="solValue"
                    value={amount}
                    onChange={onChangeSol}
                    className="w-[38%] block text-white text-base text-center outline-none bg-[#82828240] border border-[#606060] rounded-[0.7rem] py-3 px-5"
                    disabled={auctionStatus !== 1}
                  />

                  <button
                    type="button"
                    className="basis-[38%]  text-black bg-white rounded-[0.7rem]  py-3 sm:px-5"
                    onClick={handleCreateOrUpdateBid}
                  >
                    <span className={` ${auctionStatus === 1 ? 'cursor-pointer' : 'cursor-no-drop'} max-w-fit mx-[auto] my-0 sm:text-lg text-sm text-black`}>
                      {biddingStatus === 1 ? 'Update Bid' : 'Create Bid'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="text-black bg-white rounded-[0.7rem] flex items-center justify-center py-3 px-5"
                  >
                    <img
                      src={ShareIcon}
                      alt="Pricetag-icon"
                      className="w-[22px]"
                    />
                  </button>
                </div>

                {
                  biddingStatus === 1 ?
                    <div className="btn-gradient rounded-full p-[1px] mb-3">
                      <div className="btn-background-absolute rounded-full">
                        <p className={`text-[1.25rem] text-center py-2 px-8 block text-[#15BFFD] m-0  max-w-fit mx-[auto] my-0  ${auctionStatus === 1 ? 'cursor-pointer' : 'cursor-no-drop'}`}
                          onClick={handleDeleteBid}
                        >
                          Cancel Bid
                        </p>
                      </div>
                    </div> :
                    <div></div>
                }
              </div>


              <div className="text-center">
                <p className="text-white text-[1.25rem] mt-3">
                  {biddingStatus === 0 && 'None'}
                  {biddingStatus === 1 && auctionStatus === 1 && 'Pending'}
                  {
                    biddingStatus === 1 &&
                    auctionStatus === 2 &&
                    auctionWinner &&
                    'Win'
                  }
                  {biddingStatus === 1 &&
                    auctionStatus === 2 &&
                    !auctionWinner &&
                    'Fail'
                  }
                </p>
              </div>
              {
                biddingStatus === 1 &&
                auctionStatus === 2 &&
                auctionWinner &&
                <div className="btn-gradient rounded-full p-[1px] mb-3">
                  <div className="btn-background-absolute rounded-full">
                    {
                      <p className={`text-[1.25rem] text-center py-2 px-8 block text-[#15BFFD] m-0
                        max-w-fit mx-[auto] my-[0]
                        ${auctionClaimPrized ? 'cursor-no-drop' : 'cursor-pointer'}
                        `
                      }
                        onClick={handleClaimPrize}
                      >
                        Claim Prize
                      </p>
                    }
                  </div>
                </div>
              }

              {
                biddingStatus === 1 &&
                auctionStatus === 2 &&
                !auctionWinner &&
                <div className="btn-gradient rounded-full p-[1px] mb-3">
                  <div className="btn-background-absolute rounded-full">
                    {
                      <p className={`text-[1.25rem] text-center py-2 px-8 block text-[#15BFFD] m-0 max-w-fit mx-[auto] my-[0]
                        ${auctionClaimed ? 'cursor-no-drop' : 'cursor-pointer'}
                       `}
                        onClick={handleClaimBid}
                      >
                        Claim Bid
                      </p>
                    }
                  </div>
                </div>
              }
            </div>

            <div className="basis-[63%]">
              <div className="border-4 border-[#606060] bg-[#60606040] rounded-[0.7rem]">
                <div className="flex justify-between p-4">
                  <div>
                    <div className="flex items-center">
                      <img
                        src={VerificationIcon}
                        alt="VerificationIcon"
                        className="w-[20px]"
                      />
                      <p className="text-white">{nftInfo.tokenName}</p>
                    </div>
                    <h1 className="text-3xl text-white mt-1">{nftInfo.tokenName}</h1>

                    <div className="flex items-center mt-4">
                      <button
                        type="button"
                        className={`${raffleInfo === "raffleinfo"
                          ? "border border-white bg-black text-white py-2 rounded-[0.6rem] sm:px-4 px-2 text-sm sm:text-base"
                          : "text-white"
                          } `}
                        onClick={() => showraffleInfo("raffleinfo")}
                      >
                        Bid Info
                      </button>
                      <button
                        type="button"
                        onClick={() => showraffleInfo("participants")}
                        className={`${raffleInfo === "participants"
                          ? "border border-white ml-6 bg-black text-white py-2 rounded-[0.6rem] sm:px-4 px-2 text-sm sm:text-base"
                          : "text-white ml-6"
                          } `}
                      >
                        Leaderboard
                      </button>
                    </div>
                  </div>
                  <div>
                    <Link to='/auction' >

                      <div className="flex items-center mb-2">
                        <img src={ReturnIcon} alt="ReturnIcon" />
                        <span className="text-white inline-block ml-1">
                          Return
                        </span>
                      </div>
                    </Link>
                    {/* <div className="flex items-center">
                      <img src={ReportIcon} alt="ReportIcon" />
                      <span className="text-[#AA0000] inline-block ml-1">
                        Report
                      </span>
                    </div> */}
                  </div>
                </div>
                <div className="h-[2px] w-[95%] m-auto bg-[#606060]"></div>
                {raffleInfo === "raffleinfo" && (
                  <>
                    <div className="bg-[#323232] py-4 px-4 sm:px-0 mt-4">
                      <div className=" relative sm:flex block justify-between sm:w-[85%] m-auto">
                        <div className="text-center">
                          <img
                            src={TimingIcon}
                            alt="TimingIcon"
                            className="max-w-[60px] m-auto"
                          />
                          <p className="text-[#878787]">Time Remaining</p>
                          <p className="text-white">
                            {
                              !!nftInfo?.start_date && <Countdown
                                ref={setStartCountdownRef}
                                date={nftInfo?.start_date * 1000}
                                // date={1682412607823}
                                zeroPadTime={3}
                                renderer={startCountdownRenderer}
                                onComplete={() => setAuctionStatus(1)}
                              />
                            }
                          </p>
                        </div>
                        <div className={`
                        absolute left-[50%] translate-x-[-50%]
                        text-center
                        `}>
                          <img
                            src={TicketIcon}
                            alt="TimingIcon"
                            className="max-w-[60px] m-auto"
                          />
                          <p className="text-[#878787]">Min. Bid Amount</p>
                          <p className="text-white">{nftInfo.min_bid_amount}</p>
                        </div>
                        <div className="{`
                        md:absolute relative w-[200px] left-[52%] md:translate-x-[63%] translate-x-[0] text-center
                        `}">
                          <img
                            src={DateIcon}
                            alt="TimingIcon"
                            className="max-w-[60px] m-auto"
                          />
                          <p className="text-[#878787]">Start Date</p>
                          <p className="text-white">{nftInfo.start}</p>
                        </div>
                        <div className="absolute left-[33%] md: border-l-[1px] bg-[transparent] w-2 border-dashed h-[108px] border-white  " />
                        <div className="absolute left-[66%] md: border-l-[1px] bg-[transparent] w-2 border-dashed h-[108px] border-white  " />
                      </div>
                    </div>
                    <div className="bg-[#323232] py-4 px-4 sm:px-0">
                      <div className="relative sm:flex block justify-between sm:w-[80%] m-auto">
                        <div className="text-center">
                          <img
                            src={BidIcon}
                            alt="TimingIcon"
                            className="max-w-[60px] m-auto"
                          />
                          <p className="text-[#878787]">Bid Royalty</p>
                          <p className="text-white">0.00%</p>
                        </div>
                        <div className="text-center translate-x-2.5 ">
                          <img
                            src={CurrentBidIcon}
                            alt="TimingIcon"
                            className="max-w-[60px] m-auto"
                          />
                          <p className="text-[#878787]">Current Bid</p>
                          <p className="text-white">{currentBid ? currentBid : 0}</p>
                        </div>
                        <div className="text-center">
                          <img
                            src={TimingAuctionIcon}
                            alt="TimingIcon"
                            className="max-w-[60px] m-auto"
                          />
                          <p className="text-[#878787]">Time Extension</p>
                          <p className="text-white">5 Minutes</p>
                        </div>
                        <div className="absolute left-[31.9%] md: border-l-[1px] bg-[transparent] w-2 border-dashed h-[108px] border-white  " />
                        <div className="absolute left-[67%] md: border-l-[1px] bg-[transparent] w-2 border-dashed h-[108px] border-white  " />
                      </div>
                    </div>
                  </>
                )}
                {raffleInfo === "participants" && (
                  <div
                    className="text-white py-4 max-h-[447px] overflow-y-auto"
                    id="wallet-list"
                  >
                    <ul className="py-3 px-4 w-full flex justify-between">
                      <li className="basis-[50%] text-xl">Username</li>
                      <li className="basis-[50%] text-xl text-center">
                        Bid Amount
                      </li>
                    </ul>

                    {
                      ticketBuyerLists.sort((a: any, b: any) => b.price - a.price).map((item: any, idx: any) => {
                        return (
                          <ul className="py-2 px-4 w-full flex justify-between" key={idx} >
                            <li className="basis-[50%] text-base">
                              {item?.name ? item?.name : item?.bidder.toBase58()?.substr(0, 6) + '...' + item?.bidder.toBase58()?.substr(item?.bidder.toBase58().length - 4, 4)}
                            </li>
                            <li className="basis-[50%] text-base text-center">{Number(item?.price) / CONFIG.DECIMAL}</li>
                          </ul>
                        )
                      })
                    }
                  </div>
                )}
                <div className="p-4">
                  <h1 className="text-2xl text-white">Terms & Conditions</h1>
                  <ul className="text-white mt-2 text-base list-decimal px-5">
                    {/* <li>
                      {nftInfo.description}
                    </li> */}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default DetailUserAuction;
