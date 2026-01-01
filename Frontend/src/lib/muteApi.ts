// TS DONE

import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_URL}`;

export const muteChat = async (chatId: string, token: string) => {
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
};

export const unmuteChat = async (chatId: string, token: string) => {
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
};

export const getMutedChats = async (token: string) => {
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
};

export const checkIfChatMuted = async (chatId: string, token: string) => {
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
};