import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice.jsx";
import userFeed from "./feedSlice.jsx";
import userConnections from "./connectionSlice.jsx";
import userRequest from "./requestSlice.jsx";
const appStore = configureStore({
  reducer: {
    user: userReducer,
    feed: userFeed,
    connections: userConnections,
    requests: userRequest,
  },
});

export default appStore;
