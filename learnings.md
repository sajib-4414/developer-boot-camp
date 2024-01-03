#### Middleware
- creating middlware that adds something to the request, and runs before all requests.
`const app = express();
//this is a Middleware
const logger = (req, res, next)=>{
    req.hello = 'Hello World';
    console.log('Middleware ran')
    next();
}

//app.use(middleware) means this middleware will run for all requests now.
//I think i also declared middleware in ticketing project, there i passed it in  the request response
//handler method. so this is another system. 
app.use(logger)`
- we will use morgan logger as middleware, a comprehensive logger middleware. at minimum morgan('dev')
prints this comphrensive stats of a request, `POST /api/v1/bootcamps/ 200 2.579 ms - 46`

#### exporting how
- standard way of exporting in nodejs is exports.methodname = {}
`//exports.functionname this is the standard way of wriitng nodejs express apis
//its the standard before export {functionname} came in 2016. 

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = (req, res, next)=>{
    res.status(200).json({
        success:true,
        msg:'Show all bootcamps',
        hello:req.hello
    })
}`
- this is another way of exporting in nodejs. `module.exports = logger`

- module.exports = router , this is imported like this, const bootcamps = require('./routes/bootcamps')
- ``exports.updateBootcamp = (req, res, next)=>{
    res.status(200).json({
        success:true,
        msg:`update bootcamp ${req.params.id}`
    })
}``
this is also imported as 
``const {getBootcamp,
    getBootcamps,
    createBootcamp,
    deleteBootcamp, 
    updateBootcamp, } 
= require('../controllers/bootcamps')``

#### Exception Handling
- global try catch in server.js
`//this is global try catch handling    
//Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`)
    //Close server & exit process
    server.close(()=>{
        process.exit(1)
    })
})`
- error handling middleware if you want to use globally, add it after attaching the routers, because middleare works
linearly, like first routes+routehandler should go, then the error handler[I think]
`//mount routers
app.use('/api/v1/bootcamps', bootcamps)

//mount error handler then
app.use(errorHandlerInstance)

in the file of eeror handler
const errorHandler = (err:any, req:any, res:any, next:any) => {
    console.log(err.stack.red)
    res.status(500).json({
        success: false,
        error: err.message
    })
}

module.exports = errorHandler

now if you just do next(err) then error handler will get the error, and handle it appropriately.
exports.getBootcamp = async (req:any, res:any, next:any)=>{
    try{
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(new ErrorResponseinstance(`Bootcampt not found with id of ${req.params.id}`,404))
        }
        res.status(200).json({
            success:true,
            data:bootcamp
        })
    }catch(err){
        next(err) //this now calls the error handler instead of built in express error handler which returns html response to client
    }
    
}
`
- in this project we used own error handler, instead of express validator
- we used applying some DRY from here: https://www.acuriousanimal.com/blog/20180315/express-async-middleware
according to this, we wrote,
`const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next)

module.exports = asyncHandler`
now if we wrap our controller with this, calling next(err) is no longer needed.
`exports.deleteBootcamp = asyncHandler(async (req:any, res:any, next:any)=>{
    try{
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)
        if(!bootcamp){
            return next(new ErrorResponseinstance(`Bootcampt not found with id of ${req.params.id}`,404))
        }
        res.status(200).json({
            success:true,
            data:{}
        })
    }catch(err){
        next(err)
    }
})`
will be
`
exports.deleteBootcamp = asyncHandler(async (req:any, res:any, next:any)=>{
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)
    if(!bootcamp){
        return next(new ErrorResponseinstance(`Bootcampt not found with id of ${req.params.id}`,404))
    }
    res.status(200).json({
        success:true,
        data:{}
    })
    
})`
wrapper code automatically catches error and calls next(err)
- after update fetch the udpated copy on the object:
`course = await Course.findByIdAndUpdate(req.params.id, req.body,{
        new: true, //after update fetch from database
        runValidators:true
    })`



### Request, response handling in express
- to parse the request body or retrieve the request body from request, we need this middleware.
//Body Parser
//this helps parse the body from the requset body
app.use(express.json())
- mongodb mongoose orm allows to control the schema, types, objects at application level unlike relational db.
- **Handling file upload**:
  - install express file upload and file upload types
  - create a upload directory, we created uploads/public directory
  - now, we want the frontnend/api consumer to be able to access the image inside the public/uploads , i mean public reseources with the root url, then the folder name, for ex: image with root url/uploads like this, localhost:5000/uploads/file-name.jpg. Therefore we need to mount the public folder as static folder in server file. 
  ```
  //set static folder
  app.use(express.static(path.join(__dirname,'public')))
  ```
  - Then follow the photo upload method of bootcamp route.



## Mongoose:
- update and get updated doc from db:
 `const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators:true
    })``
new: true: This option indicates that Mongoose should return the modified document rather than the original one. In this case, it ensures that the bootcamp variable will contain the updated document after the update operation.
runValidators: true: This option tells Mongoose to run validators defined in the schema when performing the update operation. 
- mongoose also has middlware, will apply. we will deal with document middleware mostly.
- Querying with url paratemers:
because of this we can pass queryes via url parameters
 `let query;
    let queryStr = JSON.stringify(req.query)

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`)
    console.log(queryStr)

    query = Bootcamp.find(JSON.parse(queryStr));`
now like this, {{URL}}/api/v1/bootcamps?careers[in]=Business
we are converting gt,lt, in queries to query string to query the database
- supporting select column names:
url: {{URL}}/api/v1/bootcamps?select=name,description,housing
`
//step1: //first creating a query without the seelct fields.
//copy request.query
    const reqQuery = {...req.query};

    //Fields to exclude
    const removeFields = ['select','sort']

    //Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param=> delete reqQuery[param])

    //create query string
    let queryStr = JSON.stringify(reqQuery)
    query = Bootcamp.find(JSON.parse(queryStr));
    

//step2: now adding select to the query.
    //Select Fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ')
        console.log(fields)
        // console.log(query)
        query = query.select(fields);
    }

    //Executing query
    const bootcamps = await query;
`
- supporting sort:
url will be {{URL}}/api/v1/bootcamps?sort=-name
minus (-) means descending, no minus means ascending.
in the above query of select, add this before executing the query
`//step3: adding sort to the Query if supplied, before executing the query
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
}`
- supporting pagination:
url: {{URL}}/api/v1/bootcamps?limit=2&page=2
`//Fields to exclude
    const removeFields = ['select','sort','page','limit']
    //... same as select step 1,
    
    //step2: extract pagination information , Pagination
    const page = parseInt(req.query.page, 10) ||1;
    const limit = parseInt(req.query.limit, 10) || 25;

    const startIndex = (page-1)*limit;
    const endIndex = page*limit;
    const total = await Bootcamp.countDocuments()
    query = query.skip(startIndex).limit(limit)
    //then execute the query, step3
    
    //step4: adding the next page if exists, and prev page if exists with limit in the response
    //pagination result
    const pagination:any = {};

    //if we are not yet the end, add next page
    if(endIndex<total){
        pagination.next = {
            page:page + 1,
            limit
        }
    }

    //if we are in page 1,2.., adding previous page
    if(startIndex>0){
        pagination.prev = {
            page:page - 1,
            limit
        }
    }

    res.status(200).json({
        success:true,
        count: bootcamps.length,
        pagination,
        data:bootcamps
    })
`
- populate only 2 fields of a sub object,
`
query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        });`

- mongoose virtual property:
if you have 
`course{
    bootcamp:{}
}`
now you want reverse relationship, meaning for a bootcamp, you want to list all the courses assocaited with it,
just for the response perpose(to show, but not keep in database), you use virtual property in bootcamp.
`Bootscampschema = new mongoose.sehcmea({
....
},
{
    toJSON:{
        virtuals:true
    }, 
    toObject:{
        virtuals:true
    }
})

//reverse populate with virtuals
BootcampSchema.virtual('courses',{
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});
`
include virtual properties when converting a document to JSON (toJSON) or a plain JavaScript object (toObject). Virtual properties in Mongoose are properties that are not stored in the database but are computed or derived from other properties.
now to show it, you need to call populate
query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');
- doing on delete cascade:
delete courses when bootcamp is deleted:
BootcampSchema.pre('deleteOne', { document: true, query: false }, async function (this: any, next:NextFunction) {
    const bootcampId = this._id;
    console.log(`Course being removed from bootcamp ${bootcampId}`)
    await this.model('Course').deleteMany({bootcamp: bootcampId})
    next()
})
if we call FindByIDAndDelete on bootcamp,
//we have to call findbyid and delete seperately to have this hook in effect. 
- used mongoose aggregate to auto update the average cost of a bootcamp when a course is added or removed.




##### ts vs js
- ts class vs js class
 ``` 
 class ErrorResponse extends Error{
    statusCode: number; //for typescript classes, it must have the property before calling this.property name
    //in javascript, python its dynamically created when called this.,statuiscode in the constructor
    constructor(message:string, statusCode: number){
        super(message);
        this.statusCode = statusCode;
    }
}
 ```

#### location
- we will use node-geocoder with mapquest, mapquest retrieves the location from address string. 
- we will do a radius based search
