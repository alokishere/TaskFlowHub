import React from 'react';

const FailedTask = ({ data }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex-shrink-0 h-full w-[340px] bg-gray-800 rounded-2xl p-6 shadow-lg border border-emerald-700 opacity-90">
      <div className="flex items-center justify-between">
        <h3 className="rounded-full bg-orange-500 text-white px-4 py-1 text-sm font-semibold shadow">
          {data.category}
        </h3>
        <h4 className="text-gray-300 font-medium">{formatDate(data.taskDate)}</h4>
      </div>
      <div className="mt-5">
        <h1 className="text-2xl font-bold text-orange-400 line-clamp-2">{data.taskTitle}</h1>
        <p className="mt-3 text-gray-300 line-clamp-3">
          {data.taskDescription}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-orange-400 font-semibold text-lg">Failed</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Task marked as failed
        </div>
      </div>
    </div>
  );
};

export default FailedTask;