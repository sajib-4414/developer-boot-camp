//exports.functionname this is the standard way of wriitng nodejs express apis

import { Document } from "mongoose"
import { Entry } from "node-geocoder"

//its the standard before export {functionname} came in 2016. 
const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponseinstance = require('../utils/ErrorResponse')
const geocoder = require('../utils/geocoder')


// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req:any, res:any, next:any)=>{
    let query;

    //copy request.query
    const reqQuery = {...req.query};

    //Fields to exclude
    const removeFields = ['select','sort','page','limit']

    //Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param=> delete reqQuery[param])

    console.log(reqQuery)

    //create query string
    let queryStr = JSON.stringify(reqQuery)

    //create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`)

    //Finding resource
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

    //Select Fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ')
        console.log(fields)
        // console.log(query)
        query = query.select(fields);
    }

    //Sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    }
    else{
        query =query.sort('-createdAt')
    }

    //Pagination
    const page = parseInt(req.query.page, 10) ||1;
    const limit = parseInt(req.query.limit, 10) || 25;

    const startIndex = (page-1)*limit;
    const endIndex = page*limit;
    const total = await Bootcamp.countDocuments()
    query = query.skip(startIndex).limit(limit)


    //Executing query
    const bootcamps = await query;

    //pagination result
    const pagination:any = {};

    if(endIndex<total){
        pagination.next = {
            page:page + 1,
            limit
        }
    }

    if(startIndex>0){
        pagination.prev = {
            page:page - 1,
            limit
        }
    }
    console.log(req.query)
    res.status(200).json({
        success:true,
        count: bootcamps.length,
        pagination,
        data:bootcamps
    })
   
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
    const bootcamp = await Bootcamp.create(req.body)
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
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body,{
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
exports.deleteBootcamp = asyncHandler(async (req:any, res:any, next:any)=>{
    const bootcamp:Document = await Bootcamp.findById(req.params.id)
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