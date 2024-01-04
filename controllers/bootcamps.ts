//exports.functionname this is the standard way of wriitng nodejs express apis
//before 2016 syntax export {name} came.
import { Entry } from "node-geocoder"
import { Bootcamp, BootcampDocumentInterface } from "../models/Bootcamp"
import { NextFunction, Request, Response } from "express"
import { UploadedFile } from "express-fileupload"
import * as path from 'path';
import { IAdvancedResults } from './../middleware/advancedResult';
//its the standard before export {functionname} came in 2016. 
const asyncHandler = require('../middleware/async')
const ErrorResponseinstance = require('../utils/ErrorResponse')
const geocoder = require('../utils/geocoder')


// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req:any, res:Response & { advancedResults: IAdvancedResults }, next:NextFunction)=>{
    
    res.status(200).json(res.advancedResults)
   
})

// @desc Get a single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req:any, res:any, next:any)=>{
    const bootcamp = await Bootcamp.findById(req.params.id);
    if(!bootcamp){
        return next(new ErrorResponseinstance(`Bootcampt not found with id of ${req.params.id}`,404))
    }
    res.status(200).json({
        success:true,
        data:bootcamp
    })
   
})

// @desc Create a new bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asyncHandler(async (req:any, res:any, next:any)=>{
    //add user to req.body
    req.body.user = req.user.id;

    //check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({user:req.user.id})

    //if the user not an admin, they can only add one bootcamp

    if(publishedBootcamp && req.user.role !== 'admin'){
        return next(new ErrorResponseinstance(`The user with ID ${req.user.id} has already published a bootycamp`,400))
    }

    const bootcamp:BootcampDocumentInterface|null = await Bootcamp.create(req.body)
    res.status(201).json({
        success:true,
        data:bootcamp
    })
    
})

// @desc Update a new bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
//new: true: This option indicates that Mongoose should return the modified document rather
// than the original one. In this case, it ensures that the bootcamp variable will contain the 
//updated document after the update operation.
//runValidators: true: This option tells Mongoose to run validators defined in the schema
// when performing the update operation.
exports.updateBootcamp = asyncHandler(async (req:any, res:any, next:any)=>{
    const bootcamp:BootcampDocumentInterface|null = await Bootcamp.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators:true
    })
    if(!bootcamp){
        return next(new ErrorResponseinstance(`Bootcampt not found with id of ${req.params.id}`,404))
    }
    res.status(200).json({
        success:true,
        data:bootcamp
    })
    
})

// @desc Delete a new bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asyncHandler(async (req:any, res:any, next:NextFunction)=>{
    const bootcamp:BootcampDocumentInterface|null = await Bootcamp.findById(req.params.id)
    if(!bootcamp){
        return next(new ErrorResponseinstance(`Bootcamp not found with id of ${req.params.id}`,404))
    }
    await bootcamp.deleteOne();//will trigger the pre delete hook
    res.status(200).json({
        success:true,
        data:{}
    })
    
})


// @desc get bootcamps within a radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = asyncHandler(async (req:any, res:any, next:any)=>{
    const {zipcode, distance} = req.params
    
    //get lat lang from geocoder
    const loc:Entry[] = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lang = loc[0].longitude

    //calc radius using radius
    //divide dist by radius of earth
    //earth readius = 3963 MI
    const radius = distance/ 3963;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lang, lat], radius]}}
    })
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})

// @desc Upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private

exports.bootcampPhotoUpload = asyncHandler(async (req:Request, res:Response, next:NextFunction)=>{
    const bootcamp:BootcampDocumentInterface|null = await Bootcamp.findById(req.params.id)
    if(!bootcamp){
        return next(new ErrorResponseinstance(`Bootcamp not found with id of ${req.params.id}`,404))
    }
    
    if(!req.files){
        return next(new ErrorResponseinstance(`Please upload a file`,400))
    }
   const file:UploadedFile = req.files.file as UploadedFile;

   //Make sure the image is a photo
   if(!file.mimetype.startsWith('image')){
    return next(new ErrorResponseinstance(`Please upload an image file starting with name image`,400))
   }
    //check file size
    if(file.size > Number(process.env.MAX_FILE_UPLOAD)){
        return next(new ErrorResponseinstance(`Please upload an image less than ${Number(process.env.MAX_FILE_UPLOAD)/1000} KB`,400))
    }

    //create custom filename
    //path.parse(file.name).ext brings back the file extension from original file
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
    
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err=>{
        if(err){
            console.error(err)
            return next(new ErrorResponseinstance('problem with file upload',500))
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name})
        res.status(200).json({
            success: true,
            data: file.name
        })
    })
})