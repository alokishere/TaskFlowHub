import React from "react";
import NewTask from "./NewTask";
import FailedTask from "./FailedTask";
import CompleteTask from "./CompleteTask";
import AcceptTask from "./AcceptTask";

const TaskList = ({ data }) => {
  return (
    <div
      id="tasklist"
      className="flex gap-8 flex-nowrap overflow-x-auto items-center h-[50%] mt-20 px-4"
    >
      {data.task.map((task,idx) =>{
        if(task.newTask){
          return <NewTask key={idx} data={task}/>
        }
         if(task.failed){
          return <FailedTask key={idx} data={task}/>
        }
        if(task.completed){
          return <CompleteTask key={idx} data={task}/>
        }
         if(task.active) {
          return <AcceptTask key={idx} data={task}/>
        }
      })}
    </div>
  );
};

export default TaskList;
