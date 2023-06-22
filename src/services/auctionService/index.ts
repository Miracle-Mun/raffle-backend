import { ObjectId } from 'mongoose';
import AuctionModel from '../../models/auction';
import { Auction } from '../../models/auction';
import * as AuctionContract from '../../helpers/contract/auction';
import { PublicKey } from '@solana/web3.js';

const getAuctions = async () => {
  try {
    const auctions = await AuctionModel.find();
    return auctions;
  }
  catch (error) {
    return null;
  }
}

const getAuction = async (id: ObjectId) => {
  try {
    const auction = await AuctionModel.findById(id);
    return auction;
  }
  catch (error) {
    return null;
  }
}

const createAuction = async (data: Auction) => {
  try {
    console.log('data', data);

    const auction = new AuctionModel(data);
    await auction.save();
    return auction;
  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}

const updateAuction = async (id: ObjectId, data: Auction) => {
  try {
    let auction = await AuctionModel.findById(id);
    if (!auction) return null;

    Object.keys(data).map(key => {
      auction[key] = data[key];
    })
    await auction.save();
    return auction;
  }
  catch (error) {
    return null;
  }
}

const deleteAuction = async (id: ObjectId) => {
  try {
    const auction = await AuctionModel.findById(id);
    if (!auction) return false;

    await auction.remove();
    return true;

  }
  catch (error) {
    return false;
  }
}

export default {
  getAuctions,
  getAuction,
  createAuction,
  updateAuction,
  deleteAuction
}