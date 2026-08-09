import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [projectName, setProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // MOUSE CARD EFFECT
  // ==========================================

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

    card.style.transform = `
      perspective(800px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-6px)
    `;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "";
  };

  // ==========================================
  // AUTH HEADERS
  // ==========================================

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  // ==========================================
  // LOGIN / REGISTER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: email,
            password: password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Login failed");
        }

        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);

        setEmail("");
        setPassword("");
        setMessage("Login successful 🎉");
      } else {
        const response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Registration failed");
        }

        setMessage("Account created successfully 🎉");

        setIsLogin(true);
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH PROJECTS
  // ==========================================

  const fetchProjects = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }

        throw new Error(data.detail || "Failed to load projects");
      }

      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || "Failed to load projects");
    }
  };

  // ==========================================
  // FETCH TASKS
  // ==========================================

  const fetchTasks = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }

        throw new Error(data.detail || "Failed to load tasks");
      }

      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || "Failed to load tasks");
    }
  };

  // ==========================================
  // LOAD DATA AFTER LOGIN
  // ==========================================

  useEffect(() => {
    if (token) {
      fetchProjects();
      fetchTasks();
    }
  }, [token]);

  // ==========================================
  // CREATE PROJECT
  // ==========================================

  const createProject = async () => {
    const cleanName = projectName.trim();

    if (!cleanName) {
      setMessage("Enter a project name.");
      return;
    }

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: cleanName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error("Session expired. Please login again.");
        }

        if (response.status === 422) {
          console.error("Project validation error:", data);
          throw new Error(
            data.detail
              ? Array.isArray(data.detail)
                ? data.detail
                    .map((item) => item.msg || "Invalid project data")
                    .join(", ")
                : data.detail
              : "Invalid project data"
          );
        }

        throw new Error(data.detail || "Failed to create project");
      }

      console.log("Project created:", data);

      setProjectName("");
      setShowProjectModal(false);
      setMessage("Project created successfully 🚀");

      // Add returned project immediately
      if (data && data.id) {
        setProjects((previousProjects) => [
          ...previousProjects,
          data,
        ]);
      } else {
        // Fallback if backend doesn't return created object
        await fetchProjects();
      }
    } catch (error) {
      console.error("Create project error:", error);
      setMessage(error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREATE TASK
  // ==========================================

  const createTask = async () => {
    const cleanTitle = taskTitle.trim();

    if (!cleanTitle) {
      setMessage("Enter a task title.");
      return;
    }

    if (!selectedProjectId) {
      setMessage("Select a project first.");
      return;
    }

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          project_id: Number(selectedProjectId),
          title: cleanTitle,
          priority: priority,
          due_date: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error("Session expired. Please login again.");
        }

        if (response.status === 422) {
          console.error("Task validation error:", data);

          throw new Error(
            data.detail
              ? Array.isArray(data.detail)
                ? data.detail
                    .map((item) => item.msg || "Invalid task data")
                    .join(", ")
                : data.detail
              : "Invalid task data"
          );
        }

        throw new Error(data.detail || "Failed to create task");
      }

      setTaskTitle("");
      setPriority("medium");
      setSelectedProjectId("");
      setShowTaskModal(false);
      setMessage("Task created successfully ⚡");

      if (data && data.id) {
        setTasks((previousTasks) => [
          ...previousTasks,
          data,
        ]);
      } else {
        await fetchTasks();
      }
    } catch (error) {
      console.error("Create task error:", error);
      setMessage(error.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE TASK STATUS
  // ==========================================

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await fetch(
        `${API_URL}/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update task"
        );
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status,
              }
            : task
        )
      );

      setMessage(
        status === "completed"
          ? "Task completed 🎉"
          : "Task status updated"
      );
    } catch (error) {
      setMessage(error.message || "Failed to update task");
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setProjects([]);
    setTasks([]);

    setMessage("");
    setEmail("");
    setPassword("");
    setName("");
    setProjectName("");
    setTaskTitle("");
  };

  // ==========================================
  // STATS
  // ==========================================

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status !== "completed"
  ).length;

  const completion =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks / tasks.length) * 100
        );

  // ==========================================
  // LOGIN PAGE
  // ==========================================

  if (!token) {
    return (
      <div className="app auth-page">
        <div className="auth-card">
          <div className="logo">
            <span>Task</span>Flow
          </div>

          <p className="subtitle">
            {isLogin
              ? "Welcome back! Login to continue."
              : "Create your TaskFlow account."}
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group">
                <label>Name</label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Enter TaskFlow"
                : "Create Account"}
            </button>
          </form>

          {message && (
            <div className="message">
              {message}
            </div>
          )}

          <div className="switch">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setMessage("");
                  }}
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setMessage("");
                  }}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="dashboard">
      {/* NAVBAR */}

      <header className="navbar">
        <div className="logo">
          <span>Task</span>Flow
        </div>

        <div className="nav-right">
          <div className="online-dot"></div>

          <span className="user-label">
            Workspace
          </span>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}

      <main className="dashboard-content">
        {/* HERO */}

        <section className="hero">
          <div>
            <p className="eyebrow">
              YOUR WORKSPACE
            </p>

            <h1>
              Make things
              <span> happen.</span>
            </h1>

            <p className="welcome">
              Organize your projects, crush your
              tasks, and keep moving forward.
            </p>
          </div>

          <div className="hero-orb">
            <div className="orb-ring ring-one"></div>
            <div className="orb-ring ring-two"></div>
            <div className="orb-core"></div>
          </div>
        </section>

        {/* MESSAGE */}

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {/* STATS */}

        <section className="stats-grid">
          <div
            className="stat-card mouse-card"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <span>PROJECTS</span>
            <strong>{projects.length}</strong>
            <small>Your workspaces</small>
          </div>

          <div
            className="stat-card mouse-card"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <span>TOTAL TASKS</span>
            <strong>{tasks.length}</strong>
            <small>Things to finish</small>
          </div>

          <div
            className="stat-card mouse-card"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <span>COMPLETED</span>
            <strong>{completedTasks}</strong>
            <small>Already crushed</small>
          </div>

          <div
            className="stat-card progress-card mouse-card"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <span>PROGRESS</span>

            <strong>{completion}%</strong>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${completion}%`,
                }}
              />
            </div>

            <small>
              {pendingTasks} tasks remaining
            </small>
          </div>
        </section>

        {/* PROJECTS */}

        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="section-kicker">
                ORGANIZE
              </p>

              <h2>Your Projects</h2>
            </div>

            <button
              className="primary-action"
              onClick={() => {
                setMessage("");
                setProjectName("");
                setShowProjectModal(true);
              }}
            >
              + New Project
            </button>
          </div>

          <div className="project-list">
            {projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  ✦
                </div>

                <h3>No projects yet</h3>

                <p>
                  Create your first workspace
                  and start building.
                </p>
              </div>
            ) : (
              projects.map((project, index) => (
                <div
                  className="project-item mouse-card"
                  key={project.id}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="project-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <div className="project-icon">
                    ✦
                  </div>

                  <div className="project-info">
                    <strong>
                      {project.name}
                    </strong>

                    <span>
                      PROJECT #{project.id}
                    </span>
                  </div>

                  <div className="project-arrow">
                    →
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* TASKS */}

        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="section-kicker">
                EXECUTE
              </p>

              <h2>Recent Tasks</h2>
            </div>

            <button
              className="primary-action"
              onClick={() => {
                setMessage("");
                setTaskTitle("");
                setPriority("medium");
                setSelectedProjectId("");
                setShowTaskModal(true);
              }}
            >
              + New Task
            </button>
          </div>

          <div className="task-list">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  ◌
                </div>

                <h3>Nothing here yet</h3>

                <p>
                  Create a task and get moving.
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  className={`task-item mouse-card ${
                    task.status === "completed"
                      ? "task-completed"
                      : ""
                  }`}
                  key={task.id}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="task-check">
                    {task.status === "completed"
                      ? "✓"
                      : "○"}
                  </div>

                  <div className="task-info">
                    <strong>
                      {task.title}
                    </strong>

                    <span>
                      Project #{task.project_id}
                    </span>
                  </div>

                  <div
                    className={`priority priority-${task.priority}`}
                  >
                    {task.priority}
                  </div>

                  <select
                    className="status-select"
                    value={task.status}
                    onChange={(e) =>
                      updateTaskStatus(
                        task.id,
                        e.target.value
                      )
                    }
                  >
                    <option value="pending">
                      Pending
                    </option>

                    <option value="in_progress">
                      In Progress
                    </option>

                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* PROJECT MODAL */}

      {showProjectModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            !loading &&
            setShowProjectModal(false)
          }
        >
          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                !loading &&
                setShowProjectModal(false)
              }
            >
              ×
            </button>

            <p className="section-kicker">
              NEW WORKSPACE
            </p>

            <h2>Create Project</h2>

            <p className="modal-subtitle">
              Give your next idea a place to grow.
            </p>

            <input
              className="modal-input"
              placeholder="e.g. Portfolio Website"
              value={projectName}
              onChange={(e) =>
                setProjectName(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !loading
                ) {
                  createProject();
                }
              }}
              autoFocus
              disabled={loading}
            />

            <button
              className="modal-submit"
              onClick={createProject}
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Project →"}
            </button>
          </div>
        </div>
      )}

      {/* TASK MODAL */}

      {showTaskModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            !loading &&
            setShowTaskModal(false)
          }
        >
          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                !loading &&
                setShowTaskModal(false)
              }
            >
              ×
            </button>

            <p className="section-kicker">
              NEW TASK
            </p>

            <h2>Create Task</h2>

            <p className="modal-subtitle">
              Turn an idea into something actionable.
            </p>

            <input
              className="modal-input"
              placeholder="e.g. Finish landing page"
              value={taskTitle}
              onChange={(e) =>
                setTaskTitle(e.target.value)
              }
              autoFocus
              disabled={loading}
            />

            <select
              className="modal-input"
              value={selectedProjectId}
              onChange={(e) =>
                setSelectedProjectId(
                  e.target.value
                )
              }
              disabled={loading}
            >
              <option value="">
                Select Project
              </option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))}
            </select>

            <select
              className="modal-input"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
              disabled={loading}
            >
              <option value="low">
                Low Priority
              </option>

              <option value="medium">
                Medium Priority
              </option>

              <option value="high">
                High Priority
              </option>
            </select>

            <button
              className="modal-submit"
              onClick={createTask}
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Task →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;