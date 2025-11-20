import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getCallHistory,
  getCallById,
  saveCallLog,
  deleteCallLog,
  getCallStats,
} from "../controllers/call.controller.js";

const callRouter = Router();

// All routes require authentication
callRouter.use(verifyJWT);

// Get call history with pagination
callRouter.route("/history").get(getCallHistory);

// Get call statistics
callRouter.route("/stats").get(getCallStats);

// Get specific call by ID
callRouter.route("/:callId").get(getCallById);

// Save call log after call ends
callRouter.route("/log").post(saveCallLog);

// Delete call log
callRouter.route("/:callId").delete(deleteCallLog);

export default callRouter;