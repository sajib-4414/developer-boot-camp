const express = require('express');
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
import Colors = require('colors.ts');
const errorHandlerInstance = require('./middleware/error')
const connectDBinstance = require('./config/db')

//load env vars
dotenv.config({path:'./config/config.env'})

//connect to database.
connectDBinstance()

//Route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')


const app = express();

//Body Parser
//this helps parse the body from the requset body
app.use(express.json())

//app.use(middleware) means this middleware will run for all requests now.
//I think i also declared middleware in ticketing project, there i passed it in  the request response
//handler method. so this is another system. 


//Dev logging middleware, only run in development
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//mount routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)

//mount error handler then
app.use(errorHandlerInstance)

const PORT = process.env.PORT || 5000;
const server = app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));
    // console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

//this is global try catch handling    
//Handle unhandled promise rejections
process.on('unhandledRejection',(err:any,promise)=>{
    // console.log(`Error: ${err.message}`.red)
    console.log(`Error: ${err.message}`)
    //Close server & exit process
    server.close(()=>{
        process.exit(1)
    })
})