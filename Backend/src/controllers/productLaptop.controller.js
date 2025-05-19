import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ProductLaptop } from "../models/ProductLaptop.model.js";
import {
    DeleteOnCloudinary,
    UploadOnCloudinary
} from "../utils/Cloudinary.js"


// Note req is the data which we are sending to the server

const addProductLaptop = asyncHandler(async (req, res) => {
    const { name, price, description, category, brand, firstHand, secondHand, type, isAvailable, bestSeller, ram, storage, processor, display, refreshRate, graphicsCard, battery, weight } = req.body;
    
    if ([name, price, description, category, brand, firstHand, secondHand, type, isAvailable, bestSeller].some(field => field === undefined || field === null || field === "")) {
        throw new ApiError(400, "All required fields must be filled");
    }

    const existProductLaptop = await ProductLaptop.findOne({ name: name.toLowerCase() });
    if (existProductLaptop) {
        throw new ApiError(409, "Product with the same name already exists");
    }
    
    // Uploading the image
    const productLaptopImages1LocalPath = req.files?.productImages1?.[0]?.buffer;
    const productLaptopImages2LocalPath = req.files?.productImages2?.[0]?.buffer;
    const productLaptopImages3LocalPath = req.files?.productImages3?.[0]?.buffer;
    const productLaptopImages4LocalPath = req.files?.productImages4?.[0]?.buffer;
    const productLaptopImages5LocalPath = req.files?.productImages5?.[0]?.buffer;

    const productLaptopArray = [productLaptopImages1LocalPath, productLaptopImages2LocalPath, productLaptopImages3LocalPath, productLaptopImages4LocalPath, productLaptopImages5LocalPath]
    const productLaptopArrayFiltered = productLaptopArray.filter((item) => item !== undefined || null)

    const productLaptopImage = await UploadOnCloudinary(productLaptopArrayFiltered);
    const imageUrlData = [];
    productLaptopImage.forEach(element => {
        if (!element?.url) {
            throw new ApiError(400, "Image upload failed");
        } else {
            imageUrlData.push(element?.url)
        }
    });

    // Creating the product with all specifications
    const productLaptop = await ProductLaptop.create({
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
        ram,
        storage, 
        processor,
        display,
        refreshRate,
        graphicsCard,
        battery,
        weight
    });
    if (!productLaptop) {
        throw new ApiError(500, "Something went wrong while creating the products")
    }

    const createProductLaptop = await ProductLaptop.findById(productLaptop._id);
    if (!createProductLaptop) {
        throw new ApiError(500, "Something went wrong while creating the products")
    } else {
        console.log("The Laptop is Created with the name :", productLaptop.name);
    }
    
    return res
        .status(201)
        .json(
            new ApiResponse(200, createProductLaptop, "Laptop product is created successfully")
        );

});



const listProductLaptop = asyncHandler(async (req, res) => {

    try {
        const laptopData = await ProductLaptop.find({});
        res
        .status(200)
        .json(
            new ApiResponse(200, laptopData, "Product is fetched successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" });
    }
});


const removeProductLaptop = asyncHandler(async (req, res) => {
    try {
        const productLaptopId = await ProductLaptop.findByIdAndDelete(req.body._id)
        res
        .status(201)
        .json(
            new ApiResponse(200, productLaptopId, "Product is removed successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" });
    }
});


const singleProductLaptop = asyncHandler(async (req, res) => {
    try {
        const productLaptopId = await ProductLaptop.findById(req.body._id);
        res
        .status(201)
        .json(
            new ApiResponse(200, productLaptopId, "Product according to Id is Listed successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" })
    }
});


export {
    addProductLaptop,
    listProductLaptop,
    removeProductLaptop,
    singleProductLaptop,
};