import mongoose from "mongoose";
import { BootcampDocumentInterface } from "./Bootcamp";
import Colors = require('colors.ts');
import { UserDoc } from "./User";
const colors = require('colors');
export interface ReviewDocInterface extends mongoose.Document{
    title:string,
    text:string,
    rating:number,
    createdAt:Date;
    bootcamp:BootcampDocumentInterface;
    user: mongoose.Types.ObjectId
    
}

const ReviewSchema = new mongoose.Schema<ReviewDocInterface, ReviewModelInterface>({
    title: {
        type: String, 
        trim:true,
        maxlength:100,
        required: [true, 'Please add a review title']
    },
    text:{
        type: String, 
        required: [true, 'Please add a text']
    },
    rating:{
        type: Number, 
        min:1,
        max:10,
        required: [true, 'Please add a rating between 1 to 10']
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    bootcamp:{
        type: mongoose.Schema.ObjectId,
        ref:'Bootcamp',
        required:true
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    }
})

//prevent user from submitting more than one review per bootcamp
ReviewSchema.index ({bootcamp:1, user:1}, {unique:true})

//Static method to get avg rating and save
const getAvgRating = async function(this:any, bootcampId:string){
    const obj = await this.aggregate([{
        $match: { bootcamp: bootcampId}
    },
    {
        $group:{
            _id: '$bootcamp',
            averageRating:{$avg: '$rating' }
        }
    }])
    try{
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
            averageRating: obj[0].averageRating
        })
    }catch(err){
        console.log(err)
    }
}
ReviewSchema.static('getAverageRating',getAvgRating)

//Call getaveragecost after save
ReviewSchema.post('save', async function(this:any){
    
    // this.constructor.getAverageCost()
    (this.constructor as typeof Review).getAverageRating(this.bootcamp)
})


//Call getaveragecost before remove
ReviewSchema.post('deleteOne', { document: true, query: false }, async function (this: any) {
    this.constructor.getAverageRating(this.bootcamp);
})


interface ReviewModelInterface extends mongoose.Model<ReviewDocInterface>{
    getAverageRating(bootcampId:any): void;
}
const Review = mongoose.model<ReviewDocInterface, ReviewModelInterface>('Review', ReviewSchema);


export {Review}