const {register, login,getMe} = require('../controllers/auth')
import express from 'express';

const router = express.Router()
const {protect} = require('../middleware/auth')
router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)

module.exports = router