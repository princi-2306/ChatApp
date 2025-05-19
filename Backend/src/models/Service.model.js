import { mongoose, Schema } from 'mongoose';

const serviceSchema = new Schema({
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
    type: {
        type: String,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        required: true
    },
    // have to work on this specifications parts because we have specifications according to Services therefore destribute each specification
    diagnosis: {
        type: String,
    },
    repairTime: {
        type: String,
    },
    cameraTypes: {
        type: String,
    },
    storageOptions: {
        type: String,
    },
    coverage: {
        type: String,
    },
    connectivity: {
        type: String,
    },
    partsReplacement: {
        type: String,
    },
    serviceType: {
        type: String,
    },
    components: {
        type: String,
    },
    coolingSystem: {
        type: String,
    },
    RGBSetup: {
        type: String,
    },
    capacityOptions: {
        type: String,
    },
    installationTime: {
        type: String,
    },
    dataMigration: {
        type: String,
    },
    warranty: {
        type: String,
    },
    supportedDevices: {
        type: String,
    },
    recoveryRate: {
        type: String,
    },
    timeFrame: {
        type: String,
    },
    confidentiality: {
        type: String,
    }

}, { timestamps: true });

export const Service = mongoose.model('Service', serviceSchema);