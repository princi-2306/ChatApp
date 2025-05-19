import { Router } from "express";
import {
    addProductDevice,
    listProductDevice,
    removeProductDevice,
    singleProductDevice,
} from "../controllers/productDevice.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdminJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route for adding a product (requires authentication and image upload)
router.route("/addProductDevice").post( // Authenticate user
    verifyAdminJWT,
    upload.fields([
        { name: "productDeviceImages1", maxCount: 1 },
        { name: "productDeviceImages2", maxCount: 1 },
        { name: "productDeviceImages3", maxCount: 1 },
        { name: "productDeviceImages4", maxCount: 1 },
        { name: "productDeviceImages5", maxCount: 1 },
    ]),
    addProductDevice
);

// Route for listing all products (should be GET)
router.route("/listProductDevice").get(listProductDevice);

// Route for removing a product (should be DELETE and require authentication)
router.route("/removeProductDevice").delete(verifyAdminJWT, removeProductDevice);

// Route for fetching a single product by ID
router.route("/singleProductDevice").get(singleProductDevice);

export default router;
