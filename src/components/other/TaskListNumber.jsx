import React from 'react'

const TaskListNumber = () => {
  return (
    <div className='flex justify-between gap-5 mt-10'>
    <div className='w-[45%] bg-amber-300 py-5 px-10 rounded-xl'>
        <h1 className='text-3xl font-semibold'>O</h1>
        <h1 className='text-2xl font-medium'>New Task</h1>
    </div>
    <div className='w-[45%] bg-green-300 py-5 px-10 rounded-xl'>
        <h1 className='text-3xl font-semibold'>O</h1>
        <h1 className='text-2xl font-medium'>New Task</h1>
    </div>
    <div className='w-[45%] bg-red-300 py-5 px-10 rounded-xl'>
        <h1 className='text-3xl font-semibold'>O</h1>
        <h1 className='text-2xl font-medium'>New Task</h1>
    </div>
    <div className='w-[45%] bg-orange-300 py-5 px-10 rounded-xl'>
        <h1 className='text-3xl font-semibold'>O</h1>
        <h1 className='text-2xl font-medium'>New Task</h1>
    </div>
    </div>
  )
}

export default TaskListNumber