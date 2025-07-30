import React, { useContext, useEffect, useState } from "react";
import Login from "./components/Auth/Login";
import EmployeeDashboard from "./components/DashBoard/EmployeeDashboard";
import AdminDashboard from "./components/DashBoard/AdminDashboard";
import { AuthContext } from "./context/ContextProvider";

const App = () => {
  // localStorage.clear()
  const AuthData = useContext(AuthContext);

  const [user, setuser] = useState(null);
  const [loggedInUserdata, setLoggedInUserdata] = useState(null)

  useEffect(() => {
    const loggedInUser = (localStorage.getItem("loggedInUser") && JSON.parse(localStorage.getItem("loggedInUser")));
    if(loggedInUser){
      setLoggedInUserdata(loggedInUser.data)
      setuser(loggedInUser.role)
    }
  
  },[])
 
  const handleaAuth = (email, password) => {
    const admin = AuthData.admin.find((e) => email == e.email && password == e.password)
    if (admin) {
      setuser("admin");
      setLoggedInUserdata(admin)
      localStorage.setItem("loggedInUser", JSON.stringify({ role: "admin" ,data:admin}));
    } else if (AuthData) {
      const employee = AuthData.employees.find((e) => email == e.email && password == e.password) 
      if(employee){
      setuser('employee');
      setLoggedInUserdata(employee)
      localStorage.setItem("loggedInUser", JSON.stringify({ role: "employee" ,data:employee}));
    }
    } else {
      alert("Invalid credential!");
    }
  };

  return (
    <>
      {!user ? <Login handleaAuth={handleaAuth} /> : ""}

      {user === "admin" ? <AdminDashboard changeUser={setuser}  data={loggedInUserdata}/> : (user == 'employee'? <EmployeeDashboard changeUser={setuser} data={loggedInUserdata} />: null)}
    </>
  );
};

export default App;
