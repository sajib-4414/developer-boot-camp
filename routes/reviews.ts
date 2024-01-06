
const express = require('express');
const {getReviews, getReview, addReview , updateReview, deleteReview} 
= require('../controllers/reviews');
const router = express.Router({
    mergeParams: true
})

import { advancedResults } from "../middleware/advancedResult";
import { Review } from "../models/Review";
const {protect, authorize} = require('../middleware/auth')

router
.route('/')
.get(advancedResults(Review,{
    path: 'bootcamp',
    select: 'name description'
}), getReviews)
.post(protect, authorize('user','admin'), addReview)

router
.route('/:id')
.get( getReview)
.put( protect, authorize('user','admin'), updateReview)
.delete(protect, authorize('user','admin'), deleteReview)

module.exports = router