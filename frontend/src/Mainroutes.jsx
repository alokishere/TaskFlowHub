import { useLayoutEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Home from './pages/Home';




const Mainrouts = () => {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
  )
};

export default Mainrouts;
