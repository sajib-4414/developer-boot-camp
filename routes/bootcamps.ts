const expressinstance = require('express');
const {getBootcamp,
    getBootcamps,
    createBootcamp,
    deleteBootcamp, 
    updateBootcamp,
    getBootcampsInRadius } 
= require('../controllers/bootcamps')
const router = expressinstance.Router()

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