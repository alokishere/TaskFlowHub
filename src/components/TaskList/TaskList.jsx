import React from "react";

const TaskList = () => {
  return (
    <div
      id="tasklist"
      className="flex gap-8 flex-nowrap overflow-x-auto items-center h-[50%] mt-20 px-4"
    >
      {/* Task Card Example */}
      <div className="flex-shrink-0 h-full w-[340px] bg-gray-800 rounded-2xl p-6 shadow-lg border border-emerald-700">
        <div className="flex items-center justify-between">
          <h3 className="rounded-full bg-emerald-600 text-white px-4 py-1 text-sm font-semibold shadow">
            High
          </h3>
          <h4 className="text-gray-300 font-medium">13 July 2025</h4>
        </div>
        <div className="mt-5">
          <h1 className="text-2xl font-bold text-emerald-400">
            Make a youtube video
          </h1>
          <p className="mt-3 text-gray-300">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ad sunt
            atque facilis laborum excepturi quisquam quis iusto modi placeat
            voluptatibus.
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 h-full w-[340px] bg-gray-800 rounded-2xl p-6 shadow-lg border border-emerald-700">
        <div className="flex items-center justify-between">
          <h3 className="rounded-full bg-yellow-500 text-white px-4 py-1 text-sm font-semibold shadow">
            Medium
          </h3>
          <h4 className="text-gray-300 font-medium">13 July 2025</h4>
        </div>
        <div className="mt-5">
          <h1 className="text-2xl font-bold text-yellow-400">Design new logo</h1>
          <p className="mt-3 text-gray-300">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ad sunt
            atque facilis laborum excepturi quisquam quis iusto modi placeat
            voluptatibus.
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 h-full w-[340px] bg-gray-800 rounded-2xl p-6 shadow-lg border border-emerald-700">
        <div className="flex items-center justify-between">
          <h3 className="rounded-full bg-red-500 text-white px-4 py-1 text-sm font-semibold shadow">
            Urgent
          </h3>
          <h4 className="text-gray-300 font-medium">13 July 2025</h4>
        </div>
        <div className="mt-5">
          <h1 className="text-2xl font-bold text-red-400">Fix server bug</h1>
          <p className="mt-3 text-gray-300">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ad sunt
            atque facilis laborum excepturi quisquam quis iusto modi placeat
            voluptatibus.
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 h-full w-[340px] bg-gray-800 rounded-2xl p-6 shadow-lg border border-emerald-700">
        <div className="flex items-center justify-between">
          <h3 className="rounded-full bg-blue-500 text-white px-4 py-1 text-sm font-semibold shadow">
            Low
          </h3>
          <h4 className="text-gray-300 font-medium">13 July 2025</h4>
        </div>
        <div className="mt-5">
          <h1 className="text-2xl font-bold text-blue-400">Update docs</h1>
          <p className="mt-3 text-gray-300">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ad sunt
            atque facilis laborum excepturi quisquam quis iusto modi placeat
            voluptatibus.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
