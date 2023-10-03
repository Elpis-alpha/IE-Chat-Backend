import jsonwebtoken from 'jsonwebtoken'
import { Response, NextFunction } from 'express';
import { errorJson } from './errors';
import { authUserRequest } from '../types/request';
import User from '../models/User';
import { jwtSecret } from '../_env';

const auth = async (req: authUserRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) throw new Error('Invalid Token')

    const decoded = jsonwebtoken.verify(token, jwtSecret)
    if (typeof decoded === "string") throw new Error("Invalid Token")

    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
    if (!user) throw new Error('Invalid Token')

    req.token = token
    req.user = user
    next()
  } catch (error) {
    return errorJson(res, 401, "Not Authenticated")
  }
}

export default auth