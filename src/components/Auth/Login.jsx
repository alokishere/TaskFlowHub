import React, { useState } from "react";

const Login = ({handleaAuth}) => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const submitHandler = (e) => {
    e.preventDefault();
    handleaAuth(email,password)
    setemail("");
    setpassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-emerald-900">
      <div className="bg-gray-800 shadow-xl border border-emerald-700 px-10 py-12 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-emerald-400 mb-8 text-center">
          Login
        </h2>
        <form
          onSubmit={(e) => submitHandler(e)}
          className="flex flex-col gap-6"
        >
          <input
            onChange={(e) => {
              setemail(e.target.value);
            }}
            value={email}
            className="py-3 px-5 outline-none border border-emerald-700 bg-gray-900 text-white rounded-full focus:ring-2 focus:ring-emerald-500 transition placeholder:text-gray-400"
            type="email"
            placeholder="Enter your email"
          />
          <input
            onChange={(e) => {
              setpassword(e.target.value);
            }}
            value={password}
            className="py-3 px-5 outline-none border border-emerald-700 bg-gray-900 text-white rounded-full focus:ring-2 focus:ring-emerald-500 transition placeholder:text-gray-400"
            type="password"
            placeholder="Enter your password"
          />
          <button
            className="py-3 px-5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold shadow-md hover:scale-105 transition mt-2"
            type="submit"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
