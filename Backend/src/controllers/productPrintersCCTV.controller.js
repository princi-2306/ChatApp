import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ProductPrinterCCTV } from "../models/ProductPrinterCCTV.model.js";
import {
    DeleteOnCloudinary,
    UploadOnCloudinary
} from "../utils/Cloudinary.js"



// Note req is the data which we are sending to the server

const addProductPrinterCCTV = asyncHandler( async (req, res) => {
    const { name, price, description, category, brand, firstHand, secondHand, type, isAvailable, bestSeller, 
        printTechnology, printSpeed, connectivity, paperSizes, duplexPrinting, weight, inkCapacity, resolution, lens, storage, nightVision, weatherproof, fieldOfView } = req.body;

    if ([name, price, description, category, brand, firstHand, secondHand, type, isAvailable, bestSeller].some(field => field === undefined || field === null || field === "")) {
        throw new ApiError(400, "All required fields must be filled");
    }

    // use this in future
    const scpecsArray = [printTechnology, printSpeed, connectivity, paperSizes, duplexPrinting, weight, inkCapacity, resolution, lens, storage, nightVision, weatherproof, fieldOfView];


    const existProductPrinterCCTV = await ProductPrinterCCTV.findOne({ name: name.toLowerCase() });
    if (existProductPrinterCCTV) {
        throw new ApiError(409, "Product with the same name already exists");
    }


    // Uploading the image
    const productPrinterCCTVImages1LocalPath = req.files?.productPrinterCCTVImages1?.[0]?.buffer;
    const productPrinterCCTVImages2LocalPath = req.files?.productPrinterCCTVImages2?.[0]?.buffer;
    const productPrinterCCTVImages3LocalPath = req.files?.productPrinterCCTVImages3?.[0]?.buffer;
    const productPrinterCCTVImages4LocalPath = req.files?.productPrinterCCTVImages4?.[0]?.buffer;
    const productPrinterCCTVImages5LocalPath = req.files?.productPrinterCCTVImages5?.[0]?.buffer;
    const productPrinterCCTVArray = [productPrinterCCTVImages1LocalPath, productPrinterCCTVImages2LocalPath, productPrinterCCTVImages3LocalPath, productPrinterCCTVImages4LocalPath, productPrinterCCTVImages5LocalPath]
    const productPrinterCCTVArrayFiltered = productPrinterCCTVArray.filter((item) => item !== undefined || null)

    const productPrinterCCTVImage = await UploadOnCloudinary(productPrinterCCTVArrayFiltered);
    const imageUrlData = [];
    productPrinterCCTVImage.forEach(element => {
        if (!element?.url) {
            throw new ApiError(400, "Image upload failed");
        } else {
            imageUrlData.push(element?.url)
        }
    });

    // Creating the product with all specifications
    const productPrinterCCTV = await ProductPrinterCCTV.create({
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
        printTechnology, printSpeed, connectivity, paperSizes, duplexPrinting, weight, 
        inkCapacity, resolution, lens, storage, nightVision, weatherproof, fieldOfView
    });
    if (!productPrinterCCTV) {
        throw new ApiError(500, "Something went wrong while creating the products")
    }

    const createProductPrinterCCTV = await ProductPrinterCCTV.findById(productPrinterCCTV._id);
    if (!createProductPrinterCCTV) {
        throw new ApiError(500, "Something went wrong while creating the products")
    } else {
        console.log("The User is Created with the username :", productPrinterCCTV.name);
    }
    
    return res
        .status(201)
        .json(
            new ApiResponse(200, createProductPrinterCCTV, "Laptop product is created successfully")
        );

});



const listProductPrinterCCTV = asyncHandler( async (req, res) => {
    try {
        const PrinterCCTVData = await ProductPrinterCCTV.find({});
        res
        .status(200)
        .json(
            new ApiResponse(200, PrinterCCTVData, "Product is fetched successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" });
    }
});


const removeProductPrinterCCTV = asyncHandler( async (req, res) => {
    try {
        // this line will delete the product from the database
        const productPrinterCCTVId = await ProductPrinterCCTV.findByIdAndDelete(req.body._id)
        res
        .status(201)
        .json(
            new ApiResponse(200, productPrinterCCTVId, "Product is removed successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" });
    }
});


const singleProductPrinterCCTV = asyncHandler(async (req, res) => {
    try {
        const productPrinterCCTVId = await ProductPrinterCCTV.findById(req.body._id);
        res
        .status(201)
        .json(
            new ApiResponse(200, productPrinterCCTVId, "Product according to Id is Listed successfully")
        )
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({ success: false, message: "Server Error" })
    }
});


export {
    addProductPrinterCCTV,
    listProductPrinterCCTV,
    removeProductPrinterCCTV,
    singleProductPrinterCCTV,
};