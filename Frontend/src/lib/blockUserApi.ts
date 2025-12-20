// Create this file at: src/lib/api/blockUserApi.ts
import axios from "axios";
import { User } from "@/components/store/userStore";

const API_URL = "http://localhost:8000/api/v1";

export interface BlockUserResponse {
  success: boolean;
  data: {
    blockedUser?: User;
    unblockedUser?: User;
    blockedUsers?: User[];
    blockedUsersCount: number;
    isBlocked?: boolean;
  };
  message: string;
}

// Block a user
export const blockUser = async (
  userIdToBlock: string,
  token: string
): Promise<BlockUserResponse> => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    `${API_URL}/chats/block-user`,
    { userIdToBlock },
    config
  );

  return response.data;
};

// Unblock a user
export const unblockUser = async (
  userIdToUnblock: string,
  token: string
): Promise<BlockUserResponse> => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    `${API_URL}/chats/unblock-user`,
    { userIdToUnblock },
    config
  );

  return response.data;
};

// Get all blocked users
export const getBlockedUsers = async (
  token: string
): Promise<BlockUserResponse> => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(
    `${API_URL}/chats/blocked-users`,
    config
  );

  return response.data;
};

// Check if a user is blocked
export const checkIfUserBlocked = async (
  userId: string,
  token: string
): Promise<BlockUserResponse> => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(
    `${API_URL}/chats/is-blocked/${userId}`,
    config
  );

  return response.data;
};