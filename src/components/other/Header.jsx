import React, { useState } from "react";

const Header = ({ data, changeUser, name }) => {
  const [username, setusername] = useState("");
  const logOutUser = () => {
    // localStorage.clear()
    localStorage.removeItem("loggedInUser");
    // window.location.reload()
    changeUser(null);
    setusername("");
  };

  return (
    <div className="flex items-start justify-between bg-gradient-to-br from-gray-900 to-emerald-900 p-6 rounded-2xl shadow-lg  mb-8">
      <h1 className="text-2xl font-medium text-gray-200">
        Hello <br />{" "}
        <span className="text-4xl font-semibold text-emerald-400">
          {data?.firstName || "Admin"} 👋
        </span>
      </h1>
      <button
        onClick={logOutUser}
        className="bg-red-600 rounded-md px-5 py-2 font-medium text-lg text-white shadow hover:bg-red-700 transition"
      >
        Log Out
      </button>
    </div>
  );
};

export default Header;
