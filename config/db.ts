const mongooseinstance = require('mongoose')
import Colors = require('colors.ts');

const connectDB = async ()=>{
    const conn = await mongooseinstance.connect(process.env.MONGO_URI)

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold)
}

module.exports = connectDB;