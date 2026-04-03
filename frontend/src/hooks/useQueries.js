import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../services/api';

// Employees Hooks
export const useEmployees = (search = '', department = '') => {
  return useQuery({
    queryKey: ['employees', { search, department }],
    queryFn: async () => {
      const { data } = await API.get(`/users?search=${search}&department=${department}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useEmployeeDetails = (id) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const { data } = await API.get(`/users/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Projects Hooks
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await API.get('/projects');
      return data.data;
    },
  });
};

export const useMyProjects = () => {
  return useQuery({
    queryKey: ['myProjects'],
    queryFn: async () => {
      const { data } = await API.get('/projects/my-projects');
      return data.data;
    },
  });
};

export const useMyTasks = () => {
  return useQuery({
    queryKey: ['myTasks'],
    queryFn: async () => {
      const { data } = await API.get('/projects/my-tasks');
      return data.data;
    },
  });
};

export const useProjectDetails = (id) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await API.get(`/projects/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Messages Hooks
export const useMessages = (empId) => {
  return useQuery({
    queryKey: ['messages', empId],
    queryFn: async () => {
      const { data } = await API.get(`/messages/${empId}`);
      return data.data;
    },
    enabled: !!empId,
    refetchInterval: 3000, // Poll every 3 seconds
    refetchIntervalInBackground: false,
  });
};

// Leaves Hooks
export const useLeaves = () => {
  return useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const { data } = await API.get('/leaves');
      return data.data;
    },
  });
};

export const useMyLeaves = () => {
  return useQuery({
    queryKey: ['myLeaves'],
    queryFn: async () => {
      const { data } = await API.get('/leaves/my');
      return data.data;
    },
  });
};

export const useAdminLeaves = (status = 'pending') => {
  return useQuery({
    queryKey: ['adminLeaves', status],
    queryFn: async () => {
      const { data } = await API.get(`/leaves/all?status=${status}`);
      return data.data;
    },
  });
};

// Salaries Hooks
export const useSalaries = () => {
  return useQuery({
    queryKey: ['salaries'],
    queryFn: async () => {
      const { data } = await API.get('/salaries');
      return data.data;
    },
  });
};

export const useSalaryHistory = (empId) => {
  return useQuery({
    queryKey: ['salaryHistory', empId],
    queryFn: async () => {
      const { data } = await API.get(`/salaries/${empId}`);
      return data.data;
    },
    enabled: !!empId,
  });
};

// Attendance Hooks
export const useAttendance = () => {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const { data } = await API.get('/attendance');
      return data.data;
    },
  });
};

export const useMyAttendance = () => {
  return useQuery({
    queryKey: ['myAttendance'],
    queryFn: async () => {
      const { data } = await API.get('/attendance/my');
      return data.data;
    },
  });
};

// Blogs Hooks
export const useBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const { data } = await API.get('/blogs/get');
      return data.data || [];
    },
  });
};

export const useBlogDetails = (id) => {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const { data } = await API.get(`/blogs/get/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Documents Hooks
export const useDocuments = () => {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data } = await API.get('/documents');
      return data.data;
    },
  });
};

export const useEmployeeDocuments = (id) => {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      const { data } = await API.get(`/documents/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useAllDocuments = () => {
  return useQuery({
    queryKey: ['allDocuments'],
    queryFn: async () => {
      const { data: usersRes } = await API.get('/users');
      const allDocs = [];
      await Promise.all(usersRes.data.map(async (user) => {
        const docRes = await API.get(`/documents/${user.id}`);
        docRes.data.data.forEach(doc => {
          allDocs.push({ ...doc, user });
        });
      }));
      return allDocs;
    },
  });
};

// Reports Hooks
export const useReportsStats = () => {
  return useQuery({
    queryKey: ['reportsStats'],
    queryFn: async () => {
      const [empRes, projRes, salaryRes, leaveRes] = await Promise.all([
        API.get('/users'),
        API.get('/projects'),
        API.get('/salaries/all'),
        API.get('/leaves/all')
      ]);

      const employees = empRes.data.data;
      const projects = projRes.data.data;
      const salaries = salaryRes.data.data;
      const leaves = leaveRes.data.data;

      // Group by Dept
      const deptMap = {};
      employees.forEach(e => deptMap[e.department] = (deptMap[e.department] || 0) + 1);

      // Group Projects
      const statusMap = { pending: 0, 'in-progress': 0, completed: 0 };
      projects.forEach(p => statusMap[p.status]++);

      // Payroll
      const payroll = salaries.reduce((acc, s) => acc + s.amount, 0);

      // Leaves
      const leaveMap = { pending: 0, approved: 0, rejected: 0 };
      leaves.forEach(l => leaveMap[l.status]++);

      return { employeesByDept: deptMap, projectsByStatus: statusMap, totalPayroll: payroll, leaveSummary: leaveMap };
    },
  });
};

// Dashboard Hooks
export const useAdminDashboardData = () => {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const [empRes, projRes, leaveRes, attendanceRes] = await Promise.all([
        API.get('/users'),
        API.get('/projects'),
        API.get('/leaves/all'),
        API.get('/attendance/all')
      ]);

      const employees = empRes.data?.data || [];
      const projects = projRes.data?.data || [];
      const leaves = leaveRes.data?.data || [];
      const attendanceEntries = attendanceRes.data?.data || [];

      return { employees, projects, leaves, attendanceEntries };
    },
  });
};
