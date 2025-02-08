import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice.jsx";
import userFeed from "./feedSlice.jsx";
import userConnections from "./connectionSlice.jsx";
const appStore = configureStore({
  reducer: {
    user: userReducer,
    feed: userFeed,
    connections: userConnections,
  },
});

export default appStore;
