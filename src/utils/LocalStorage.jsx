const employee = [
  {
    id: 1,
    email: "alice@example.com",
    password: "alice123",
    task: {
      active: true,
      newTask: true,
      completed: false,
      failed: false,
      taskTitle: "Write documentation",
      taskDescription: "Update the project documentation",
      taskDate: "2024-10-13",
      category: "Documentation"
    }
  },
  {
    id: 2,
    email: "bob@example.com",
    password: "bob123",
    task: {
      active: true,
      newTask: true,
      completed: false,
      failed: false,
      taskTitle: "Fix bugs",
      taskDescription: "Resolve issues reported by QA team",
      taskDate: "2024-10-14",
      category: "Development"
    }
  },
  {
    id: 3,
    email: "carol@example.com",
    password: "carol123",
    task: {
      active: false,
      newTask: false,
      completed: true,
      failed: false,
      taskTitle: "Design homepage",
      taskDescription: "Create mockups for homepage UI",
      taskDate: "2024-09-30",
      category: "Design"
    }
  },
  {
    id: 4,
    email: "dave@example.com",
    password: "dave123",
    task: {
      active: true,
      newTask: false,
      completed: false,
      failed: true,
      taskTitle: "Database backup",
      taskDescription: "Perform scheduled database backup",
      taskDate: "2024-10-10",
      category: "Maintenance"
    }
  },
  {
    id: 5,
    email: "emma@example.com",
    password: "emma123",
    task: {
      active: true,
      newTask: true,
      completed: false,
      failed: false,
      taskTitle: "Team meeting",
      taskDescription: "Weekly sync-up with the development team",
      taskDate: "2024-10-15",
      category: "Management"
    }
  }
];
const admin = [{
    id:1,
    email: "admin@me.com",
    password:"123",
}]

export const setLocalStorage = ()=>{
    localStorage.setItem("employees",JSON.stringify(employee));
    localStorage.setItem("admin",JSON.stringify(admin));
}
 
export const getLocalstorage = ()=>{
  const employees =  JSON.parse(localStorage.getItem("employees"));
  const admin =  JSON.parse(localStorage.getItem("admin"));
  console.log(employees,admin);
}