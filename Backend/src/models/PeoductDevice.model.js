import { mongoose, Schema } from "mongoose"

const ProductDeviceSchema = new Schema({
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
    // specs
    switchType: {
        type: String,
    },
    layout: {
        type: String,
    },
    backlight: {
        type: String,
    },
    pollingRate: {
        type: String,
    },
    weight: {
        type: String,
    },
    buttons: {
        type: String,
    },
    connectivity: {
        type: String,
    },
    sensor: {
        type: String,
    },
    battery: {
        type: String,
    },
    driverSize: {
        type: String,
    },
    noiseCancellation: {
        type: String,
    },
    resolution: {
        type: String,
    },
    refreshRate: {
        type: String,
    },
    panelType: {
        type: String,
    },
    power: {
        type: String,
    },
    frequencyRange: {
        type: String,
    },
    dataTransfer: {
        type: String,
    }
}, { timestamps: true });

export const ProductDevice = mongoose.model('ProductDevice', ProductDeviceSchema);