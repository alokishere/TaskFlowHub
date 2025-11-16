import React, { useContext } from 'react';
import { AuthContext } from '../../context/ContextProvider';

const TaskListNumber = ({ data }) => {
  const { stats } = useContext(AuthContext);

  const taskNumbers = {
    newTask: stats?.newTask || 0,
    active: stats?.active || 0,
    completed: stats?.completed || 0,
    failed: stats?.failed || 0
  };

  const statCards = [
    {
      key: 'newTask',
      label: 'New Task',
      value: taskNumbers.newTask,
      bgColor: 'bg-amber-300',
      textColor: 'text-amber-900'
    },
    {
      key: 'completed',
      label: 'Completed Task',
      value: taskNumbers.completed,
      bgColor: 'bg-green-300',
      textColor: 'text-green-900'
    },
    {
      key: 'active',
      label: 'Active',
      value: taskNumbers.active,
      bgColor: 'bg-red-300',
      textColor: 'text-red-900'
    },
    {
      key: 'failed',
      label: 'Failed Task',
      value: taskNumbers.failed,
      bgColor: 'bg-orange-300',
      textColor: 'text-orange-900'
    }
  ];

  return (
    <div className='flex justify-between gap-5 mt-10 flex-wrap'>
      {statCards.map((stat) => (
        <div
          key={stat.key}
          className={`flex-1 min-w-[200px] ${stat.bgColor} py-5 px-10 rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
        >
          <h1 className={`text-3xl font-semibold ${stat.textColor}`}>{stat.value}</h1>
          <h1 className={`text-2xl font-medium ${stat.textColor}`}>{stat.label}</h1>
        </div>
      ))}
    </div>
  );
};

export default TaskListNumber;