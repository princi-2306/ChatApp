import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ProductPart } from "../models/ProductPart.model.js";
import {
    DeleteOnCloudinary,
    UploadOnCloudinary
} from "../utils/Cloudinary.js"


// Note req is the data which we are sending to the server

const addProductPart = asyncHandler( async (req, res) => {
    const { name, price, description, category, brand, firstHand, secondHand, type, isAvailable, bestSeller, 
        cores, chipset, threads, baseClock, maxMemory, boostClock, socket, cache, tdp, vram, coreClock, powerConnectors, interfaces, 
        speed, readSpeed, endurance, writeSpeed, memorySlots, capacity, wattage, modular, expansionSlots, noiseLevel, pumpSpeed, connectors } = req.body;

    if ([name, price, description, category, brand, firstHand, secondHand, type, isAvailable, bestSeller].some(field => field === undefined || field === null || field === "")) {
        throw new ApiError(400, "All required fields must be filled");
    }

    // use this in future
    const scpecsArray = [cores, chipset, threads, baseClock, maxMemory, boostClock, socket, cache, tdp, vram, coreClock, powerConnectors, interfaces, 
        speed, readSpeed, endurance, writeSpeed, memorySlots, capacity, wattage, modular, expansionSlots, noiseLevel, pumpSpeed, connectors];


    const existProductParts = await ProductPart.findOne({ name: name.toLowerCase() });
    if (existProductParts) {
        throw new ApiError(409, "Product with the same name already exists");
    }


    // Uploading the image
    const productPartImages1LocalPath = req.files?.productPartImages1?.[0]?.buffer;
    const productPartImages2LocalPath = req.files?.productPartImages2?.[0]?.buffer;
    const productPartImages3LocalPath = req.files?.productPartImages3?.[0]?.buffer;
    const productPartImages4LocalPath = req.files?.productPartImages4?.[0]?.buffer;
    const productPartImages5LocalPath = req.files?.productPartImages5?.[0]?.buffer;
    const productPartArray = [productPartImages1LocalPath, productPartImages2LocalPath, productPartImages3LocalPath, productPartImages4LocalPath, productPartImages5LocalPath]
    const productPartArrayFiltered = productPartArray.filter((item) => item !== undefined || null)

    const productPartImage = await UploadOnCloudinary(productPartArrayFiltered);
    const imageUrlData = [];
    productPartImage.forEach(element => {
        if (!element?.url) {
            throw new ApiError(400, "Image upload failed");
        } else {
            imageUrlData.push(element?.url)
        }
    });

    // Creating the product with all specifications
    const productPart = await ProductPart.create({
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
        cores, chipset, threads, baseClock, maxMemory, boostClock,
        socket, cache, tdp, vram, coreClock, powerConnectors, interfaces, 
        speed, readSpeed, endurance, writeSpeed, memorySlots, capacity,
        wattage, modular, expansionSlots, noiseLevel, pumpSpeed, connectors
    });
    if (!productPart) {
        throw new ApiError(500, "Something went wrong while creating the products")
    }

    const createProductPart = await ProductPart.findById(productPart._id);
    if (!createProductPart) {
        throw new ApiError(500, "Something went wrong while creating the products")
    } else {
        console.log("The User is Created with the username :", productPart.name);
    }
    
    return res
        .status(201)
        .json(
            new ApiResponse(200, createProductPart, "Laptop product is created successfully")
        );

});



const listProductPart = asyncHandler( async (req, res) => {
    try {
        const PartData = await ProductPart.find({});
        res
        .status(200)
        .json(
            new ApiResponse(200, PartData, "Product is fetched successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" });
    }
});


const removeProductPart = asyncHandler( async (req, res) => {
    try {
        // this line will delete the product from the database
        const productPartId = await ProductPart.findByIdAndDelete(req.body._id)
        res
        .status(201)
        .json(
            new ApiResponse(200, productPartId, "Product is removed successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" });
    }
});


const singleProductPart = asyncHandler(async (req, res) => {
    try {
        const productPartId = await ProductPart.findById(req.body._id);
        res
        .status(201)
        .json(
            new ApiResponse(200, productPartId, "Product according to Id is Listed successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" })
    }
});


export {
    addProductPart,
    listProductPart,
    removeProductPart,
    singleProductPart,
};