import jwt from "jsonwebtoken";
import authService from "../services/authService";
import { ADMIN_WALLET } from "../helpers/contract/auction";
import User from "../models/user";

export const verifyAdmin = (type: number) => async (req, res, next) => {
  try {
    let signedMessage = '';
    let data: any = {};
    console.log('body', req.body);
    Object.keys(req.body).map(key => {
      if (key === 'signedMessage') signedMessage = req.body[key];
      else data[key] = req.body[key];
    })

    const result = await authService.verify(ADMIN_WALLET.publicKey.toString(), signedMessage, type);
    if (!result) return res.json(null);
    console.log('data111', data)
    req.body = data;
    next();
  }
  catch (error) {
    console.log('error', error);
    return res.json(null);
  }
}

export const isAuthenticated = async (req, res, next) => {
  try {
    if ((req.headers && req.headers.authorization) || req.query.token) {
      const token = req.query.token
        ? req.query.token
        : req.headers.authorization.split(' ')[1];
      const decodedData: any = jwt.verify(token, process.env.JWTSECRET);
      const user = await User.findOne({
        walletAddress: decodedData.walletAddress,
      });
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ message: 'Invalid token' });
      }
    } else {
      res.status(401).json({ message: 'Please try after login' });
    }
  } catch (error) {
    console.log(error.name);
    console.log(error);
    res.status(401).json({ message: 'Please try after login' });
  }
};
