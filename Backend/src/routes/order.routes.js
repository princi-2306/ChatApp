import { Router } from 'express';
import {
    placeOrder,
    placeOrderStrip,
    placeOrderRazorpay,
    allOrder,
    userOrder,
    updateStatus,
    verifyRazorpay
} from '../controllers/order.controller.js';
import { verifyJWT, verifyAdminJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Route for placing an order
// Admin authentication required
router.route("/allOrder").get(verifyAdminJWT, allOrder);

router.route("/updateStatus").patch(verifyAdminJWT, updateStatus);


// Payment Feature 
router.route("/placeOrder").post(verifyJWT, placeOrder);

router.route("/placeOrderStrip").post(verifyJWT, placeOrderStrip);

router.route("/placeOrderRazorpay").post(verifyJWT, placeOrderRazorpay);
router.route("/verifyRazorpay").post(verifyJWT, verifyRazorpay);


// User Feature
router.route("/userOrder").post(verifyJWT, userOrder);


export default router;