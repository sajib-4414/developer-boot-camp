const expressinstance = require('express');
const {getBootcamp,
    getBootcamps,
    createBootcamp,
    deleteBootcamp, 
    updateBootcamp,
    getBootcampsInRadius } 
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
.route('/')
.get(getBootcamps)
.post(createBootcamp)

router
.route('/:id')
.get(getBootcamp)
.put(updateBootcamp)
.delete(deleteBootcamp)

module.exports = router