import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { Order } from "../models/order.model.js"
import { User } from "../models/User.model.js"
import ApiResponse from "../utils/ApiResponse.js"
import razorpay from "razorpay"

const currency = "inr"
const deliveryCharge = 0

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

const placeOrder = asyncHandler(async (req, res, next) => {
    try {
        const { userId, items, amount, address } = req.body;
        const orderDate = {
            userId, 
            items, 
            amount, 
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }
        const newOrder = new Order(orderDate);
        await newOrder.save();
    
        await User.findByIdAndUpdate(userId, { cartData:{} }, { new: true });
        
        res.status(201).json(
            new ApiResponse(201, { order: newOrder }, "Order placed successfully")
        );
    } catch (error) {
        console.error(error);
        new ApiError(500, "Internal Server Error")
    }
})

// work later
const placeOrderStrip = asyncHandler(async (req, res, next) => {
    
})

const placeOrderRazorpay = asyncHandler(async (req, res, next) => {
    try {
        const { userId, item, amount, address } = req.body;
        const orderData = {
            userId,
            items: item,
            amount,
            address,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now()
        }

        const newOrder = new Order(orderData);
        await newOrder.save();
        
        const options = {
            amount: (amount * 100) + deliveryCharge,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString(), 
        }

        await razorpayInstance.orders.create(options, (error, order) => {
            if(error) {
                console.log(error);
                res.status(500).json(new ApiResponse(500, {}, "Error creating Razorpay order"));
            }
            res.status(200).json(new ApiResponse(200, { order }, "Razorpay order created successfully"));
        });
    } catch (error) {
        console.error(error);
        new ApiError(500, "Internal Server Error")
    }
})

const verifyRazorpay = asyncHandler(async (req, res, next) => {
    
    try {
        const { userId, razorpay_order_Id,  } = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_Id);
        console.log("OrderInfo : ",orderInfo);
        if(orderInfo.status === "paid") {
            
            await Order.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            await User.findByIdAndUpdate(userId, { cartData:{} }, { new: true });
            res.status(200).json(new ApiResponse(200, {}, "Payment successful"));
        } else {
            res.status(400).json(new ApiResponse(400, {}, "Payment failed"));
        }
        
    } catch (error) {
        console.error(error);
        new ApiError(500, "Internal Server Error")
    }
})

const allOrder = asyncHandler(async (req, res, next) => {
    try {
        const allOrder = await Order.find({});
        if(!allOrder) {
            throw new ApiError(404, "No order found");
        }
        res.status(200).json(new ApiResponse(200, { allOrder }, "All Orders"));
    } catch (error) {
        console.error(error);
        new ApiError(500, "Internal Server Error")
    }
})

const userOrder = asyncHandler(async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            throw new ApiError(400, "User ID is required.");
        }
        const userOrder = await Order.find({ userId });
        
        res.status(200).json(new ApiResponse(200, { userOrder }, "User's order history"));
    } catch (error) {
        console.error(error);
        new ApiError(500, "Internal Server Error")
        
    }
})

const updateStatus = asyncHandler(async (req, res, next) => {
    try {
        const { orderId, status } = req.body;
        if (!orderId || !status) {
            throw new ApiError(400, "Order ID and Status are required.");
        }
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if(!order) {
            throw new ApiError(404, "Order not found");
        }
        res
        .status(200)
        .json(
            new ApiResponse(200, { order }, "Order status updated successfully")
        );
    } catch (error) {
        console.error(error);
        new ApiError(500, "Internal Server Error")
        
    }
})

export {
    placeOrder,
    placeOrderStrip,
    placeOrderRazorpay,
    allOrder,
    userOrder,
    updateStatus,
    verifyRazorpay
}