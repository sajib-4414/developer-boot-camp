import { NextFunction, Request, Response } from "express"
import { IAdvancedResults } from "../middleware/advancedResult"
import { Review } from "../models/Review"
import { Bootcamp } from "../models/Bootcamp"

const asyncHandler = require('../middleware/async')
const ErrorResponse= require('../utils/ErrorResponse')

// @desc Get reviews
// @route GET /api/v1/reviews
// @route GET /api/v1/bootcamps/:bootcampId/reviews
// @access Public

exports.getReviews= asyncHandler(async (req:Request, res:Response & { advancedResults: IAdvancedResults }, next: NextFunction) => {

    if(req.params.bootcampId){
        const reviews = await Review.find({bootcamp: req.params.bootcampId})
        res.status(200).json({
            success: true, 
            count: reviews.length,
            data: reviews
        })
    }
    else{
        res.status(200).json(res.advancedResults)
    }
    
})

// @desc Get single review
// @route GET /api/v1/reviews/:id
// @access Public

exports.getReview= asyncHandler(async (req:Request, res:Response & { advancedResults: IAdvancedResults }, next: NextFunction) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })
    if(!review){
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`,404))
    }
    res.status(200).json({
        success: true,
        data:review
    })
    
})

// @desc add review
// @route POST /api/v1/bootcamp/:bootcampId/reviews
// @access Private

exports.addReview= asyncHandler(async (req:any, res:Response & { advancedResults: IAdvancedResults }, next: NextFunction) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp found with the id of ${req.params.bootcampId}`,404))
    }

    const review = await Review.create(req.body)
    res.status(201).json({
        success: true,
        data:review
    })
    
})

// @desc update review
// @route PUT /api/v1/reviews/:id
// @access Private

exports.updateReview= asyncHandler(async (req:any, res:Response & { advancedResults: IAdvancedResults }, next: NextFunction) => {
    
    let review = await Review.findById(req.params.id)
    if(!review){
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`,404))
    }

    //make sure review belongs to user or user is admin
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`Not authorized to update review`,403))
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true
    })
    res.status(200).json({
        success: true,
        data:review
    })
    
})


// @desc delete review
// @route DELETE /api/v1/reviews/:id
// @access Private

exports.deleteReview= asyncHandler(async (req:any, res:Response & { advancedResults: IAdvancedResults }, next: NextFunction) => {
    
    let review = await Review.findById(req.params.id)
    if(!review){
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`,404))
    }

    //make sure review belongs to user or user is admin
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`Not authorized to delete review`,403))
    }

    await review.deleteOne()
    
    res.status(200).json({
        success: true,
        data:{}
    })
    
})