
import { Course } from "../models/Course";

const express = require('express');
const {getCourses, getCourse, addCourse,updateCourse, deleteCourse } 
= require('../controllers/courses')
const router = express.Router({
    mergeParams: true
})

import { advancedResults } from "../middleware/advancedResult";
const {protect, authorize} = require('../middleware/auth')

router
.route('/')
.get(advancedResults(Course,{
    path: 'bootcamp',
    select: 'name description'
}), getCourses)
.post(protect,  authorize('publisher','admin'), addCourse)

router
.route('/:id')
.get(getCourse)
.put(protect,  authorize('publisher','admin'), updateCourse)
.delete(protect,  authorize('publisher','admin'), deleteCourse)

module.exports = router