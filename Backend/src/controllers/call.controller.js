import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Call } from "../models/Call.model.js";
import { User } from "../models/User.model.js";

// Get call history for the logged-in user
const getCallHistory = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const calls = await Call.find({
      $or: [{ caller: userId }, { receiver: userId }],
    })
      .populate("caller", "username avatar email")
      .populate("receiver", "username avatar email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Call.countDocuments({
      $or: [{ caller: userId }, { receiver: userId }],
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          calls,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          totalCalls: count,
        },
        "Call history fetched successfully!"
      )
    );
  } catch (error) {
    console.error("Error fetching call history:", error);
    return res
      .status(500)
      .json(new ApiError(500, {}, "Failed to fetch call history"));
  }
});

// Get a specific call by ID
const getCallById = asyncHandler(async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await Call.findById(callId)
      .populate("caller", "username avatar email")
      .populate("receiver", "username avatar email");

    if (!call) {
      return res.status(404).json(new ApiError(404, {}, "Call not found"));
    }

    // Check if user is part of the call
    if (
      call.caller._id.toString() !== req.user._id.toString() &&
      call.receiver._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json(
          new ApiError(403, {}, "You are not authorized to view this call")
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, call, "Call fetched successfully!"));
  } catch (error) {
    console.error("Error fetching call:", error);
    return res.status(500).json(new ApiError(500, {}, "Failed to fetch call"));
  }
});

// Save call log after call ends
const saveCallLog = asyncHandler(async (req, res) => {
  try {
    const { receiverId, callType, status, duration, startTime, endTime } =
      req.body;

    // Validation
    if (!receiverId || !status) {
      return res
        .status(400)
        .json(
          new ApiError(400, {}, "Receiver ID and status are required")
        );
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res
        .status(404)
        .json(new ApiError(404, {}, "Receiver not found"));
    }

    // Create call log
    const callLog = await Call.create({
      caller: req.user._id,
      receiver: receiverId,
      callType: callType || "voice",
      status,
      duration: duration || 0,
      startTime: startTime || new Date(),
      endTime: endTime || (status === "completed" ? new Date() : null),
    });

    const populatedCall = await Call.findById(callLog._id)
      .populate("caller", "username avatar email")
      .populate("receiver", "username avatar email");

    return res
      .status(201)
      .json(
        new ApiResponse(201, populatedCall, "Call log saved successfully!")
      );
  } catch (error) {
    console.error("Error saving call log:", error);
    return res
      .status(500)
      .json(new ApiError(500, {}, "Failed to save call log"));
  }
});

// Delete call history
const deleteCallLog = asyncHandler(async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await Call.findById(callId);

    if (!call) {
      return res.status(404).json(new ApiError(404, {}, "Call not found"));
    }

    // Check if user is part of the call
    if (
      call.caller.toString() !== req.user._id.toString() &&
      call.receiver.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json(
          new ApiError(403, {}, "You are not authorized to delete this call")
        );
    }

    await Call.findByIdAndDelete(callId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Call log deleted successfully!"));
  } catch (error) {
    console.error("Error deleting call log:", error);
    return res
      .status(500)
      .json(new ApiError(500, {}, "Failed to delete call log"));
  }
});

// Get call statistics
const getCallStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Call.aggregate([
      {
        $match: {
          $or: [{ caller: userId }, { receiver: userId }],
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalDuration: { $sum: "$duration" },
        },
      },
    ]);

    const formattedStats = {
      total: 0,
      completed: 0,
      missed: 0,
      rejected: 0,
      cancelled: 0,
      totalDuration: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
      if (stat._id === "completed") {
        formattedStats.totalDuration = stat.totalDuration;
      }
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, formattedStats, "Call stats fetched successfully!")
      );
  } catch (error) {
    console.error("Error fetching call stats:", error);
    return res
      .status(500)
      .json(new ApiError(500, {}, "Failed to fetch call stats"));
  }
});

export {
  getCallHistory,
  getCallById,
  saveCallLog,
  deleteCallLog,
  getCallStats,
};