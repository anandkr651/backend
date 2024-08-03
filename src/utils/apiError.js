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
            Error.captureStackTrace(this, this.constructor); 
        }
    }
}

export { ApiError };
/*Custom Stack Trace: In the ApiError class, the stack parameter in the constructor allows for a custom stack trace to be provided when the error is instantiated. If no custom stack trace is provided, Error.captureStackTrace is used to generate the stack trace automatically. */

/*Error: Something went wrong
    at myFunction (/path/to/file.js:10:15)
    at anotherFunction (/path/to/file.js:5:10)
    at Object.<anonymous> (/path/to/file.js:1:1) */

/*In this example, the stack trace shows that the error originated in myFunction at line 10, which was called by anotherFunction at line 5, and so on.

In your ApiError class, handling the stack property allows you to either use a provided stack trace or capture the current one when the error is created, providing flexibility and more detailed error information for debugging.*/