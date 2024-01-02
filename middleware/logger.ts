//this is a Middleware

//@desc Logs request to the console
const logger = (req:any, res:any, next:any)=>{
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`)
    next();
}

module.exports = logger