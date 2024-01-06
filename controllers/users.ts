import { NextFunction } from "express"
import { User } from "../models/User"

const asyncHandler = require('../middleware/async')
const ErrorResponse= require('../utils/ErrorResponse')

// @desc Get all users
// @route POST /api/v1/auth/users
// @access Private/admin

exports.getUsers = asyncHandler(async (req:Request, res: any, next: NextFunction)=>{
    console.log("advaced users are.........")
    console.log(res.advancedResults)
    res.status(200).json(res.advancedResults)
})

// @desc Get single user
// @route POST /api/v1/auth/users/:id
// @access Private/admin

exports.getUser = asyncHandler(async (req:any, res: any, next: NextFunction)=>{
    const user = await User.findById(req.params.id)
    res.status(200).json({
        success:true,
        data:user
    })
})

// @desc create user
// @route POST /api/v1/auth/users
// @access Private/admin

exports.createUser = asyncHandler(async (req:any, res: any, next: NextFunction)=>{
    const user = await User.create(req.body)
    res.status(201).json({
        success:true,
        data:user
    })
})

// @desc update user
// @route PUT /api/v1/auth/users/:id
// @access Private/admin

exports.updateUser = asyncHandler(async (req:any, res: any, next: NextFunction)=>{
    const user = await User.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators:true
    })
    res.status(201).json({
        success:true,
        data:user
    })
})


// @desc delete user
// @route DELETE /api/v1/auth/users/:id
// @access Private/admin

exports.deleteUser = asyncHandler(async (req:any, res: any, next: NextFunction)=>{
    await User.findByIdAndDelete(req.params.id)
    res.status(201).json({
        success:true,
        data:{}
    })
})