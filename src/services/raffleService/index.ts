import { ObjectId } from 'mongoose';
import RaffleModel from '../../models/raffle';
import { Raffle } from '../../models/raffle';
import * as RaffleContract from '../../helpers/contract/raffle';
import { PublicKey } from '@solana/web3.js';

const getRaffles = async () => {
  try {
    const raffles = await RaffleModel.find();
    return raffles;
  }
  catch (error) {
    return error;
  }
}

const getRaffle = async (id: Raffle) => {
  try {
    const raffle = await RaffleModel.findById(id);
    return raffle;
  }
  catch (error) {
    return null;
  }
}

const createRaffle = async (data: Raffle) => {
  try {
    const raffle = new RaffleModel(data);
    await raffle.save();
    return raffle;
  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}

const updateRaffle = async (id: ObjectId, data: Raffle) => {
  try {
    let raffle = await RaffleModel.findById(id);
    if (!raffle) return null;

    Object.keys(data).map(key => {
      raffle[key] = data[key];
    })
    await raffle.save();
    return raffle;
  }
  catch (error) {
    return null;
  }
}

const deleteRaffle = async (id: ObjectId) => {
  try {
    console.log('delete id', id)
    const raffle = await RaffleModel.findById(id);
    console.log('raffle', raffle)

    if (!raffle) return false;

    // const result = await RaffleContract.deleteRaffle(
    //   raffle.id,
    //   new PublicKey(raffle.mint)
    // );
    // if (!result) return false;

    await raffle.remove();
    return true;
  }
  catch (error) {
    console.log('error', error);
    return false;
  }
}

export default {
  getRaffles,
  getRaffle,
  createRaffle,
  updateRaffle,
  deleteRaffle
}