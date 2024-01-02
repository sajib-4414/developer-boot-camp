const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
import Colors = require('colors.ts');

//load env vars
dotenv.config({
    path:'./config/config.env'
})

//load models
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')

//connect to db
mongoose.connect(process.env.MONGO_URI)

//read the json files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`,'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`,'utf-8'))

//import into db
const importData = async()=>{
    try{
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
         console.log('Data imported....'.green.inverse)


        process.exit()
    }catch(err){
        console.error(err)
    }
}

//Delete data
const deleteData = async()=>{
    try{
        await Bootcamp.deleteMany()//no option mean it will delete all of the data
        await Course.deleteMany()//no option mean it will delete all of the data
         console.log('Data deleted....'.red.inverse)


        process.exit()
    }catch(err){
        console.error(err)
    }
}
//node seeder argument-> this argument is argv[2]
if(process.argv[2]=== '-i'){
    importData()
}
else if(process.argv[2] === '-d'){
    deleteData()
}