import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { Admin } from "../models/Admin.model.js"
import ApiResponse from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

// creating a method for generating access and refresh tokens for using in this file
const generateAccessAndRefreshToken = async (adminId) => {
    try {
        // finding the user by its adminId
        const admin = await Admin.findById(adminId);
        // generating both the tokens
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();
        // setting the refresh token in admin object(Database), which is coming from above constant
        admin.refreshToken = refreshToken;
        // Saving the object but as we know monogoDB always validate all the feilds before saving then password also going to be validate therefore to stop that validation we will use ({validateBeforeSave: false})
        await admin.save({validateBeforeSave: false});
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

const registerAdmin = asyncHandler( async (req, res) => {
    // Take data from request body (get the Admin details from frontend )
    // validation - not empty
    // check if Admin already exists -> email, AdminName
    // check for avata
    // upload avatar to clodinary
    // create Admin object -> create entry in database
    // remove password and refresh token feild from response 
    // check for Admin creation
    // return response

    const { email, password } = req.body;               // req.body is an object, possibly from a server response containing properties like username, email and password.
                                                                 // The { username, email, password } syntax pulls these specific properties out of req.body and assigns them directly to new variables with the same names.
                                                                // Now, username, email and password are individual constants containing the values from req.body.

    if(    // some is the method on array on which we can check any condition on each element of the array and according to the codition it will return true or false.
        [email, password].some((feild) => feild?.trim() === "")  // In the some() method this statement(feild?.trim() === "") means if feild is present then trim it then check if it is equals to "" => output will be boolean
    ){
        throw new ApiError(400, "All feilds are required")
    }
    // checking weather is user is existing or not
    const existedAdmin = await Admin.findOne({email})
    if(existedAdmin){
        throw new ApiError(409, "User with same Email, already exists")
    }

    // creating the Admin on database
    const admin = await Admin.create({
        email: email,
        password: password,
    })

    const createdAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    );
    if(!createdAdmin){
        throw new ApiError(500, "Something went wrong while registering the user")
    } else {
        console.log("The Admin is Created with the email :",admin.email);
    }

    return res.status(201).json(
        new ApiResponse(200, createdAdmin, "Admin registered successfully")
    )
})

const loginAdmin = asyncHandler( async (req, res) => {
    // Take data from request body => All the feild for the login => Adminname, password, email, refreshToken, accessToken
    // Find the Admin, weather the Admin exists or not
    // check the password, weather the password is correct or not
    // If the password is correct then generate the access and refresh token
    // send all these token in the form of cookies.
    // send the response that the Admin is logged in.
    
    const { email, password } = req.body;                   // req.body means the current request u are sending to the server 
                                                            // in this case the console.log(req.body) will be 
                                                            // {
                                                            //   username: 'thunder_blood_9',
                                                            //   email: 'ayandragon9@gmail.com',
                                                            //   password: 'thunderblood@9'
                                                            // }    
                                                            // because this the data we are sending to the req.body which is getting displayed

    if(!email){
        throw new ApiError(400, "Email is required")
    }

    const admin = await Admin.findOne({email})
    if(!admin){
        throw new ApiError(404, "Admin does not exists")
    }

    const isPasswordValid = await admin.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Password is incorrect")
    }
    // $2b$10$zqrgF1wSjm6GYLev0UknV.m6eHLyziYBZy0SJcZar2zDLzXkl99r2
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(admin._id);

    const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        // secure: true       // by adding this we are not getting cookies therefore we are commenting it
    } 

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                admin: loggedInAdmin, accessToken, refreshToken
            },
            "Admin logged in Successfully!!!"
        )
    )
    
})

const logoutAdmin = asyncHandler( async(req, res) => {
    await Admin.findByIdAndUpdate(
        req.admin._id,
        {
            $set: {
                refreshToken: undefined       // this removes the field from document basically we are setting(updating) the value
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        // secure: true       // by adding this we are not getting cookies therefore we are commenting it
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged Out"))
})


const refreshAccessToken = asyncHandler( async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if(!incomingRefreshToken){
            throw new ApiError(401, "Don't get the incoming refresh token")
        }
        
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.ADMIN_REFRESH_TOKEN_SECRET);
        
        const admin = await Admin.findById(decodedToken?._id);
        if(!admin){
            throw new ApiError(401, "Dont get the admin because of invalid refresh token")
        }
        
        const options = {
            httpOnly: true,
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(admin._id);
        
        return res
        .status(200)
        .cookie("AccessToken", accessToken, options)
        .cookie("RefreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, newRefreshToken},
                "admin Access Token Refreshed Successfully!!!"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    const admin = await Admin.findById(req.admin?._id);
    if(!admin){
        throw new ApiError(404, "admin not found")
    }

    const isPasswordCorrect = await admin.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    admin.password = newPassword;
    await admin.save({validateBeforeSave:true})

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password Changed Successfully")
    )
})

const getCurrentAdmin = asyncHandler( async (req, res) => {
    const admin = await Admin.findById(req.admin?._id).select("-password")
    if(!admin){
        throw new ApiError(401, "Error : admin not found")
    }
    console.log("admin Data : ")
    console.log(admin)

    return res
    .status(200)
    .json(
        new ApiResponse(200, admin, "Current admin fetched successfully")
    )
})

const updateAccountDetials = asyncHandler( async (req, res) => {
    const {email} = req.body;
    if(!email){
        throw new ApiError(400, "All feilds are required")
    }

    const admin = await Admin.findByIdAndUpdate(
        req.admin?._id,
        {
            $set: {
                email: email
            }
        },
        { new: true }
    ).select("-password");
    if(!admin){
        throw new ApiError(401, "admin not found")
    }
    console.log(admin)

    return res
    .status(200)
    .json(
        new ApiResponse(200, admin, "Account details updated Successfully")
    )
})


export {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetials,
    getCurrentAdmin,

};