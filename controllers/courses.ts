import { NextFunction,Request,Response } from "express"
import { Entry } from "node-geocoder"
import { CourseDocInterface } from "../models/Course"
import { BootcampDocumentInterface } from "../models/Bootcamp"

// the standard before export {functionname} came in 2016. 
//was exports.methodname
const asyncHandler = require('../middleware/async')
const Course = require('../models/Course')
const BootCamp = require('../models/Bootcamp')
const ErrorResponse= require('../utils/ErrorResponse')

// @desc Get courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public

exports.getCourses = asyncHandler(async (req:Request, res:Response, next: NextFunction) => {
    let query;
    if(req.params.bootcampId){
        query = Course.find({bootcamp: req.params.bootcampId})
    }
    else{
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        });
    }

    const courses = await query;
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    })
})


// @desc Get a single course
// @route GET /api/v1/courses/:id
// @access Public

exports.getCourse = asyncHandler(async (req:Request, res:Response, next: any) => {
    console.log("id is",req.params.id)
    const course:CourseDocInterface = await Course.findById(req.params.id).populate({
        path:'bootcamp',
        select: 'name description'
    })
    if(!course){
        return next(new ErrorResponse(`No course with the id ${req.params.id}`),404)
    }
    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc Add a course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private

exports.addCourse = asyncHandler(async (req:Request, res:Response, next: any) => {
    
    req.body.bootcamp = req.params.bootcampId

    const bootcamp:BootcampDocumentInterface = await BootCamp.findById(req.params.bootcampId)

    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp with the id ${req.params.id}`),404)
    }
    const course:CourseDocInterface = await Course.create(req.body)
    res.status(200).json({
        success: true,
        data: course
    })
})