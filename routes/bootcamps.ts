const expressinstance = require('express');
import { Bootcamp } from '../models/Bootcamp';
import { advancedResults } from './../middleware/advancedResult';
const {getBootcamp,
    getBootcamps,
    createBootcamp,
    deleteBootcamp, 
    updateBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload } 
= require('../controllers/bootcamps')



//include other resource routers
const courseRouter = require('./courses')

const router = expressinstance.Router()

// Reroute into other resource routers
router.use('/:bootcampId/courses', courseRouter)

router
.route('/radius/:zipcode/:distance')
.get(getBootcampsInRadius)


router
.route('/:id/photo').put(bootcampPhotoUpload)


router
.route('/')
.get(advancedResults(Bootcamp, 'courses'),getBootcamps)
.post(createBootcamp)

router
.route('/:id')
.get(getBootcamp)
.put(updateBootcamp)
.delete(deleteBootcamp)

module.exports = router