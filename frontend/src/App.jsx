import { useEffect, useMemo, useState } from 'react';
import { authAPI, projectAPI, userAPI } from './services/api';
import { clearAuth, getToken, getStoredUser, setAuth } from './utils/auth';
import { isValidEmail, isValidPassword, required } from './utils/validation';

const getError = (error, fallback) => {
  if (typeof error?.error === 'string') return error.error;
  return fallback;
};

const LoginScreen = ({ onLogin, onBootstrap, loading }) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [bootstrapForm, setBootstrapForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const submitLogin = async (event) => {
    event.preventDefault();
    setError('');

    if (!isValidEmail(loginForm.email) || !required(loginForm.password)) {
      setError('Enter a valid email and password');
      return;
    }

    try {
      await onLogin(loginForm);
    } catch (err) {
      setError(getError(err, 'Login failed'));
    }
  };

  const submitBootstrap = async (event) => {
    event.preventDefault();
    setError('');

    if (!required(bootstrapForm.name) || !isValidEmail(bootstrapForm.email) || !isValidPassword(bootstrapForm.password)) {
      setError('Admin setup needs name, valid email and minimum 6 character password');
      return;
    }

    try {
      await onBootstrap(bootstrapForm);
    } catch (err) {
      setError(getError(err, 'Admin setup failed'));
    }
  };

  return (
    <div className="page page-center">
      <div className="card auth-card">
        <h1>Employee Management</h1>
        <p className="muted">Minimal version: login, employee registration by admin, and project creation.</p>

        {error ? <div className="alert">{error}</div> : null}

        <form onSubmit={submitLogin} className="form-block">
          <h2>Login</h2>
          <input
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <button type="submit" disabled={loading}>Login</button>
        </form>

        <form onSubmit={submitBootstrap} className="form-block split-top">
          <h2>One-time Admin Setup</h2>
          <p className="muted">Use this only if no admin account exists yet.</p>
          <input
            placeholder="Admin name"
            value={bootstrapForm.name}
            onChange={(e) => setBootstrapForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            placeholder="Admin email"
            value={bootstrapForm.email}
            onChange={(e) => setBootstrapForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Admin password"
            value={bootstrapForm.password}
            onChange={(e) => setBootstrapForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <button type="submit" disabled={loading}>Create Admin</button>
        </form>
      </div>
    </div>
  );
};

const Header = ({ user, onLogout }) => (
  <header className="header">
    <div>
      <h1>{user.role === 'admin' ? 'Admin Dashboard' : 'Employee Dashboard'}</h1>
      <p className="muted">Logged in as {user.name} ({user.email})</p>
    </div>
    <button onClick={onLogout}>Logout</button>
  </header>
);

const AdminDashboard = ({ user, onLogout }) => {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', password: '' });
  const [projectForm, setProjectForm] = useState({ title: '', description: '', assignedTo: '' });

  const hasEmployees = useMemo(() => employees.length > 0, [employees]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [employeeResponse, projectResponse] = await Promise.all([
        userAPI.listEmployees(),
        projectAPI.listProjects()
      ]);
      setEmployees(employeeResponse.data.employees || []);
      setProjects(projectResponse.data.projects || []);
    } catch (err) {
      setError(getError(err, 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createEmployee = async (event) => {
    event.preventDefault();
    setError('');

    if (!required(employeeForm.name) || !isValidEmail(employeeForm.email) || !isValidPassword(employeeForm.password)) {
      setError('Employee needs name, valid email and minimum 6 character password');
      return;
    }

    try {
      await userAPI.createEmployee(employeeForm);
      setEmployeeForm({ name: '', email: '', password: '' });
      await loadData();
    } catch (err) {
      setError(getError(err, 'Failed to create employee'));
    }
  };

  const createProject = async (event) => {
    event.preventDefault();
    setError('');

    if (!required(projectForm.title) || !projectForm.assignedTo) {
      setError('Project title and assigned employee are required');
      return;
    }

    try {
      await projectAPI.createProject(projectForm);
      setProjectForm({ title: '', description: '', assignedTo: '' });
      await loadData();
    } catch (err) {
      setError(getError(err, 'Failed to create project'));
    }
  };

  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />
      {error ? <div className="alert">{error}</div> : null}
      {loading ? <div className="card">Loading...</div> : null}

      <div className="grid">
        <section className="card">
          <h2>Register Employee</h2>
          <form onSubmit={createEmployee} className="form-block">
            <input
              placeholder="Employee name"
              value={employeeForm.name}
              onChange={(e) => setEmployeeForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              placeholder="Employee email"
              value={employeeForm.email}
              onChange={(e) => setEmployeeForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <input
              type="password"
              placeholder="Temporary password"
              value={employeeForm.password}
              onChange={(e) => setEmployeeForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            <button type="submit">Create Employee</button>
          </form>
        </section>

        <section className="card">
          <h2>Create Project</h2>
          <form onSubmit={createProject} className="form-block">
            <input
              placeholder="Project title"
              value={projectForm.title}
              onChange={(e) => setProjectForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              placeholder="Project description (optional)"
              rows={4}
              value={projectForm.description}
              onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <select
              value={projectForm.assignedTo}
              onChange={(e) => setProjectForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
            >
              <option value="">Assign employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} ({employee.email})
                </option>
              ))}
            </select>
            <button type="submit" disabled={!hasEmployees}>Create Project</button>
            {!hasEmployees ? <p className="muted">Create at least one employee first.</p> : null}
          </form>
        </section>
      </div>

      <section className="card">
        <h2>Employees</h2>
        {employees.length === 0 ? (
          <p className="muted">No employees yet.</p>
        ) : (
          <ul className="list">
            {employees.map((employee) => (
              <li key={employee._id}>
                <strong>{employee.name}</strong>
                <span>{employee.email}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Projects</h2>
        {projects.length === 0 ? (
          <p className="muted">No projects yet.</p>
        ) : (
          <ul className="list">
            {projects.map((project) => (
              <li key={project._id}>
                <strong>{project.title}</strong>
                <span>{project.description || 'No description'}</span>
                <span>
                  Assigned to: {project.assignedTo?.name || '-'} | Created by: {project.createdBy?.name || '-'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const EmployeeDashboard = ({ user, onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await projectAPI.listProjects();
        setProjects(response.data.projects || []);
      } catch (err) {
        setError(getError(err, 'Failed to load projects'));
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />
      {error ? <div className="alert">{error}</div> : null}
      <section className="card">
        <h2>My Projects</h2>
        {loading ? <p>Loading...</p> : null}
        {!loading && projects.length === 0 ? <p className="muted">No projects assigned yet.</p> : null}
        {!loading && projects.length > 0 ? (
          <ul className="list">
            {projects.map((project) => (
              <li key={project._id}>
                <strong>{project.title}</strong>
                <span>{project.description || 'No description'}</span>
                <span>Created by: {project.createdBy?.name || '-'}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      <section className="card">
        <h2>Current Rules</h2>
        <ul className="list">
          <li>
            <strong>Login only</strong>
            <span>No forgot password flow.</span>
          </li>
          <li>
            <strong>Password change disabled</strong>
            <span>Employees cannot change password in this version.</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.me();
        setUser(response.data.user);
      } catch {
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async (payload) => {
    const response = await authAPI.login(payload);
    setAuth(response.data.token, response.data.user);
    setUser(response.data.user);
  };

  const handleBootstrap = async (payload) => {
    const response = await authAPI.bootstrapAdmin(payload);
    setAuth(response.data.token, response.data.user);
    setUser(response.data.user);
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="page page-center">
        <div className="card">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} onBootstrap={handleBootstrap} loading={loading} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return <EmployeeDashboard user={user} onLogout={handleLogout} />;
}

export default App;
