import React, { useState } from 'react'
import NewTask from '../TaskList/NewTask'
import AcceptTask from '../TaskList/AcceptTask'

const CreateTask = () => {

const [taskTitle, settaskTitle] = useState("")
const [taskDescription, settaskDescription] = useState("")
const [asignTo, setasignTo] = useState("")
const [category, setcategory] = useState("")
const [date, setdate] = useState("")
const [newTask, setNewTask] = useState({})

  const submitHandler = (e)=>{
   e.preventDefault()
   setNewTask({taskTitle,taskDescription,category,date,active:false,newTask:true,completed:false,failed:false})
   settaskTitle("");
   settaskDescription("");
   setasignTo("");
   setcategory(""); 
   setdate("");
   const data= JSON.parse(localStorage.getItem('employees'))
   data.forEach((e)=>{
    if(asignTo===e.firstName){
      e.task.push(newTask)
      console.log(e.task);

      localStorage.setItem('employees',JSON.stringify(data))
    }
    localStorage.setItem('employees',JSON.stringify(data))
   })
  }
  return (
   <div className="flex justify-center items-start mt-10">
        <form onSubmit={(e)=>submitHandler(e)}
         className="bg-gray-800 shadow-2xl border border-emerald-700 rounded-2xl p-10 flex gap-10 w-full max-w-4xl">
          {/* Left Side */}
          <div className="flex flex-col gap-6 flex-1">
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">Task Title</h3>
              <input
                value={taskTitle}
                onChange={(e)=>settaskTitle(e.target.value)}
                type="text"
                placeholder="Make a UI design"
                className="w-full py-3 px-4 bg-gray-900 text-white border border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition placeholder:text-gray-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">Date</h3>
              <input
                value={date}
                onChange={(e)=>setdate(e.target.value)}
                type="date"
                className="w-full py-3 px-4 bg-gray-900 text-white border border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">Assign to</h3>
              <input
                value={asignTo}
                onChange={(e)=>setasignTo(e.target.value)}
                type="text"
                placeholder="Employee name"
                className="w-full py-3 px-4 bg-gray-900 text-white border border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition placeholder:text-gray-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">Category</h3>
              <input
                value={category}
                onChange={(e)=>setcategory(e.target.value)}

                type="text"
                placeholder="Dev, Design etc"
                className="w-full py-3 px-4 bg-gray-900 text-white border border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition placeholder:text-gray-400"
              />
            </div>
          </div>
          {/* Right Side */}
          <div className="flex flex-col gap-6 flex-1 justify-between">
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">Description</h3>
              <textarea
                           value={taskDescription}
                onChange={(e)=>settaskDescription(e.target.value)}
                rows={8}
                placeholder="Describe the task in detail..."
                className="w-full py-3 px-4 bg-gray-900 text-white border border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition placeholder:text-gray-400 resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              className="py-3 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold shadow-lg hover:scale-105 transition self-end"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
  )
}

export default CreateTask