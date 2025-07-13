import React from "react";

const Header = () => {
  return (
    <div className="flex items-start justify-between bg-gradient-to-br from-gray-900 to-emerald-900 p-6 rounded-2xl shadow-lg  mb-8">
      <h1 className="text-2xl font-medium text-gray-200">
        Hello <br />{" "}
        <span className="text-4xl font-semibold text-emerald-400">Alok 👋</span>
      </h1>
      <button className="bg-red-600 rounded-md px-5 py-2 font-medium text-lg text-white shadow hover:bg-red-700 transition">
        Log Out
      </button>
    </div>
  );
};

export default Header;
