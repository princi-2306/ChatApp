import { mongoose, Schema } from "mongoose";

const productPartsSchema = new Schema({
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
    cores: {
        type: String,
    },
    chipset:{
        type: String,
    },
    threads: {
        type: String,
    },
    baseClock: {
        type: String,
    },
    maxMemory: {
        type: String,
    },
    boostClock: {
        type: String,
    },
    storage:{
        type: String,
    },
    socket: {
        type: String,
    },
    cache: {
        type: String,
    },
    tdp: {
        type: String,
    },
    vram: {
        type: String,
    },
    coreClock:{
        type: String,
    },
    powerConnectors: {
        type: String,
    },
    interfaces: {
        type: String,
    },
    speed:{
        type: String,
    },
    readSpeed: {
        type: String,
    },
    endurance: {
        type: String,
    },
    writeSpeed:{
        type: String,
    },
    memorySlots: {
        type: String,
    },
    capacity: {
        type: String,
    },
    wattage: {
        type: String,
    },
    modular: {
        type: String,
    },
    expansionSlots: {
        type: String,
    },
    noiseLevel: {
        type: String,
    },
    pumpSpeed:{
        type: String,
    },
    connectors:{
        type: String,
    }
}, { timestamps: true });

export const ProductPart = mongoose.model('ProductParts', productPartsSchema);