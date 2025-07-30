import { mongoose, Schema } from "mongoose";

const productLaptopSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: Array,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    firstHand: {
        type: Boolean,
    },
    secondHand: {
        type: Boolean,
    },
    type: {
        type: Array,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    bestSeller: {
        type: Boolean,
        default: false,
    },
    ram: {
        type: String,
    },
    storage: {
        type: String,
    },
    processor: {
        type: String,
    },
    display: {
        type: String,
    },
    refreshRate: {
        type: String,
    },
    graphicsCard: {
        type: String,
    },
    battery: {
        type: String,
    },
    weight: {
        type: String,
    }
}, { timestamps: true });

export const ProductLaptop = mongoose.model.productLaptop || mongoose.model("ProductLaptop", productLaptopSchema);
