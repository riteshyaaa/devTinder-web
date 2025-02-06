import { configureStore } from "@reduxjs/toolkit";
import  userReducer  from "./userSlice.jsx";
import userFeed from "./feedSlice.jsx";

const appStore = configureStore({
    reducer:{
        user: userReducer,
        feed: userFeed,
    }
})

export default appStore;
