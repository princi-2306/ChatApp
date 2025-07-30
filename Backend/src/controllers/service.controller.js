import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Service } from "../models/Service.model.js";
import {
    DeleteOnCloudinary,
    UploadOnCloudinary
} from "../utils/Cloudinary.js"


// Note req is the data which we are sending to the server

const addService = asyncHandler( async (req, res) => {
    const { name, price, description, category, brand, firstHand, secondHand, type, isAvailable, bestSeller, 
        diagnosis, repairTime, cameraTypes, storageOptions, coverage, connectivity, partsReplacement, serviceType, components, coolingSystem, 
        RGBSetup, capacityOptions, installationTime, dataMigration, warranty, supportedDevices, recoveryRate, timeFrame, confidentiality } = req.body;

    if ([name, price, description, category, brand, firstHand, secondHand, type, isAvailable, bestSeller].some(field => field === undefined || field === null || field === "")) {
        throw new ApiError(400, "All required fields must be filled");
    }

    // use this in future
    const scpecsArray = [diagnosis, repairTime, cameraTypes, storageOptions, coverage, connectivity, partsReplacement, serviceType, components, coolingSystem, 
        RGBSetup, capacityOptions, installationTime, dataMigration, warranty, supportedDevices, recoveryRate, timeFrame, confidentiality];


    const existService = await Service.findOne({ name: name.toLowerCase() });
    if (existService) {
        throw new ApiError(409, "Service with the same name already exists");
    }


    // Uploading the image
    const ServiceImages1LocalPath = req.files?.ServiceImages1?.[0]?.buffer;
    const ServiceImages2LocalPath = req.files?.ServiceImages2?.[0]?.buffer;
    const ServiceImages3LocalPath = req.files?.ServiceImages3?.[0]?.buffer;
    const ServiceImages4LocalPath = req.files?.ServiceImages4?.[0]?.buffer;
    const ServiceImages5LocalPath = req.files?.ServiceImages5?.[0]?.buffer;
    const ServiceArray = [ServiceImages1LocalPath, ServiceImages2LocalPath, ServiceImages3LocalPath, ServiceImages4LocalPath, ServiceImages5LocalPath]
    const ServiceArrayFiltered = ServiceArray.filter((item) => item !== undefined || null)

    const ServiceImage = await UploadOnCloudinary(ServiceArrayFiltered);
    const imageUrlData = [];
    ServiceImage.forEach(element => {
        if (!element?.url) {
            throw new ApiError(400, "Image upload failed");
        } else {
            imageUrlData.push(element?.url)
        }
    });

    // Creating the  with all specifications
    const service = await Service.create({
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
        diagnosis, repairTime, cameraTypes, 
        storageOptions, coverage, connectivity, 
        partsReplacement, serviceType, components, 
        coolingSystem, RGBSetup, capacityOptions, 
        installationTime, dataMigration, warranty, 
        supportedDevices, recoveryRate, timeFrame, confidentiality 
    });
    if (!service) {
        throw new ApiError(500, "Something went wrong while creating the Service")
    }

    const createService = await Service.findById(service._id);
    if (!createService) {
        throw new ApiError(500, "Something went wrong while creating the products")
    } else {
        console.log("The Service is Created with the service name :", service.name);
    }
    
    return res
        .status(201)
        .json(
            new ApiResponse(200, createService, "Service product is created successfully")
        );

});

 

const listService = asyncHandler( async (req, res) => {
    try {
        const ServiceData = await Service.find({});
        res
        .status(200)
        .json(
            new ApiResponse(200, ServiceData, "Service is fetched successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" });
    }
});


const removeService = asyncHandler( async (req, res) => {
    try {
        // this line will delete the Service from the database
        const serviceId = await Service.findByIdAndDelete(req.body._id)
        res
        .status(201)
        .json(
            new ApiResponse(200, serviceId, "Service is removed successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" });
    }
});


const singleService = asyncHandler(async (req, res) => {
    try {
        const serviceId = await Service.findById(req.body._id);
        res
        .status(201)
        .json(
            new ApiResponse(200, serviceId, "Service according to Id is Listed successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" })
    }
});


export {
    addService,
    listService,
    removeService,
    singleService,
};