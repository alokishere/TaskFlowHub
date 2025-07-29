import React from 'react'

const TaskListNumber = ({data}) => {
  return (
    <div className='flex justify-between gap-5 mt-10'>
    <div className='w-[45%] bg-amber-300 py-5 px-10 rounded-xl'>
        <h1 className='text-3xl font-semibold'>{data.taskNumber.newTask}</h1>
        <h1 className='text-2xl font-medium'>New Task</h1>
    </div>
    <div className='w-[45%] bg-green-300 py-5 px-10 rounded-xl'>
        <h1 className='text-3xl font-semibold'>{data.taskNumber.completed}</h1>
        <h1 className='text-2xl font-medium'>Completed Task</h1>
    </div>
    <div className='w-[45%] bg-red-300 py-5 px-10 rounded-xl'>
        <h1 className='text-3xl font-semibold'>{data.taskNumber.active}</h1>
        <h1 className='text-2xl font-medium'>Active</h1>
    </div>
    <div className='w-[45%] bg-orange-300 py-5 px-10 rounded-xl'>
        <h1 className='text-3xl font-semibold'>{data.taskNumber.failed}</h1>
        <h1 className='text-2xl font-medium'>Fail Task</h1>
    </div>
    </div>
  )
}

export default TaskListNumber