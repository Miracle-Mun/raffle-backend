import { toast } from 'react-toastify'

export const RaffleValidation = (raffle: any) => {
  if (raffle.image === ``) {
    toast.error("Please select NFT");
    return false
  }
  if (raffle.price <= 0) {
    toast.error(`Please input ticket price exactly`)
    return false
  }

  if (raffle.start_date?.getTime() <= Date.now()) {
    toast.error(`Start Date must be bigger than current time`)
    return false
  }

  if (raffle.end_date?.getTime() <= raffle.start_date?.getTime()) {
    toast.error(`End Date must be bigger than start date`)
    return false
  }

  if (raffle.total_tickets <= 0) {
    toast.error(`Please input ticket price exactly`)
    return false
  }

  if (raffle.min_nft_count <= 0) {
    toast.error(`Please set minimum NFT count exactly`)
    return false
  }

  if (raffle.twitter === ``) {
    toast.error(`Please input twitter link`)
    return false
  }

  if (raffle.discord === ``) {
    toast.error(`Please input discord link`)
    return false
  }

  if (raffle.description === ``) {
    toast.error(`Please input description`)
    return false
  }

  return true
}

export const AuctionValidation = (auction: any) => {
  if (auction.image === ``) {
    toast.error("Please select NFT");
    return false
  }

  if (auction.start_date?.getTime() <= Date.now()) {
    toast.error(`Start Date must be bigger than current time`)
    return false
  }

  if (auction.end_date?.getTime() <= auction.start_date?.getTime()) {
    toast.error(`End Date must be bigger than start date`)
    return false
  }

  if (auction.min_bid_amount <= 0) {
    toast.error(`Please input Min Bid Amount exactly`)
    return false
  }

  if (auction.twitter === ``) {
    toast.error(`Please input twitter link`)
    return false
  }

  if (auction.discord === ``) {
    toast.error(`Please input discord link`)
    return false
  }

  if (auction.description === ``) {
    toast.error(`Please input description`)
    return false
  }

  return true
}

export const IRLCreatealidation = (irlCreate: any, nftImage: any) => {
  if (nftImage === undefined) {
    console.log(nftImage)
    toast.error("Please select image");
    return false
  }

  if (irlCreate.name === ``) {
    toast.error("Please input name");
    return false
  }

  if (irlCreate.symbol === ``) {
    toast.error("Please input symbol");
    return false
  }

  if (irlCreate.description === ``) {
    toast.error("Please input description ");
    return false
  }

  return true
}