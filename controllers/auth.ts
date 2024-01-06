import { NextFunction, Request, Response } from "express"
import { User, UserDoc } from "../models/User";
import { underline } from "colors";
import crypto from "crypto";
const asyncHandler = require('../middleware/async')
const ErrorResponseinstance = require('../utils/ErrorResponse')
const sendEmail = require('../utils/sendEmail')

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

    sendTokenResponse(user, 200, res)
   
})




// @desc Get current logged in user
// @route POST /api/v1/auth/me
// @access Private

exports.getMe = asyncHandler(async (req:any, res:Response, next:NextFunction)=>{
    const user:UserDoc|null = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        data:user
    })
})

// @desc Update user details
// @route PUT /api/v1/auth/updatedetails
// @access Private

exports.updateDetails = asyncHandler(async (req:any, res:Response, next:NextFunction)=>{
    const fields = {
        name: req.body.name,
        email: req.body.email
    }
    const user:UserDoc|null = await User.findByIdAndUpdate(req.user.id, fields, {
        new: true,
        runValidators:true
    })
    res.status(200).json({
        success: true,
        data:user
    })
})

// @desc Update password
// @route PUT /api/v1/auth/updatepassword
// @access Private

exports.updatePassword = asyncHandler(async (req:any, res:Response, next:NextFunction)=>{
    const user:UserDoc = await User.findById(req.user.id).select('+password')

    //check current password
    if(!await user.matchPassword(req.body.currentPassword)){
        return next(new ErrorResponseinstance('password is incorrect',401))
    }

    user.password = req.body.newPassword

    await user.save()

    sendTokenResponse(user,200,res)
   
})


// @desc Forgot password
// @route POST /api/v1/auth/forgotpassword
// @access Public

exports.forgotPassword = asyncHandler(async (req:any, res:Response, next:NextFunction)=>{
    console.log("email is", req.body.email)
    const user:UserDoc|null = await User.findOne({email: req.body.email})
    if(!user){
        return next(new ErrorResponseinstance('there is no user with that email',404))
    }

    //get reset token
    const resetToken = await user.getResetPasswordToken();

    await user.save({validateBeforeSave:false})

    //create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`
    const message = `You are receiving this email because you or someone else has requested the
     reset of a password. Please make sure to make a PUT request to \n\n ${resetUrl}`
    
    try{
        await sendEmail({
            email: user.email,
            subject:'Password reset token ',
            message
        })
        res.status(200).json({
            success: true,
            data: 'Email sent'
        })
    }catch(err){
        console.log(err)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave:false})
        next(new ErrorResponseinstance('Email could not be sent',500))
    }
    
})

// @desc Reset Password
// @route PUT /api/v1/auth/resetpassword/:resettoken
// @access Private

exports.resetPassword = asyncHandler(async (req:any, res:Response, next:NextFunction)=>{
    console.log("reset token is", req.params.resetToken)

    //Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')
    const user:UserDoc|null = await User.findOne({resetPasswordToken, resetPasswordExpire:{$gt:Date.now()}})
    if(!user){
        return next(new ErrorResponseinstance('Invalid token',400))
    }
    //set the new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()
    sendTokenResponse(user,200,res)

    res.status(200).json({
        success: true,
        data:user
    })
})