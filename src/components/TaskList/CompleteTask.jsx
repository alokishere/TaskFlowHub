import React from 'react';

const CompleteTask = ({ data }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex-shrink-0 h-full w-[340px] bg-gray-800 rounded-2xl p-6 shadow-lg border border-emerald-700 opacity-90">
      <div className="flex items-center justify-between">
        <h3 className="rounded-full bg-green-500 text-white px-4 py-1 text-sm font-semibold shadow">
          {data.category}
        </h3>
        <h4 className="text-gray-300 font-medium">{formatDate(data.taskDate)}</h4>
      </div>
      <div className="mt-5">
        <h1 className="text-2xl font-bold text-green-400 line-clamp-2">{data.taskTitle}</h1>
        <p className="mt-3 text-gray-300 line-clamp-3">
          {data.taskDescription}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-400 font-semibold text-lg">Completed</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Task completed successfully
        </div>
      </div>
    </div>
  );
};

export default CompleteTask;