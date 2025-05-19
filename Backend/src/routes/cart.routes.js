import { Router } from "express";
import {
    addToCart,
    getUserCart,
    updateCart
} from '../controllers/cart.controller.js';
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.route("/addToCart").post( // Authenticate user
//     verifyJWT,
//     upload.fields([
//         { name: "productDeviceImages1", maxCount: 1 },
//         { name: "productDeviceImages2", maxCount: 1 },
//         { name: "productDeviceImages3", maxCount: 1 },
//         { name: "productDeviceImages4", maxCount: 1 },
//         { name: "productDeviceImages5", maxCount: 1 },
//     ]),
//     addToCart
// );

// Route for adding the products to cart (should be POST and require authentication)
router.route("/addToCart").post(verifyJWT, addToCart);

// Route for fetching a product from the user (should be POST and require authentication)
router.route("/getUserCart").post(verifyJWT, getUserCart);

// Route for updating a cart
router.route("/updateCart").post(verifyJWT, updateCart);

export default router;