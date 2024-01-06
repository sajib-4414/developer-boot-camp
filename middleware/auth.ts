import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { User } from '../models/User'
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/errorResponse')

//protect routes
exports.protect = asyncHandler(async (req:any, res: Response, next: NextFunction) =>{
    let token:any;
    if(req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer '))
        { 
            //set tokenn from beater token in header
            token = req.headers.authorization.split(' ')[1];
        }
        //set token from cookie
    else if(req.cookies.token){
        token = req.cookies.token
    }

    //Make sure token exists
    if(token=== undefined || !token){
        return next(new ErrorResponse('Not authorized to access route',401))
    }

    try{
        //verify token
        const decoded:JwtPayload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
        console.log(decoded)
        req.user = await User.findById(decoded.id)
        next()
    }catch(err){
        console.log(err)
        return next(new ErrorResponse('Not authorized to access route',401))
    }
})

//Grant access to specific roles
exports.authorize = (...roles:any)=>{
    return (req:any, res:any, next:any)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorResponse(`User role ${req.user.role} is unauthorized to access this route`,403))
        }
        next()
    }
}
