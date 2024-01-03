import { advancedResults } from "../middleware/advancedResult";
import { Course } from "../models/Course";

const express = require('express');
const {getCourses, getCourse, addCourse,updateCourse, deleteCourse } 
= require('../controllers/courses')
const router = express.Router({
    mergeParams: true
})

router
.route('/')
.get(advancedResults(Course,{
    path: 'bootcamp',
    select: 'name description'
}), getCourses)
.post(addCourse)
router
.route('/:id')
.get(getCourse)
.put(updateCourse)
.delete(deleteCourse)

module.exports = router