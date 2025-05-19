import { mongoose, Schema } from "mongoose";

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    productLaptop: {
        productLaptop: {
            type: Schema.Types.ObjectId,
            ref: "ProductLaptop",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
    },
    
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    totalQuantity: {
        type: Number,
        required: true,
        default: 0,
    },
}, { timestamps: true });

export const Cart = mongoose.model("Cart", cartSchema);