### Middleware
- creating middlware that adds something to the request, and runs before all requests.
    ```const app = express();
    //this is a Middleware
    const logger = (req, res, next)=>{
        req.hello = 'Hello World';
        console.log('Middleware ran')
        next();
    }

    //app.use(middleware) means this middleware will run for all requests now.
    app.use(logger)```
you can pass middleware also specificially for a route
- **router apply middlware per url vs for all urls**:
    ```
    router.use(protect) //protects all the routes below
    router.use(authorize('admin'))//protects all the routes below


    router
    .route('/:id/photo').put(protect, authorize('publisher','admin'), bootcampPhotoUpload)//protects only this route
    ```
- we will use morgan logger as middleware, a comprehensive logger middleware. simple usage is ` morgan('dev')`. 
This prints comphrensive stats of a request like this, 

`POST /api/v1/bootcamps/ 200 2.579 ms - 46`

#### Difference in export syntax between 2016 syntax and before
- standard way of Named exporting in nodejs following. this is the standard way of wriitng nodejs express apis before `export {functionname}` this syntax came in 2016.
    ```
    exports.getBootcamps = (req, res, next)=>{
        res.status(200).json({
            success:true,
            msg:'Show all bootcamps',
            hello:req.hello
        })
    }
    // import this with 
    const {getBootcamps} = require('...path')
    ```

## Exception Handling
- **Global Unhandled exception**: try catch in server.js to stop the server if unexpected exception occurs
```
//Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`)
    //Close server & exit process
    server.close(()=>{
        process.exit(1)
    })
})
```
- **Common error handling middleware**: In express if you dont handle any error, it goes to express error handler that returns html error, totally unexpected. 
In this project we used own error handler, instead of express validator with the following approach.

    if you want to use a generic error handler for all the routes, that will show the exception nicely with a 500 to the client then, add it after attaching the routers, because middleare works linearly, like first routes+routehandler should go, then the error handler[I think]. If you want to add for specific set of routes, do this inside a route file not in the server.ts
    ```
    //in error handler file.ts
    const errorHandler = (err:any, req:any, res:any, next:any) => {
        console.log(err.stack.red)
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
    module.exports = errorHandler

    //in server.ts
    //import error handler

    //mount routers
    app.use('/api/v1/bootcamps', bootcamps)

    //mount error handler then
    app.use(errorHandler)
    ```
Now if you just do next(err) then error handler will get the error, and handle it appropriately, I mean it will send a `500` response with the error to the client. 
Example how to use this,
```
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
```
- we used applying some DRY from here, the purpose is to if there is exception, this wrapper will catch it and call the next method automatically, without using try catch for all the controllers. and in our case if next method has error, it will be handled by global error handler. see this, https://www.acuriousanimal.com/blog/20180315/express-async-middleware
according to this, we wrote,
    ```
    const asyncHandler = fn => (req, res, next) =>
     Promise
    .resolve(fn(req, res, next))
    .catch(next)
    module.exports = asyncHandler
    ```
    now if we wrap our controller with this, calling next(err) is no longer needed. Before using the async handler, we have to use try catch for all controllers.
    ```
        exports.deleteBootcamp = asyncHandler(async (req:any, res:any, next:any)=>{
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
    })
    ```
    After using this wrapper, our code simplifies to,
    ```
    exports.deleteBootcamp = asyncHandler(async (req:any, res:any, next:any)=>{
        //no try catch needed
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)
        if(!bootcamp){
            return next(new ErrorResponseinstance(`Bootcampt not found with id of ${req.params.id}`,404))
        }
        res.status(200).json({
            success:true,
            data:{}
        })
        
    })
    ```
    wrapper code automatically catches error and calls next(err)


### Express learnings
- to parse the request body or retrieve the request body from request, we need this middleware.
```
//Body Parser
//this helps parse the body from the requset body
app.use(express.json())
```
- mongodb mongoose orm allows to control the schema, types, objects at application level unlike relational db.
- **Handling file upload**:
  - install express file upload and file upload types
  - create a upload directory, we created uploads/public directory
  - now, we want the frontnend/api consumer to be able to access the image inside the public/uploads , i mean public reseources with the root url, then the folder name, for ex: image with root url/uploads like this, localhost:5000/uploads/file-name.jpg. Therefore we need to mount the public folder as static folder in server file. 
  ```
  //set static folder
  app.use(express.static(path.join(__dirname,'public')))
  ```
  - Then follow the photo upload method of bootcamp route..
- **send JWT token in cookie**:
  cookie properties secure false means it can be sent via http only, and when setting cookie, you have to set `httponly`
    - install cookie parser
    - in the server.js add app.use(cookiepersuer())
    - in the controller, set it as 
    ```
    //signup and signin controller to set cookie
    const jwtCookieExpire = process.env.JWT_COOKIE_EXPIRE;
    if (!jwtCookieExpire) {
        // Handle the case where JWT_COOKIE_EXPIRE is not defined
        throw new Error('JWT_COOKIE_EXPIRE is not defined');
    }
    const options = {
        expires: new Date(Date.now() + Number(jwtCookieExpire)*24*60*60*1000),
        httpOnly: true
    }
    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }
    res.status(statusCode)
    .cookie('token',token, options)
    .json({
        success: true,
        token
    })

    //when servinng an API request from any other controller, or use it in the middleware
    if(req.cookies.token){
        token = req.cookies.token
    }
    ```
- **Maintain ownership**: we check if the req.user from the middleware is the user assocaited with a bootcamp
- **reset password how**? 
    - we have a reset password token and token expiry in user model.
    - For reset password request we generate the expiry as date.now + 10min and save it. Also we generate a token, hash it, store it in the model, but return to the user regular version ONLY.
    - we will hash the regular Token from request body again when user hits api, to match with the stored hash, its like we dont store raw token just like we dont store raw password. 
    - if both hashes match we let the user change password. we also check if the expiry is not over before allowing user to reset password with that token. once reset password is done, or the reset passowrd link api with the token does a 500 error, we delete the resetpasswordtoken and expiry from the user model, to let user try again and for cleanup. 

- reroute nested routes:
we could have routes like `{{URL}}/api/v1/bootcamps/5d725a1b7b292f5f8ceff788/reviews/` or `../reviews/reviewid` that are nested inside bootcamps. if we want to handle these routes in the reviews or say `/courses` in coruses routes
we can **reroute them** from the bootcamp route file, as the pattern will first match the bootcamp route file. 
    ```
    //in the bootcamp route file
    // Reroute into other resource routers
    router.use('/:bootcampId/courses', courseRouter)
    router.use('/:bootcampId/reviews', reviewRouter)

    //in the course route file
    const router = express.Router({
        mergeParams: true
    })
    ```
    now the course router should be able to handle the routes.
## Mongoose:
- update and get updated doc from db:
    ```
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body,{
            new: true,
            runValidators:true
        })
    ```
    `new: true: `This option indicates that Mongoose should return the modified document rather than the original one. In this case, it ensures that the bootcamp variable will contain the updated document after the update operation.

    `runValidators: true` This option tells Mongoose to run validators defined in the schema when performing the update operation. 
- mongoose also has middlware, will apply. we will deal with document middleware mostly.
- **Querying with url paratemers**:
because of this we can pass queryes like `gt lt in` via url parameters
 ```
    let query;
    let queryStr = JSON.stringify(req.query)

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`)

    query = Bootcamp.find(JSON.parse(queryStr));
```
now we can query mongoose with url like this, `{{URL}}/api/v1/bootcamps?careers[in]=Business` . We are converting gt,lt, in queries to query string to query the database
- **supporting select column names from URL with mongoose**:
we want to select columns with url like this,

`url: {{URL}}/api/v1/bootcamps?select=name,description,housing
`
```
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
        query = query.select(fields);
    }

//step3 final: Executing query
    const bootcamps = await query;
```
- **supporting sort from URL parameters**:
url will be `{{URL}}/api/v1/bootcamps?sort=-name`

*minus (-)* means descending, no minus means ascending. To support this, just add these lines in the above query of select, add this before executing the query
```
//step3: adding sort to the Query if supplied, before executing the query
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
}
```
- **supporting pagination via URL**:
we want to support pagination with url like this: `{{URL}}/api/v1/bootcamps?limit=2&page=2`

```
    //step1: Fields to exclude
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
```
- **Populate with select:** populate only 2 fields of a sub object with select,
```
query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        });
```

- **mongoose virtual property**: now you want reverse relationship, meaning for a bootcamp, you want to list all the courses assocaited with it, just for the response perpose(to show, but not keep in database), you use virtual property in bootcamp. if you have 
```
course{
    bootcamp:{...}
}
```

```
//in the bootcamp schema
Bootscampschema = new mongoose.schema({
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
```
This is include virtual properties when converting a document to JSON (toJSON) or a plain JavaScript object (toObject).Virtual properties in Mongoose are properties that are not stored in the database but are computed or derived from other properties. 

Now to show the courses with a bootcamp, you need to call populate in bootcamp controller like this,
```
query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');
```
- **Doing on delete cascade**:
    
    Delete courses when bootcamp is deleted.
    ```
    BootcampSchema.pre('deleteOne', { document: true, query: false }, async function (this: any, next:NextFunction) {
    const bootcampId = this._id;
    
    await this.model('Course').deleteMany({bootcamp: bootcampId})
    next()
    })
    ```
    *if we call FindByIDAndDelete on bootcamp, this will not be triggered*. We have to call **FindById** and **Delete** seperately to have this hook in effect.
    - Used **Mongoose Aggregate** to auto update the average rating of a bootcamp when a review is added or removed.
```
    const getAvgRating = async function(this:any,   bootcampId:string) {
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
        // console.log('Post save hook running...'.blue)
        // this.constructor.getAverageCost()
        (this.constructor as typeof Review).getAverageRating(this.bootcamp)
    })
```

- include a field to get from mongo which is *excluded in the model*, with **+**
```
const user:UserDoc = await User.findById(req.user.id).select('+password')
```
- Allow only one review of a bootcamp per user.
```
ReviewSchema.index ({bootcamp:1, user:1}, {unique:true})
// but this does not work sometimes.
```

#### Typescript vs Javascript
 ``` 
 class ErrorResponse extends Error{
    statusCode: number; //for typescript classes, it must have the property before calling this.property name
    //in javascript, python its dynamically created when called this.,statuscode in the constructor
    constructor(message:string, statusCode: number){
        super(message);
        this.statusCode = statusCode;
    }
}
 ```

#### Location Data
- we will use `node-geocoder` with `mapquest`, `mapquest API` retrieves the location from address string. 
- we will do a radius based search.


### API security:
- preventing nosql inject: `email: {"$gt":""}, password: "valid password"` will match the first database user. if we dont do data sanitizing, this is injection. `mongo-sanitize` or `express-mongo-sanitize`, we will use `express-mongo-sanitize`
- we will use **Helmet** for some **DNS** and other attacks. like cross site scripting. Adds valuable headers to make api secure.
- **Preventing cross site scripting**:
Attackers can put javascript malicious tags in the payload to create a bootcamp like this,
```
   "name": "Devcentral Bootcamp <script>alert(1)</script>",
   which can eventually flow to the forentned
   we will use xss-clean. this wil prevent this cross site scripting attack
```
although it says deprecatred. sot he above input is modified by the xss to 
```
"Devcentral  &lt;script>alert(1)&lt;/script> 
```
so that script is removed.
- **preventing http param polution:** using `hpp` to prevent http param polution, rate limit egulao use korsi.
- **express cors**: CORS enable na thakle ek server e api, arek server e frotnend thakle, request atk dibe.