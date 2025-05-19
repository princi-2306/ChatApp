import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { User } from "../models/User.model.js"

const addToCart = asyncHandler(async (req, res) => {
    const { userId, ItemId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    // Initialize cartData if it doesn't exist
    const cartData = await user.cartData;
    
    // Update cart quantity
    if (cartData[ItemId]) {
        cartData[ItemId]++;
    } else {
        cartData[ItemId] = 1;
    }    

    // Update user with new cart data
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { cartData },
        { new: true } // This option returns the updated document
    );

    res.status(200).json(
        new ApiResponse(200, { 
            cartData: updatedUser.cartData 
        }, "Item added to cart successfully")
    );
});

const updateCart = asyncHandler( async (req, res) => {
    // try {
        const { userId, ItemId, quantity } = req.body;
        if (!userId || !ItemId) {
            throw new ApiError(400, "User ID and Item ID are required.");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        const cartData = await user.cartData || {};

        cartData[ItemId] = quantity;

        await User.findByIdAndUpdate(userId, { cartData }, { new: true });

        res.status(200).json(new ApiResponse(200, { cartData }, "Item quantity updated successfully"));
    // } catch (error) {
    //     console.error(error);
    //     throw new ApiError(500, "Internal Server Error");
    // }
})

const getUserCart = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            throw new ApiError(400, "User ID is required.");
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found.");
        }
        const cartData = await user.cartData || {};

        res.status(200).json(new ApiResponse(200, { cartData }, "User's cart data"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal Server Error");
    }
})

export {
    addToCart,
    updateCart,
    getUserCart
};