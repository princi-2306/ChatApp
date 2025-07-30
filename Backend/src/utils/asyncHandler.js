// method 1 -> using try catch blocks
// const asyncHandler = (func) => {
//     async (req, res, next) => {
//         try{
//             await func(req, res, next)
//         }
//         catch(err){
//             console.log(`Error : ${err}`);
//             res.status(err.code || 500).json({
//                 success:false,
//                 message: err.message || "Server Error"
//             });
//         }
//     }
// }

// method 2 -> using promises           // promises is similar to if else or try catch -> if the promises is fullfiled ie. true then "resolve" block will run otherwise the "catch" block will run.
const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        Promise.resolve(
            requestHandler(req, res, next)
        ).catch(
            (err) => next(err)
        )
    }
}

export default asyncHandler