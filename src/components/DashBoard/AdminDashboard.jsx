import React from "react";
import Header from "../other/Header";
import CreateTask from "../other/CreateTask";
import AllTask from "./AllTask";

const AdminDashboard = ({data,changeUser}) => {
  console.log(data.firstName);
  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-gray-900 to-emerald-900">
      <Header changeUser={changeUser} name = {"Alok"} data={data} />
      <CreateTask data={data}/>
      <AllTask data={data}/>
    </div>
  );
};

export default AdminDashboard;
