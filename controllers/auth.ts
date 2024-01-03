import { NextFunction, Request, Response } from "express"
import { User, UserDoc } from "../models/User";

const asyncHandler = require('../middleware/async')
const ErrorResponseinstance = require('../utils/ErrorResponse')

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public

exports.register = asyncHandler(async (req:Request, res: Response, next: NextFunction)=>{
    const {name, email, password, role} = req.body;
    //create user
    const user:UserDoc = await User.create({
        name, 
        email,
        password,
        role
    })

    sendTokenResponse(user, 200, res)
})


// @desc Register user
// @route POST /api/v1/auth/login
// @access Public

exports.login = asyncHandler(async (req:Request, res: Response, next: NextFunction)=>{
    console.log('here....1.2.')
    const {email, password} = req.body;
    //Validate email and password
    if(!email || !password){
        return next(new ErrorResponseinstance('Please provide and email and password',400))
    }

    //check for user
    const user:UserDoc = await User.findOne({email}).select('+password')

    if(!user){
        return next(new ErrorResponseinstance('Invalid credentials',401))
    }

    //check if password matches
    const isMatch = await user.matchPassword(password)

    if(!isMatch){
        return next(new ErrorResponseinstance('Invalid credentials',401))
    }
    console.log('here.....')
    sendTokenResponse(user, 200, res)
   
})


//Get token from model, create cookie and send response
const sendTokenResponse = (user:UserDoc, statusCode:number, res:Response)=>{
    //create token
    const token:string = user.getSignedJWTToken()
    const jwtCookieExpire = process.env.JWT_COOKIE_EXPIRE;
    if (!jwtCookieExpire) {
        // Handle the case where JWT_COOKIE_EXPIRE is not defined
        throw new Error('JWT_COOKIE_EXPIRE is not defined');
    }
    const options:any = {
        expires: new Date(Date.now() + Number(jwtCookieExpire)*24*60*60*1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }
    res.status(statusCode)
    .cookie('token',token, options)
    .json({
        success: true,
        token
    })
}