import mongoose from "mongoose";
import  brcypt  from "bcryptjs";
import jwt from 'jsonwebtoken'
import crypto from 'crypto';
export interface UserDoc extends mongoose.Document {
    name: string;
    email: string;
    role: 'user' | 'publisher';
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    createdAt?: Date;
    // Add the method to the interface
    getSignedJWTToken: () => string;
    getResetPasswordToken:()=>string;
    matchPassword: (password:string) => boolean;
}

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please add a name']
    },
    email:{
        type: String, 
        match:[
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ],
        required: [true, 'Please add an email'],
        unique: true
    },
    role:{
        type: String,
        enum:['user','publisher'],
        default: 'user'
    },
    password:{
        type: String,
        required: [true, 'please add a password'],
        minlength:6,
        select: false //dont show when retrieving
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt:{
        type: Date,
        default: Date.now
    }
})

//Encrypt password using brcypt
userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        next()
    }
    const salt = await brcypt.genSalt(10)
    this.password = await brcypt.hash(this.password,salt)
})


//this will be a method on the document, not the schema
//sign JWT and return
userSchema.methods.getSignedJWTToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRE!
    })
    
}

//match user entered password
userSchema.methods.matchPassword = async function(enteredPassword:string){
    return await brcypt.compare(enteredPassword, this.password)
    
}

//generate a hash password token
userSchema.methods.getResetPasswordToken = async function(){
    //generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //hash token and set to reset password field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //set expire
    this.resetPasswordExpire = Date.now()+ 10*60*1000;
    return resetToken
    
}

interface UserModelInterface extends mongoose.Model<UserDoc>{
    //add any method you want to add on the schema like with static
}
const User = mongoose.model<UserDoc, UserModelInterface>('User', userSchema);

export {User}