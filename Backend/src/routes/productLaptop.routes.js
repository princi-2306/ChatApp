import { Router } from "express";
import {
    addProductLaptop,
    listProductLaptop,
    removeProductLaptop,
    singleProductLaptop,
} from "../controllers/productLaptop.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdminJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route for adding a product (requires authentication and image upload)
router.route("/addProductLaptop").post( // Authenticate user
    verifyAdminJWT,
    upload.fields([
        { name: "productImages1", maxCount: 1 },
        { name: "productImages2", maxCount: 1 },
        { name: "productImages3", maxCount: 1 },
        { name: "productImages4", maxCount: 1 },
        { name: "productImages5", maxCount: 1 },
    ]),
    addProductLaptop
);

// Route for listing all products (should be GET)
router.route("/listProductLaptop").get(listProductLaptop);

// Route for removing a product (should be DELETE and require authentication)
router.route("/removeProductLaptop").delete(verifyAdminJWT, removeProductLaptop);

// Route for fetching a single product by ID
router.route("/singleProductLaptop").get(singleProductLaptop);

export default router;
