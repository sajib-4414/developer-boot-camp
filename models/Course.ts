const mongoose2 = require('mongoose');
import mongoose from "mongoose";
import { BootcampDocumentInterface } from "./Bootcamp";
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

const CourseSchema = new mongoose2.Schema({
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

module.exports = mongoose2.model('Course', CourseSchema)