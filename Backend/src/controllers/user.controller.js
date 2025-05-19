import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/User.model.js"
import {
    DeleteOnCloudinary,
    UploadOnCloudinary
} from "../utils/Cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

// creating a method for generating access and refresh tokens for using in this file
const generateAccessAndRefreshToken = async (userId) => {
    try {
        // finding the user by its userId
        const user = await User.findById(userId);
        // generating both the tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        // setting the refresh token in user object(Database), which is coming from above constant
        user.refreshToken = refreshToken;
        // Saving the object but as we know monogoDB always validate all the feilds before saving then password also going to be validate therefore to stop that validation we will use ({validateBeforeSave: false})
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // Take data from request body (get the user details from frontend )
    // validation - not empty
    // check if user already exists -> email, username
    // check for avata
    // upload avatar to clodinary
    // create user object -> create entry in database
    // remove password and refresh token feild from response 
    // check for user creation
    // return response

    const { username, email, password } = req.body;               // req.body is an object, possibly from a server response containing properties like username, email and password.
                                                                 // The { username, email, password } syntax pulls these specific properties out of req.body and assigns them directly to new variables with the same names.
                                                                // Now, username, email and password are individual constants containing the values from req.body.

    if(    // some is the method on array on which we can check any condition on each element of the array and according to the codition it will return true or false.
        [username, email, password].some((feild) => feild?.trim() === "")  // In the some() method this statement(feild?.trim() === "") means if feild is present then trim it then check if it is equals to "" => output will be boolean
    ){
        throw new ApiError(400, "All feilds are required")
    }
    // checking weather is user is existing or not
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with same Username or Email, already exists")
    }

    // uploading the avatar
    const avatarLocalPath = [req.files?.avatar[0]?.buffer];
    if(!avatarLocalPath){
        throw new ApiError(400, "Please upload an Avatar");
    }
    const avatar = await UploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(400, "Avatar is required");
    }

    // creating the user on database
    const user = await User.create({
        username: username.toLowerCase(),
        avatar: avatar[0].url,
        email: email,
        password: password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    } else {
        console.log("The User is Created with the username :",user.username);
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler( async (req, res) => {
    // Take data from request body => All the feild for the login => username, password, email, refreshToken, accessToken
    // Find the user, weather the user exists or not
    // check the password, weather the password is correct or not
    // If the password is correct then generate the access and refresh token
    // send all these token in the form of cookies.
    // send the response that the user is logged in.
    
    const { email, username, password } = req.body;         // req.body means the current request u are sending to the server 
                                                            // in this case the console.log(req.body) will be 
                                                            // {
                                                            //   username: 'thunder_blood_9',
                                                            //   email: 'ayandragon9@gmail.com',
                                                            //   password: 'thunderblood@9'
                                                            // }    
                                                            // because this the data we are sending to the req.body which is getting displayed

    if(!(username || email)){
        throw new ApiError(400, "Username or Email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Password is incorrect")
    }
    // $2b$10$zqrgF1wSjm6GYLev0UknV.m6eHLyziYBZy0SJcZar2zDLzXkl99r2
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

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
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully!!!"
        )
    )
    
})

const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
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
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler( async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if(!incomingRefreshToken){
            throw new ApiError(401, "Don't get the incoming refresh token")
        }
        
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401, "Dont get the User because of invalid refresh token")
        }

        const options = {
            httpOnly: true,
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);

        return res
        .status(200)
        .cookie("AccessToken", accessToken, options)
        .cookie("RefreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, newRefreshToken},
                "User Access Token Refreshed Successfully!!!"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(404, "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave:true})

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password Changed Successfully")
    )
})

const getCurrentUser = asyncHandler( async (req, res) => {
    const user = await User.findById(req.user?._id).select("-password")
    if(!user){
        throw new ApiError(401, "Error : User not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Current user fetched successfully")
    )
})

const updateAccountDetials = asyncHandler( async (req, res) => {
    const {username, email} = req.body;
    if(!username || !email){
        throw new ApiError(400, "All feilds are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username: username,
                email: email
            }
        },
        { new: true }
    ).select("-password");
    if(!user){
        throw new ApiError(401, "User not found")
    }
    console.log(user)

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Account details updated Successfully")
    )
})


const updateUserAvatar = asyncHandler(async (req, res) => {
    // Get the buffer directly, don't wrap in an array
    const avatarBuffer = req.files?.avatar?.[0]?.buffer;

    if (!avatarBuffer) {
        throw new ApiError(400, "Invalid provided path of the avatar");
    }

    console.log("HI2 : ", avatarBuffer);

    // Upload the avatar to Cloudinary
    const avatar = await UploadOnCloudinary([avatarBuffer]); // Pass buffer as array

    console.log("HI : ", avatar);

    if (!avatar || !avatar[0]?.url) {
        throw new ApiError(400, "Error while uploading the avatar");
    }

    // Delete the old avatar of the user
    const getCurrentUser = await User.findById(req.user._id).select("-password");

    if (!getCurrentUser) {
        throw new ApiError(401, "Not getting current user!!!");
    }

    const avatarArrLastIndex = getCurrentUser.avatar.split("/").length - 1;
    const publicIdOfCloudinaryImage = getCurrentUser.avatar.split("/")[avatarArrLastIndex].split(".")[0];

    const deleteOldAvatar = await DeleteOnCloudinary(publicIdOfCloudinaryImage);

    if (!deleteOldAvatar) {
        throw new ApiError(500, "The old avatar is not deleted yet!!!");
    }

    // Update user's avatar
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar[0].url } },
        { new: true }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200, user, "User Avatar updated Successfully")
    );
});



const getUserChannelProfile = asyncHandler( async (req, res) => {
    const {username} = req.params;
    if(!username?.trim()){
        throw new ApiError(400, "Username is required")
    }
    // now firstly we have to find the user then apply the aggregation pipeline on it.
    // we can do it with 2 ways, first find the user then apply pipeline or directly use aggregation pipeline to the User schema then use $match to get the specific user.
    // currently we are proceeding with 2nd method
    const channel = await User.aggregate([
        {                   // this is first pipeline
            $match: {
                username: username?.toLowerCase()
            }
        },
        {                   // this is second pipeline
            $lookup: {
                from: "subscriptions",           // well the real name of the schema is Subscription but we have to pass subscriptions because when the data store in mongoDB then it will be converted to lowerCase and plural
                localField: "_id",                // the value of the _id and channel must be same otherwise, this method dont give the data.
                foreignField: "channel",           // ie. if _id from current collections is = 10 and channel from subscriptions collection also have to be = 10.
                as: "subscribers"                   // this is just a reference for array which is going to have the object of connecting collection.
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {   // addFeilds is used for adding the new feilds into the original object, ie. our aggregation object
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"                // $size is used for counting the total numbers of docs and we are using $ sign in subscribers because now we are taking subscribers as a feild
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"           // $size is used for counting the total number of channels
                },
                isSubscribed: {
                    $cond: {
                        $if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        $then: true,
                        $else: false
                    }
                }
            }
        },
        {   // project is used for only giving the selected values to the object, otherwise all the values will be passed to the aggregated object
            $project: {
                username: 1,        // here we are just flagging on the feild to be passed
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                email: 1
            }
        }
    ])
    console.log(channel)
    if(!channel?.length){
        throw new ApiError(404, "channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "user channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler( async(req, res) => {
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [{
                    $lookup:{
                        from: "user",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owerDetails",
                        pipeline:[{
                            $project:{
                                username: 1,
                                avatar: 1,
                            }
                        }]
                    }
                },
                {                   // this one pipeline is only for getting the first value of the array that is aggregation object basically only for eazing the work on frontend
                    $addFields:{
                        owner: {
                            $first: "$owner"
                        }
                    }
                }]
            }
        }
    ])
    if(!user){
        throw new ApiError(401, "the user not found!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Fetched the video data successfully")
    )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetials,
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory
};