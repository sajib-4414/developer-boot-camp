import mongoose from "mongoose";
import { BootcampDocumentInterface } from "./Bootcamp";
import Colors = require('colors.ts');
const colors = require('colors');
export interface CourseDocInterface extends mongoose.Document{
    title:string,
    description:string,
    weeks:string,
    tuition: number;
    minimumSkill:string;
    scholashipAvailable:boolean;
    createdAt:Date;
    bootcamp:BootcampDocumentInterface;
}

const CourseSchema = new mongoose.Schema<CourseDocInterface, CourseModelInterface>({
    title: {
        type: String, 
        trim:true,
        required: [true, 'Please add a course title']
    },
    description:{
        type: String, 
        required: [true, 'Please add a description']
    },
    weeks:{
        type: String, 
        required: [true, 'Please add a number of weeks']
    },
    tuition:{
        type: Number, 
        required: [true, 'Please add tuition']
    },
    minimumSkill:{
        type: String, 
        required: [true, 'Please add a minimum skill'],
        enum:['beginner','intermediate','advanced']
    },
    scholashipAvailable:{
        type: Boolean,
        default: false
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    bootcamp:{
        type: mongoose.Schema.ObjectId,
        ref:'Bootcamp',
        required:true
    }
})

//Static method to get avg of course tuitions
const getAvg = async function(this:any, bootcampId:string){
    const obj = await this.aggregate([{
        $match: { bootcamp: bootcampId}
    },
    {
        $group:{
            _id: '$bootcamp',
            averageCost:{$avg: '$tuition' }
        }
    }])
    try{
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
            averageCost: Math.ceil(obj[0].averageCost/10)*10
        })
    }catch(err){
        console.log(err)
    }
}
CourseSchema.static('getAverageCost',getAvg)

//Call getaveragecost after save
CourseSchema.post('save', async function(this:any){
    // console.log('Post save hook running...'.blue)
    // this.constructor.getAverageCost()
    (this.constructor as typeof Course).getAverageCost(this.bootcamp)
})

//Call getaveragecost before remove
CourseSchema.pre('deleteOne', { document: true, query: false }, async function (this: any) {
    this.constructor.getAverageCost(this.bootcamp);
})

interface CourseModelInterface extends mongoose.Model<CourseDocInterface>{
    getAverageCost(bootcampId:any): CourseDocInterface;
}
const Course = mongoose.model<CourseDocInterface, CourseModelInterface>('Course', CourseSchema);


export {Course}