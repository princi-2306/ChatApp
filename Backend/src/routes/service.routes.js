import { Router } from "express";
import {
    addService,
    listService,
    removeService,
    singleService,
} from "../controllers/service.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdminJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route for adding a product (requires authentication and image upload)
router.route("/addService").post( // Authenticate user
    verifyAdminJWT,
    upload.fields([
        { name: "ServiceImages1", maxCount: 1 },
        { name: "ServiceImages2", maxCount: 1 },
        { name: "ServiceImages3", maxCount: 1 },
        { name: "ServiceImages4", maxCount: 1 },
        { name: "ServiceImages5", maxCount: 1 },
    ]),
    addService
);

// Route for listing all products (should be GET)
router.route("/listService").get(listService);

// Route for removing a product (should be DELETE and require authentication)
router.route("/removeService").delete(verifyAdminJWT, removeService);

// Route for fetching a single product by ID
router.route("/singleService").get(singleService);

export default router;
