const ErrorResponseInstace = require('../utils/errorResponse')

const errorHandler = (err:any, req:any, res:any, next:any) => {
    let error = {...err}
    error.message = err.message
    console.log(err)
    //mongoose bad object id
    if(err.name === 'CastError'){
        const message = `Resource not found with`
        error = new ErrorResponseInstace(message, 404)
    }

    //mongoose duplicate key
    if(err.code === 11000){
        const message = `Duplicate field entered`
        error = new ErrorResponseInstace(message, 400)
    }

    //mongoose validation error
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map((val:any)=>{return val.message})
        error = new ErrorResponseInstace(message,400)
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server error'
    })
}

module.exports = errorHandler