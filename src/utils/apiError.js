class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        //call the parent constructor to set the message property
        super(message);

        //set custom properties specific to ApiError
        this.statusCode = statusCode;  //http status code //initialize the statusCode property
        this.data = null;  //Placeholder for additional data if needed //initialize the data property
        this.message = message; //Error message //the message property, already set by the super(message)
        this.success = false;  //Indicate the success status(always false for errors)
        this.errors = errors;  //Array of additional error details

        if (stack) {
            this.stack = stack; //use the provided stack trace if available
        } else {
            Error.captureStackTrace(this, this.constructor); //capture the stack trace
        }
    }
}

export { ApiError };
