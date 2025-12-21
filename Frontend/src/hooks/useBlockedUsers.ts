// Create this file at: src/hooks/useBlockedUsers.ts
import { useEffect } from "react";
import userPost from "@/components/store/userStore";
import { getBlockedUsers } from "@/lib/blockUserApi";

/**
 * Custom hook to fetch and sync blocked users on app initialization
 * Call this hook in your main app component or layout
 */
export const useBlockedUsers = () => {
  const currentUser = userPost((state) => state.currentUser);
  const setBlockedUsers = userPost((state) => state.setBlockedUsers);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      if (!currentUser?.token) return;

      try {
        const response = await getBlockedUsers(currentUser.token);
        setBlockedUsers(response.data.blockedUsers || []);
      } catch (error: any) {
        console.error("Error fetching blocked users:", error);
        // Silently fail - don't show error toast on app load
      }
    };

    fetchBlockedUsers();
  }, [currentUser?.token, setBlockedUsers]);
};

export default useBlockedUsers;