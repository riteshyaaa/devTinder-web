import { io } from "socket.io-client";
import {BASE_URL} from "./constants.jsx"


const createSocketConnection = () => {
  
  return io(BASE_URL);
};
export default createSocketConnection;