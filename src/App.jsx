import React, { useEffect, useState } from "react";
import Login from "./components/Auth/Login";
import EmployeeDashboard from "./components/DashBoard/EmployeeDashboard";
import AdminDashboard from "./components/DashBoard/AdminDashboard";

const App = () => {
  const [user, setuser] = useState(null);

  const handleaAuth=(email,password)=>{
    if(email=='admin@me.com' && password=="123"){
      setuser("admin");
    }else if(email=='user@me.com' && password =="123"){
      setuser("employee")
    }else{
      alert("Invalid credential!")
    }
  }


  return (
    <>
      {!user ? <Login handleaAuth={handleaAuth} /> : ""}

      {user==="admin" ? <AdminDashboard /> :"" }
      {user==="employee" ? <EmployeeDashboard /> :"" }
    
    </>
  );
};

export default App;
