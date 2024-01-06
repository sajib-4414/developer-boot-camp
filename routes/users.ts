const express = require('express');
const {getUsers, createUser, getUser, updateUser, deleteUser } 
= require('../controllers/users')

const {protect, authorize} = require('../middleware/auth')
const router = express.Router({
    mergeParams: true
})
import { advancedResults } from "../middleware/advancedResult";
import { User } from "../models/User";

router.use(protect) //protects all the routes below
router.use(authorize('admin'))

router
.route('/')
.get(advancedResults(User), getUsers)
.post(createUser)

router
.route('/:id')
.get(getUser)
.put(updateUser)
.delete(deleteUser)


module.exports = router