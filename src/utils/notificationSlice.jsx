import { createSlice } from "@reduxjs/toolkit";

/**
 * Notification slice — stores in-app notifications.
 *
 * Each notification: {
 *   id: string,
 *   type: "match" | "request" | "message" | "interest" | "system",
 *   title: string,
 *   message: string,
 *   fromUser: { firstName, lastName, photoUrl, _id } | null,
 *   read: boolean,
 *   createdAt: ISO string,
 * }
 */
const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    unreadMessages: 0, // separate counter for chat messages
  },
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        ...action.payload,
        id: action.payload.id || Date.now().toString() + Math.random().toString(36).slice(2),
        read: false,
        createdAt: action.payload.createdAt || new Date().toISOString(),
      };
      state.items.unshift(notification);
      state.unreadCount += 1;
      // Keep max 50 notifications
      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50);
      }
    },
    markAsRead: (state, action) => {
      const notification = state.items.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    setUnreadMessages: (state, action) => {
      state.unreadMessages = action.payload;
    },
    incrementUnreadMessages: (state) => {
      state.unreadMessages += 1;
    },
    resetUnreadMessages: (state) => {
      state.unreadMessages = 0;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  setUnreadMessages,
  incrementUnreadMessages,
  resetUnreadMessages,
} = notificationSlice.actions;

export default notificationSlice.reducer;
