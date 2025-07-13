import React from 'react'
import Header from '../other/Header'
import TaskListNumber from '../other/TaskListNumber'
import TaskList from '../TaskList/TaskList'

const EmployeeDashboard = () => {
  return (
    <>
    <div className='p-10 h-screen bg-gradient-to-br from-gray-900 to-emerald-900' >
    <Header/>
    <TaskListNumber/>
    <TaskList />
    </div>
    </>
  ) 
}

export default EmployeeDashboard