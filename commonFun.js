import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';
import './models/Quotes.js';
import './models/User.js';

export var User  = mongoose.model("User")
export var Quote = mongoose.model("Quote")

// Function to validate Password
export const comparePass = async (reqPassword, dbPassword) => {
    const doMatch = await bcrypt.compare(reqPassword,dbPassword)
      if (doMatch) return true 
      else return false 
};

// Function to hash the Password
export const hashThePassword = async (reqPassword) => {
    const doMatch = await bcrypt.hash(reqPassword,12)
    return doMatch 
};


// Function to create the token
export const createJWToken = async (_id) => {
   const token = await jwt.sign({userId:_id},JWT_SECRET)
   return token 
};


// Function to verify the token
export const verifyJWToken = async (token) => {
    const {userId} = await jwt.verify(token,JWT_SECRET)
    return {userId}
};


