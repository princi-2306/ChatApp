import { Router } from "express";
import {
    addProductPart,
    listProductPart,
    removeProductPart,
    singleProductPart,
} from "../controllers/productPart.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdminJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route for adding a product (requires authentication and image upload)
router.route("/addProductPart").post( // Authenticate user
    verifyAdminJWT,
    upload.fields([
        { name: "productPartImages1", maxCount: 1 },
        { name: "productPartImages2", maxCount: 1 },
        { name: "productPartImages3", maxCount: 1 },
        { name: "productPartImages4", maxCount: 1 },
        { name: "productPartImages5", maxCount: 1 },
    ]),
    addProductPart
);

// Route for listing all products (should be GET)
router.route("/listProductPart").get(listProductPart);

// Route for removing a product (should be DELETE and require authentication)
router.route("/removeProductPart").delete(verifyAdminJWT, removeProductPart);

// Route for fetching a single product by ID
router.route("/singleProductPart").get(singleProductPart);

export default router;
