const employee = [
  {
    id: 1,
    firstName: "Amit",
    email: "a@a.com",
    password: "123",
    task: [
      {
        active: true,
        newTask: true,
        completed: false,
        failed: false,
        taskTitle: "Write documentation",
        taskDescription: "Update the API docs",
        taskDate: "2024-10-13",
        category: "Documentation"
      },
      {
        active: false,
        newTask: false,
        completed: true,
        failed: false,
        taskTitle: "Review PRs",
        taskDescription: "Check team pull requests",
        taskDate: "2024-10-14",
        category: "Code Review"
      },
      {
        active: true,
        newTask: false,
        completed: false,
        failed: false,
        taskTitle: "Code cleanup",
        taskDescription: "Refactor unused code",
        taskDate: "2024-10-15",
        category: "Development"
      }
    ],
    taskNumber: {
      active: 2,
      newTask: 1,
      completed: 1,
      failed: 0
    }
  },
  {
    id: 2,
    firstName: "Bhavna",
    email: "b@b.com",
    password: "123",
    task: [
      {
        active: true,
        newTask: true,
        completed: false,
        failed: false,
        taskTitle: "Fix login bug",
        taskDescription: "Users can't login on Safari",
        taskDate: "2024-10-16",
        category: "Development"
      },
      {
        active: false,
        newTask: false,
        completed: true,
        failed: false,
        taskTitle: "Update UI",
        taskDescription: "Change theme to dark mode",
        taskDate: "2024-10-17",
        category: "Design"
      },
      {
        active: true,
        newTask: true,
        completed: false,
        failed: false,
        taskTitle: "Write unit tests",
        taskDescription: "Cover dashboard with Jest",
        taskDate: "2024-10-18",
        category: "Testing"
      }
    ],
    taskNumber: {
      active: 2,
      newTask: 2,
      completed: 1,
      failed: 0
    }
  },
  {
    id: 3,
    firstName: "Chirag",
    email: "c@c.com",
    password: "123",
    task: [
      {
        active: false,
        newTask: false,
        completed: true,
        failed: false,
        taskTitle: "Design homepage",
        taskDescription: "Create responsive homepage",
        taskDate: "2024-09-30",
        category: "Design"
      },
      {
        active: true,
        newTask: true,
        completed: false,
        failed: false,
        taskTitle: "Banner redesign",
        taskDescription: "Improve banner visuals",
        taskDate: "2024-10-02",
        category: "Design"
      },
      {
        active: true,
        newTask: false,
        completed: false,
        failed: true,
        taskTitle: "Prototype issue",
        taskDescription: "Fix Figma prototype links",
        taskDate: "2024-10-04",
        category: "UX"
      }
    ],
    taskNumber: {
      active: 2,
      newTask: 1,
      completed: 1,
      failed: 1
    }
  },
  {
    id: 4,
    firstName: "Deepak",
    email: "d@d.com",
    password: "123",
    task: [
      {
        active: true,
        newTask: false,
        completed: false,
        failed: true,
        taskTitle: "Database backup",
        taskDescription: "Perform daily backup",
        taskDate: "2024-10-10",
        category: "Maintenance"
      },
      {
        active: false,
        newTask: false,
        completed: true,
        failed: false,
        taskTitle: "Server update",
        taskDescription: "Update Node.js version",
        taskDate: "2024-10-11",
        category: "DevOps"
      },
      {
        active: true,
        newTask: true,
        completed: false,
        failed: false,
        taskTitle: "Log monitoring",
        taskDescription: "Set up monitoring tool",
        taskDate: "2024-10-12",
        category: "Monitoring"
      }
    ],
    taskNumber: {
      active: 2,
      newTask: 1,
      completed: 1,
      failed: 1
    }
  },
  {
    id: 5,
    firstName: "Esha",
    email: "e@e.com",
    password: "123",
    task: [
      {
        active: true,
        newTask: true,
        completed: false,
        failed: false,
        taskTitle: "Team meeting",
        taskDescription: "Weekly sync with devs",
        taskDate: "2024-10-15",
        category: "Management"
      },
      {
        active: false,
        newTask: false,
        completed: true,
        failed: false,
        taskTitle: "Prepare report",
        taskDescription: "Monthly status report",
        taskDate: "2024-10-16",
        category: "Reporting"
      },
      {
        active: true,
        newTask: false,
        completed: false,
        failed: false,
        taskTitle: "Assign tasks",
        taskDescription: "Distribute sprint tasks",
        taskDate: "2024-10-17",
        category: "Planning"
      }
    ],
    taskNumber: {
      active: 2,
      newTask: 1,
      completed: 1,
      failed: 0
    }
  }
];


const admin = [{
    id:1,
    firstName: "Alok",
    email: "admin@me.com",
    password:"123",
}]

export const setLocalStorage = ()=>{
    localStorage.setItem("employees",JSON.stringify(employee));
    localStorage.setItem("admin",JSON.stringify(admin));
}
setLocalStorage()

export const getLocalstorage = ()=>{
  const employees =  JSON.parse(localStorage.getItem("employees"));
  const admin =  JSON.parse(localStorage.getItem("admin"));
  return {employees,admin};
}