const slugify = require('slugify');
const geocoder:Geocoder = require('../utils/geocoder')
import  mongoose from "mongoose";
import { Entry, Geocoder } from "node-geocoder";
export interface Location {
    type: 'Point';
    coordinates: [number, number];
    formattedAddress: string;
    street: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
}

export interface BootcampDocumentInterface extends mongoose.Document{
    name:string,
    slug:string,
    description:string,
    website: string;
    phone:string,
    email:string,
    address?:string,
    location:Location,
    careers:string[],
    averageRating:number,
    averageCost:number,
    photo:string,
    housing:boolean,
    jobAssistance:boolean,
    jobGuarantee:boolean,
    acceptGi:boolean,
    createdAt:Date
}

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    slug: String,
    description:{
        type: String, 
        required: [true, 'Please add a description'],
        unique: true,
        trim: true,
        maxlength: [500, 'description can not be more than 50 characters']
    },
    website:{
        type: String, 
        match:[
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String, 
        maxlength: [20, 'Phone can not be more than 20 characters']
    },
    email:{
        type: String, 
        match:[
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ]
    },
    address:{
        type: String,
        required: [true, 'Please add an address']
    },
    location:{
        //GeoJSON point
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
          },
          coordinates: {
            type: [Number],
            index: '2dsphere'
          },
          formattedAddress:String,
          street:String,
          city:String,
          state:String,
          zipcode: String,
          country: String,
    },
    careers:{
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating:{
        type:  Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must cannot be more than 10']
    },
    averageCost:Number,
    photo: {
        type: String,
        default:'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default:false
    },
    jobAssistance: {
        type: Boolean,
        default:false
    },
    jobGuarantee: {
        type: Boolean,
        default:false
    },
    acceptGi: {
        type: Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    }
},
{
    toJSON:{
        virtuals:true
    }, 
    toObject:{
        virtuals:true
    }
})

//create bootcampt slug from the name
BootcampSchema.pre('save', function(this: BootcampDocumentInterface, next:any){
    this.slug = slugify(this.name,{lower:true})
    next()
})

//Geocode & create location field
BootcampSchema.pre('save', async function(this: BootcampDocumentInterface, next:any){
    const loc:Entry[] = await geocoder.geocode(this.address!)
    this.location = {
        type: 'Point',
        coordinates:[loc[0].longitude!, loc[0].latitude!], 
        formattedAddress:loc[0].formattedAddress!,
        street: loc[0].streetName!,
        city:loc[0].city!,
        state:loc[0].state!,
        zipcode:loc[0].zipcode!,
        country:loc[0].countryCode!,
    }
    //do not save address in DB
    this.address = undefined
    next()
})
// cascade delete courses when a bootcamp is deleted
//doing pre, as we need reference to the deleting bootcamp
//post means deleted
//but this will not Fire, if we call FindByIDAndDelete on bootcamp,
//we have to call findbyid and delete seperately to have this hook in effect. 
BootcampSchema.pre('deleteOne', { document: true, query: false }, async function (this: any, next:any) {
    const bootcampId = this._id;
    console.log(`Course being removed from bootcamp ${bootcampId}`)
    await this.model('Course').deleteMany({bootcamp: bootcampId})
    next()
})

//reverse populate with virtuals
BootcampSchema.virtual('courses',{
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});

interface BootCampModelInterface extends mongoose.Model<BootcampDocumentInterface>{}
const Bootcamp = mongoose.model<BootcampDocumentInterface, BootCampModelInterface>('Bootcamp', BootcampSchema);

export {Bootcamp}