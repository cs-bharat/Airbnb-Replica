class ExpressError extends Error {
    constructor(statusCode, Message){
       super();
       this.statusCode = statusCode
       this.Message = Message
    }
}
module.exports  = ExpressError