import { Router } from "express";
import {
    addProductPrinterCCTV,
    listProductPrinterCCTV,
    removeProductPrinterCCTV,
    singleProductPrinterCCTV,
} from "../controllers/productPrintersCCTV.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdminJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route for adding a product (requires authentication and image upload)
router.route("/addProductPrinterCCTV").post( // Authenticate user
    verifyAdminJWT,
    upload.fields([
        { name: "productPrinterCCTVImages1", maxCount: 1 },
        { name: "productPrinterCCTVImages2", maxCount: 1 },
        { name: "productPrinterCCTVImages3", maxCount: 1 },
        { name: "productPrinterCCTVImages4", maxCount: 1 },
        { name: "productPrinterCCTVImages5", maxCount: 1 },
    ]),
    addProductPrinterCCTV
);

// Route for listing all products (should be GET)
router.route("/listProductPrinterCCTV").get(listProductPrinterCCTV);

// Route for removing a product (should be DELETE and require authentication)
router.route("/removeProductPrinterCCTV").delete(verifyAdminJWT, removeProductPrinterCCTV);

// Route for fetching a single product by ID
router.route("/singleProductPrinterCCTV").get(singleProductPrinterCCTV);

export default router;
