import { mongoose, Schema } from "mongoose";

const productPrinterCCTVSchema = new Schema({
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
        type: String,
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
    // specs
    printTechnology: {
        type: String,
    },
    printSpeed: {
        type: String,
    },
    connectivity: {
        type: String,
    },
    paperSizes: {
        type: String,
    },
    duplexPrinting: {
        type: String,
    },
    weight: {
        type: String,
    },
    inkCapacity: {
        type: String,
    },
    resolution: {
        type: String,
    },
    lens: {
        type: String,
    },
    storage: {
        type: String,
    },
    nightVision: {
        type: String,
    },
    weatherproof: {
        type: String,
    },
    fieldOfView: {
        type: String,
    }
}, { timestamps: true });

export const ProductPrinterCCTV = mongoose.model('ProductPrinterCCTV', productPrinterCCTVSchema);