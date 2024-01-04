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

const {protect, authorize} = require('../middleware/auth')

// Reroute into other resource routers
router.use('/:bootcampId/courses', courseRouter)

router
.route('/radius/:zipcode/:distance')
.get(getBootcampsInRadius)


router
.route('/:id/photo').put(protect, authorize('publisher','admin'), bootcampPhotoUpload)


router
.route('/')
.get(advancedResults(Bootcamp, 'courses'),getBootcamps)
.post(protect, authorize('publisher','admin'), createBootcamp)

router
.route('/:id')
.get(getBootcamp)
.put(protect, authorize('publisher','admin'),updateBootcamp)
.delete(protect, authorize('publisher','admin'),deleteBootcamp)

module.exports = router