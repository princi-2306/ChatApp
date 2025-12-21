import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

export const muteChat = async (chatId: string, token: string) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.put(
      `${API_BASE_URL}/chats/mute-chat`,
      { chatId },
      config
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const unmuteChat = async (chatId: string, token: string) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.put(
      `${API_BASE_URL}/chats/unmute-chat`,
      { chatId },
      config
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getMutedChats = async (token: string) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(
      `${API_BASE_URL}/chats/muted-chats`,
      config
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const checkIfChatMuted = async (chatId: string, token: string) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(
      `${API_BASE_URL}/chats/is-muted/${chatId}`,
      config
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};