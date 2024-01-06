import { NextFunction,Request,Response } from "express"
import { Entry } from "node-geocoder"
import { Course, CourseDocInterface } from "../models/Course"
import { Bootcamp, BootcampDocumentInterface } from "../models/Bootcamp"
import { IAdvancedResults, advancedResults } from './../middleware/advancedResult';

// the standard before export {functionname} came in 2016. 
//was exports.methodname
const asyncHandler = require('../middleware/async')
const ErrorResponse= require('../utils/ErrorResponse')

// @desc Get courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public

exports.getCourses = asyncHandler(async (req:Request, res:Response & { advancedResults: IAdvancedResults }, next: NextFunction) => {

    if(req.params.bootcampId){
        const courses = await Course.find({bootcamp: req.params.bootcampId})
        res.status(200).json({
            success: true, 
            count: courses.length,
            data: courses
        })
    }
    else{
        res.status(200).json(res.advancedResults)
    }
    
})


// @desc Get a single course
// @route GET /api/v1/courses/:id
// @access Public

exports.getCourse = asyncHandler(async (req:Request, res:Response, next: any) => {
    console.log("id is",req.params.id)
    const course:CourseDocInterface|null = await Course.findById(req.params.id).populate({
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

exports.addCourse = asyncHandler(async (req:any, res:Response, next: any) => {
    
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id;

    const bootcamp:BootcampDocumentInterface|null = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp with the id ${req.params.id}`),404)
    }

    //make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !=='admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add course to this bootcamp`,403))
    }

    const course:CourseDocInterface = await Course.create(req.body)
    res.status(200).json({
        success: true,
        data: course
    })
})


// @desc Update a course
// @route PUT /api/v1/courses/:id
// @access Private

exports.updateCourse = asyncHandler(async (req:any, res:Response, next: any) => {

    let course:CourseDocInterface|null = await Course.findById(req.params.id)

    if(!course){
        return next(new ErrorResponse(`No course with the id ${req.params.id}`),404)
    }

    //make sure user is bootcamp owner
    if(course.user.toString() !== req.user.id && req.user.role !=='admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update course ${course._id}`,403))
    }
    
    course = await Course.findByIdAndUpdate(req.params.id, req.body,{
        new: true, //after update fetch from database
        runValidators:true
    })
    res.status(200).json({
        success: true,
        data: course
    })
})


// @desc Delete a course
// @route DELETE /api/v1/courses/:id
// @access Private

exports.deleteCourse = asyncHandler(async (req:any, res:Response, next: any) => {

    const course:CourseDocInterface|null = await Course.findById(req.params.id)

    if(!course){
        return next(new ErrorResponse(`No course with the id ${req.params.id}`),404)
    }
    //make sure user is bootcamp owner
    if(course.user.toString() !== req.user.id && req.user.role !=='admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete course ${course._id}`,403))
    }
    
    await course.deleteOne()

    res.status(200).json({
        success: true,
        data: {}
    })
})