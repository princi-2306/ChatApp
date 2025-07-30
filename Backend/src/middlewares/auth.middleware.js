import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { Admin } from "../models/Admin.model.js";  // Assuming an Admin model exists

export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401, "Unauthorized Request because the token is not available");
        }
        // Access tokens, ID tokens, and self-signed JWTs are all bearer tokens.
        // decoding the access token by using the secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(404, error?.message || "Invalid Access Token")
    }
})


export const verifyAdminJWT = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401, "Unauthorized Request because the token is not available");
        }
        // Access tokens, ID tokens, and self-signed JWTs are all bearer tokens.
        // decoding the access token by using the secret key
        const decodedToken = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET);

        const admin = await Admin.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
        if(!admin){
            throw new ApiError(401, "Invalid Access Token")
        }

        req.admin = admin;
        next();
    } catch (error) {
        throw new ApiError(404, error?.message || "Invalid Access Token")
    }
})