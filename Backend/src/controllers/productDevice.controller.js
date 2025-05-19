import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ProductDevice } from "../models/PeoductDevice.model.js";
import {
    DeleteOnCloudinary,
    UploadOnCloudinary
} from "../utils/Cloudinary.js"



// Note req is the data which we are sending to the server

const addProductDevice = asyncHandler( async (req, res) => {
    const { name, price, description, category, brand, firstHand, secondHand, type, isAvailable, bestSeller, 
        switchType, layout, backlight, pollingRate, weight, buttons, connectivity, sensor, battery, driverSize, noiseCancellation, resolution, refreshRate, 
        panelType, power, frequencyRange, dataTransfer } = req.body;

    if ([name, price, description, category, brand, firstHand, secondHand, type, isAvailable, bestSeller].some(field => field === undefined || field === null || field === "")) {
        throw new ApiError(400, "All required fields must be filled");
    }

    // use this in future
    const scpecsArray = [switchType, layout, backlight, pollingRate, weight, buttons, connectivity, sensor, battery, driverSize, noiseCancellation, resolution, refreshRate, panelType, power, frequencyRange, dataTransfer];


    const existProductDevices = await ProductDevice.findOne({ name: name.toLowerCase() });
    if (existProductDevices) {
        throw new ApiError(409, "Product with the same name already exists");
    }


    // Uploading the image
    const productDeviceImages1LocalPath = req.files?.productDeviceImages1?.[0]?.buffer;
    const productDeviceImages2LocalPath = req.files?.productDeviceImages2?.[0]?.buffer;
    const productDeviceImages3LocalPath = req.files?.productDeviceImages3?.[0]?.buffer;
    const productDeviceImages4LocalPath = req.files?.productDeviceImages4?.[0]?.buffer;
    const productDeviceImages5LocalPath = req.files?.productDeviceImages5?.[0]?.buffer;
    
    const productDeviceArray = [productDeviceImages1LocalPath, productDeviceImages2LocalPath, productDeviceImages3LocalPath, productDeviceImages4LocalPath, productDeviceImages5LocalPath]
    const productDeviceArrayFiltered = productDeviceArray.filter((item) => item !== undefined || null)

    const productDeviceImage = await UploadOnCloudinary(productDeviceArrayFiltered);
    const imageUrlData = [];
    productDeviceImage.forEach(element => {
        if (!element?.url) {
            throw new ApiError(400, "Image upload failed");
        } else {
            imageUrlData.push(element?.url)
        }
    });

    // Creating the product with all specifications
    const productDevice = await ProductDevice.create({
        name: name.toLowerCase(),
        price,
        description,
        image: imageUrlData, // Store as an array
        category,
        brand: brand.toLowerCase(),
        firstHand,
        secondHand,
        type,
        isAvailable,
        bestSeller,
        switchType, layout, backlight, pollingRate, weight, buttons, connectivity, sensor, battery, 
        driverSize, noiseCancellation, resolution, refreshRate, panelType, power, frequencyRange, dataTransfer
    });
    if (!productDevice) {
        throw new ApiError(500, "Something went wrong while creating the products")
    }

    const createProductDevice = await ProductDevice.findById(productDevice._id);
    if (!createProductDevice) {
        throw new ApiError(500, "Something went wrong while creating the products")
    } else {
        console.log("The User is Created with the username :", productDevice.name);
    }
    
    return res
        .status(201)
        .json(
            new ApiResponse(200, createProductDevice, "Laptop product is created successfully")
        );

});



const listProductDevice = asyncHandler( async (req, res) => {
    try {
        const DeviceData = await ProductDevice.find({});
        res
        .status(200)
        .json(
            new ApiResponse(200, DeviceData, "Product is fetched successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" });
    }
});


const removeProductDevice = asyncHandler( async (req, res) => {
    try {
        // this line will delete the product from the database
        const productDeviceId = await ProductDevice.findByIdAndDelete(req.body._id)
        res
        .status(201)
        .json(
            new ApiResponse(200, productDeviceId, "Product is removed successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" });
    }
});


const singleProductDevice = asyncHandler(async (req, res) => {
    try {
        const productDeviceId = await ProductDevice.findById(req.body._id);
        res
        .status(201)
        .json(
            new ApiResponse(200, productDeviceId, "Product according to Id is Listed successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" })
    }
});


export {
    addProductDevice,
    listProductDevice,
    removeProductDevice,
    singleProductDevice,
};