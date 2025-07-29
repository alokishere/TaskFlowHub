import React, { useContext } from 'react'
import { AuthContext } from '../../context/ContextProvider'

const AllTask = () => {
  const data = useContext(AuthContext)
  return (
    <div className=' flex relative flex-col gap-5 p-15 items-center justify-center mt-5 rounded-xl bg-gradient-to-br from-gray-900 to-emerald-900'>
         <div className='flex text-2xl font-semibold text-center  sticky items-center justify-between rounded-md w-full px-3 py-2 bg-red-400' >
            <h2 className='w-1/5'>Name</h2>
            <h5 className='w-1/5'>New Task</h5>
            <h3 className='w-1/5'>Active Task</h3>
            <h3 className='w-1/5'>Completed</h3>
            <h3 className='w-1/5'>Failed</h3>
        </div>
       {
        data.employees.map((e,i)=>{
            return <div key={i} className='flex text-xl font-bold text-center items-start justify-between rounded-md w-full px-3 py-2 bg-red-300' >
            <h2 className='w-1/5 text-white-600'>{e.firstName}</h2>
            <h5 className='w-1/5 text-blue-600'>{e.taskNumber.newTask}</h5>
            <h3 className='w-1/5 text-yellow-400'>{e.taskNumber.active}</h3>
            <h3 className='w-1/5 text-green-600'>{e.taskNumber.completed}</h3>
            <h3 className='w-1/5 text-red-500'>{e.taskNumber.failed}</h3>
        </div>
        })
       } 

    </div>
  )
}

export default AllTask