import { Router } from "express";
import {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetials,
    getCurrentAdmin
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyAdminJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// whenever u set a middleware then just put the middleware first then put the actual function which u want to send user to, like i did below and always remember that the middleware must have next() at the end.
router.route("/register-admin").post(registerAdmin);

router.route("/login-admin").post(loginAdmin);
// whenever u set a middleware then just put the middleware first then put the actual function which u want to send user to like i did below.
// u can set as much middleware as u want like this => .post(verifyJWT,secondMiddleware,thirdMiddleware,andSoOnMiddleware,logoutUser)
router.route("/logout-admin").post(verifyAdminJWT,logoutAdmin);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-admin").get(verifyAdminJWT, getCurrentAdmin);
router.route("/change-password").patch(verifyAdminJWT, changeCurrentPassword);
router.route("/update-details").patch(verifyAdminJWT, updateAccountDetials);


export default router;