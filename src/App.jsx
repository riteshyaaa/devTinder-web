
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./NavBar";
import Login from "./Login";
import Body from "./Body";
import Profile from "./Profile";

function App() {
    return (
        <>
         <BrowserRouter basename="/">
         <Routes>
            <Route path = "/" element ={<Body/>}>
            <Route path = "/login" element = {<Login/>}/>
            <Route path =  "/profile" element = {<Profile/>}/>

            </Route>
         </Routes>

         </BrowserRouter>
{/*      
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-pink-500">
        <h1 className="text-6xl font-bold text-black animate-bounce">
          Hello World!
        </h1>
      </div> */}
      </>
    );
  }
  
  export default App;