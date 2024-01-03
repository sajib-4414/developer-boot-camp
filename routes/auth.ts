const {register, login} = require('../controllers/auth')
import express from 'express';

const router = express.Router()

router.post('/register', register)
router.post('/login', login)

module.exports = router