import React from 'react'

const FailedTask = ({data}) => {
  return (
     <div className="flex-shrink-0 h-full w-[340px] bg-gray-800 rounded-2xl p-6 shadow-lg border border-emerald-700">
        <div className="flex items-center justify-between">
          <h3 className="rounded-full bg-yellow-500 text-white px-4 py-1 text-sm font-semibold shadow">
           {data.category}
          </h3>
          <h4 className="text-gray-300 font-medium">{data.taskDate}</h4>
        </div>
        <div className="mt-5">
          <h1 className="text-2xl font-bold text-yellow-400">{data.taskTitle}</h1>
          <p className="mt-3 text-gray-300">
         {data.taskDescription}
          </p>
          <button className="py-1 px-2 bg-red-400 text-white rounded-md mt-3 w-full" >Failed</button>
        </div>
      </div>
  )
}

export default FailedTask