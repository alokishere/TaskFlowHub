import React from "react";
import NewTask from "./NewTask";
import FailedTask from "./FailedTask";
import CompleteTask from "./CompleteTask";
import AcceptTask from "./AcceptTask";

const TaskList = ({ data, onStatusUpdate }) => {
  const tasks = data.tasks || [];

  const handleStatusChange = (taskId, newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(taskId, newStatus);
    }
  };

  return (
    <div
      id="tasklist"
      className="flex gap-8 flex-nowrap overflow-x-auto items-center h-[50%] mt-20 px-4"
    >
      {tasks
        .filter(task => task.status === 'newTask')
        .map((task, idx) => (
          <NewTask
            key={task._id}
            data={task}
            onStatusChange={handleStatusChange}
          />
        ))}

      {tasks
        .filter(task => task.status === 'active')
        .map((task, idx) => (
          <AcceptTask
            key={task._id}
            data={task}
            onStatusChange={handleStatusChange}
          />
        ))}

      {tasks
        .filter(task => task.status === 'completed')
        .map((task, idx) => (
          <CompleteTask
            key={task._id}
            data={task}
          />
        ))}

      {tasks
        .filter(task => task.status === 'failed')
        .map((task, idx) => (
          <FailedTask
            key={task._id}
            data={task}
          />
        ))}

      {tasks.length === 0 && (
        <div className="text-center text-gray-400 w-full py-20">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-lg">No tasks assigned to you yet</p>
          <p className="text-sm mt-2">Tasks assigned to you will appear here</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
