class ErrorResponse extends Error{
    statusCode: number; //for typescript classes, it must have the property before calling this.property name
    //in javascript, python its dynamically created when called this.,statuiscode in the constructor
    constructor(message:string, statusCode: number){
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;