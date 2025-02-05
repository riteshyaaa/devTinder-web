import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    addUser: (state, action) => {
     return action.payload; 
      
    },
    removeUser: (state, action) => {
      state.filter( user => user._id !== action.payload._id)
    },
  },
});


export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
