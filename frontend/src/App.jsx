
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import ScrollAnimations from "./ScrollAnimations";
import "./App.css";


const API_URL = "http://127.0.0.1:8000";

function SearchBar({ value, onChange, onSearch }) {
  return (
    <div className="taskflow-search">

      <Search
        size={19}
        strokeWidth={2}
        className="taskflow-search-icon"
      />

      <input
  type="text"
  value={value}
  onChange={(e) => onChange(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  }}
  placeholder="Search for tasks, projects..."
/>
      <div className="search-shortcut">
        <span>Ctrl</span>
        <span>+</span>
        <span>K</span>
      </div>

    </div>
  );
}
function App() {

  
  // ==========================================
  // AUTH
  // ==========================================

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ==========================================
  // DATA
  // ==========================================

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);


  const [benchmarkTitle, setBenchmarkTitle] = useState("");
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [benchmarkMessage, setBenchmarkMessage] = useState("");

  // ==========================================
  // PROJECT / TASK FORM
  // ==========================================

  const [projectName, setProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [selectedProjectId, setSelectedProjectId] =
    useState("");
  const [quickTask, setQuickTask] = useState("");
  // ==========================================
  // MODALS
  // ==========================================

  const [showProjectModal, setShowProjectModal] =
    useState(false);

  const [showTaskModal, setShowTaskModal] =
    useState(false);


const [showEditTaskModal, setShowEditTaskModal] =
  useState(false);

const [editingTask, setEditingTask] =
  useState(null);

const [editTaskTitle, setEditTaskTitle] =
  useState("");

const [editTaskPriority, setEditTaskPriority] =
  useState("medium");

const [editTaskDueDate, setEditTaskDueDate] =
  useState("");


  // EDIT PROJECT
  const [showEditProjectModal, setShowEditProjectModal] =
    useState(false);

  const [editingProject, setEditingProject] =
    useState(null);

  const [editProjectName, setEditProjectName] =
    useState("");

  // PROFILE
  const [showProfileModal, setShowProfileModal] =
    useState(false);

  const [showProfilePhoto, setShowProfilePhoto] = useState(false);
  // SECURITY
  const [showSecurityModal, setShowSecurityModal] =
    useState(false);

  // ==========================================
  // NAVIGATION
  // ==========================================

  const [activePage, setActivePage] =
    useState("dashboard");

  const [selectedProject, setSelectedProject] = useState(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  // ==========================================
  // SETTINGS
  // ==========================================

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(
      localStorage.getItem("notificationsEnabled") !==
        "false"
    );

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("taskflowTheme") !== "light"
  );

  const [settingsName, setSettingsName] = useState(
    localStorage.getItem("taskflowName") || ""
  );

  const [settingsEmail, setSettingsEmail] = useState(
    localStorage.getItem("taskflowEmail") || ""
  );

  const [profilePhoto, setProfilePhoto] = useState(
  localStorage.getItem("taskflowProfilePhoto") || ""
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");


    // ==========================================
// REAL NOTIFICATION FUNCTION
// ==========================================

const sendNotification = (title, body) => {
  if (!notificationsEnabled) {
    return;
  }

  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  new Notification(title, {
    body: body,
    icon: "/favicon.ico",
  });
};

 // ==========================================
// GENERAL
// ==========================================

const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});
const [showSearch, setShowSearch] = useState(false);
const [searchQuery, setSearchQuery] = useState("");

const [backendSearchTask, setBackendSearchTask] = useState(null);
const [searchAlgorithm, setSearchAlgorithm] = useState("binary");


const [algorithmSearchResult, setAlgorithmSearchResult] =
  useState(null);

const [algorithmSearchLoading, setAlgorithmSearchLoading] =
  useState(false);




const runAlgorithmSearch = async () => {
  const query = searchQuery.trim();

  if (!query) {
    setAlgorithmSearchResult(null);
    return;
  }

  try {
    setAlgorithmSearchLoading(true);

    const response = await fetch(
      `${API_URL}/tasks/search?title=${encodeURIComponent(
        query
      )}&algo=${searchAlgorithm}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        setAlgorithmSearchResult(null);
        return;
      }

      throw new Error("Algorithm search failed");
    }

    const task = await response.json();

    setAlgorithmSearchResult(task);
  } catch (error) {
    console.error("Algorithm search error:", error);

    setAlgorithmSearchResult(null);
  } finally {
    setAlgorithmSearchLoading(false);
  }
};


const runAlgorithmBenchmark = async () => {
  if (!benchmarkTitle.trim()) {
    setBenchmarkMessage("Enter a task title first.");
    return;
  }

  try {
    setBenchmarkLoading(true);
    setBenchmarkMessage("");

    const response = await fetch(
      `${API_URL}/tasks/benchmark?title=${encodeURIComponent(
        benchmarkTitle
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Benchmark failed");
    }

    const data = await response.json();

    setBenchmarkResults(data);
  } catch (error) {
    console.error(error);

    setBenchmarkMessage(
      "Unable to run algorithm benchmark."
    );
  } finally {
    setBenchmarkLoading(false);
  }
};

// ==========================================
// TASK FILTER & SORT
// ==========================================

const [taskStatusFilter, setTaskStatusFilter] =
  useState("all");

const [taskPriorityFilter, setTaskPriorityFilter] =
  useState("all");

const [taskSort, setTaskSort] =
  useState("newest");
// MOUSE CARD EFFECT
// ==========================================

const handleMouseMove = (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const rotateX =
    (y / rect.height - 0.5) * -8;

  const rotateY =
    (x / rect.width - 0.5) * 8;

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
  // LOGIN / REGISTER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const response = await fetch(
          `${API_URL}/login`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              username: email,
              password: password,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Login failed"
          );
        }

        localStorage.setItem(
          "token",
          data.access_token
        );

        localStorage.setItem(
          "taskflowEmail",
          email.trim()
        );

        setToken(data.access_token);

        setSettingsEmail(email.trim());

        setEmail("");
        setPassword("");

        setMessage(
          "Login successful 🎉"
        );
      } else {
        const response = await fetch(
          `${API_URL}/users`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: name.trim(),
              email: email.trim(),
              password,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Registration failed"
          );
        }

        localStorage.setItem(
          "taskflowName",
          name.trim()
        );

        localStorage.setItem(
          "taskflowEmail",
          email.trim()
        );



        setMessage(
          "Account created successfully 🎉"
        );

        setIsLogin(true);
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      setMessage(
        error.message ||
          "Something went wrong"
      );
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
      const response = await fetch(
        `${API_URL}/projects`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }

        throw new Error(
          data.detail ||
            "Failed to load projects"
        );
      }

      setProjects(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      setMessage(
        error.message ||
          "Failed to load projects"
      );
    }
  };

  // ==========================================
  // FETCH TASKS
  // ==========================================

  const fetchTasks = async () => {
  if (!token) return;

  // Show cached tasks immediately
  const cachedTasks = localStorage.getItem(
    "taskflowTasks"
  );

  if (cachedTasks) {
    try {
      const parsedTasks = JSON.parse(
        cachedTasks
      );

      if (Array.isArray(parsedTasks)) {
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error(
        "Failed to read cached tasks:",
        error
      );
    }
  }

  try {
    const response = await fetch(
      `${API_URL}/tasks`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        return;
      }

      throw new Error(
        data.detail ||
          "Failed to load tasks"
      );
    }

    const liveTasks =
      Array.isArray(data) ? data : [];

    setTasks(liveTasks);

    // Cache real backend data
    localStorage.setItem(
      "taskflowTasks",
      JSON.stringify(liveTasks)
    );
  } catch (error) {
    setMessage(
      error.message ||
        "Failed to load tasks"
    );
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
// CACHE TASKS WHENEVER THEY CHANGE
// ==========================================

useEffect(() => {
  if (token) {
    localStorage.setItem(
      "taskflowTasks",
      JSON.stringify(tasks)
    );
  }
}, [tasks, token]);

  // ==========================================
  // THEME
  // ==========================================

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove(
        "light-mode"
      );
    } else {
      document.body.classList.add(
        "light-mode"
      );
    }

    localStorage.setItem(
      "taskflowTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // ==========================================
  // NOTIFICATIONS
  // ==========================================


   const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    setMessage("Your browser does not support notifications.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    setMessage(
      "Notifications are blocked in your browser settings."
    );
    return false;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    setMessage("Notifications enabled 🔔");
    return true;
  }

  setMessage("Notification permission was not granted.");
  return false;
  };
// ==========================================
// REAL BROWSER NOTIFICATIONS
// ==========================================

useEffect(() => {
  const setupNotifications = async () => {
    if (!("Notification" in window)) {
      console.log("Browser notifications are not supported.");
      return;
    }

    // User ne notification ON rakha hai
    if (
      notificationsEnabled &&
      Notification.permission === "default"
    ) {
      const permission =
        await Notification.requestPermission();

      if (permission !== "granted") {
        setNotificationsEnabled(false);
      }
    }
  };

  setupNotifications();

  localStorage.setItem(
    "notificationsEnabled",
    notificationsEnabled
  );
}, [notificationsEnabled]);

 

  // ==========================================
  // CREATE PROJECT
  // ==========================================

  const createProject = async () => {
    const cleanName =
      projectName.trim();

    if (!cleanName) {
      setMessage(
        "Enter a project name."
      );
      return;
    }

    if (!token) {
      setMessage(
        "Please login first."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/projects`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: cleanName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();

          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (response.status === 422) {
          throw new Error(
            Array.isArray(data.detail)
              ? data.detail
                  .map(
                    (item) =>
                      item.msg ||
                      "Invalid project data"
                  )
                  .join(", ")
              : data.detail ||
                  "Invalid project data"
          );
        }

        throw new Error(
          data.detail ||
            "Failed to create project"
        );
      }

      setProjectName("");
      setShowProjectModal(false);

      setMessage(
        "Project created successfully 🚀"
      );

      if (data && data.id) {
        setProjects(
          (previousProjects) => [
            ...previousProjects,
            data,
          ]
        );
      } else {
        await fetchProjects();
      }
    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      setMessage(
        error.message ||
          "Failed to create project"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // OPEN EDIT PROJECT
  // ==========================================

  const openEditProject = (project) => {
    setEditingProject(project);
    setEditProjectName(project.name);
    setMessage("");
    setShowEditProjectModal(true);
  };



  // ==========================================
// OPEN PROJECT DETAILS
// ==========================================

const openProjectDetails = (project) => {
  setSelectedProject(project);
  setActivePage("project-details");
  setSidebarOpen(false);
  setMessage("");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};



  // ==========================================
  // UPDATE PROJECT
  // ==========================================

  const updateProject = async () => {
    const cleanName =
      editProjectName.trim();

    if (!cleanName) {
      setMessage(
        "Enter a project name."
      );
      return;
    }

    if (!editingProject) {
      setMessage(
        "No project selected."
      );
      return;
    }

    if (!token) {
      setMessage(
        "Please login first."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/projects/${editingProject.id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: cleanName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();

          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (response.status === 422) {
          throw new Error(
            Array.isArray(data.detail)
              ? data.detail
                  .map(
                    (item) =>
                      item.msg ||
                      "Invalid project data"
                  )
                  .join(", ")
              : data.detail ||
                  "Invalid project data"
          );
        }

        throw new Error(
          data.detail ||
            "Failed to update project"
        );
      }

      setProjects(
        (previousProjects) =>
          previousProjects.map(
            (project) =>
              project.id ===
              editingProject.id
                ? {
                    ...project,
                    ...data,
                    name:
                      data.name ||
                      cleanName,
                  }
                : project
          )
      );

      setEditingProject(null);
      setEditProjectName("");
      setShowEditProjectModal(false);

      setMessage(
        "Project updated successfully ✨"
      );
    } catch (error) {
      console.error(
        "Update project error:",
        error
      );

      setMessage(
        error.message ||
          "Failed to update project"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE PROJECT
  // ==========================================

  const deleteProject = async (
    projectId
  ) => {
    if (!token) {
      setMessage(
        "Please login first."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this project?"
      );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/projects/${projectId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const text =
        await response.text();

      const data = text
        ? JSON.parse(text)
        : {};

      if (!response.ok) {
        if (response.status === 401) {
          logout();

          throw new Error(
            "Session expired. Please login again."
          );
        }

        throw new Error(
          data.detail ||
            "Failed to delete project"
        );
      }

      setProjects(
        (previousProjects) =>
          previousProjects.filter(
            (project) =>
              project.id !== projectId
          )
      );

      setTasks(
        (previousTasks) =>
          previousTasks.filter(
            (task) =>
              task.project_id !== projectId
          )
      );

      setMessage(
        "Project deleted successfully 🗑️"
      );
    } catch (error) {
      console.error(
        "Delete project error:",
        error
      );

      setMessage(
        error.message ||
          "Failed to delete project"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREATE TASK
  // ==========================================

  const createTask = async () => {
  console.log("TOKEN FROM STATE:", token);
  console.log("TOKEN FROM STORAGE:", localStorage.getItem("token"));

  if (!selectedProjectId) {
    setMessage("Please select a project first");
    return;
  }


  try {
    setLoading(true);

    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: Number(selectedProjectId),
        title: taskTitle,
        priority: priority,
        due_date: dueDate || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("CREATE TASK ERROR:", data);
      throw new Error(data.detail || "Failed to create task");
    }

    console.log("TASK CREATED:", data);

    setTasks((prev) => [...prev, data]);
    setShowTaskModal(false);
    setTaskTitle("");
    setSelectedProjectId("");
    setPriority("medium");
    setDueDate("");

  } catch (error) {
    console.error("Create task error:", error);
    setMessage(error.message);
  } finally {
    setLoading(false);
  }
};

  const handleQuickAdd = async () => {
  if (!quickTask.trim()) {
    alert("Please enter a task");
    return;
  }

  if (!selectedProjectId) {
    alert("Please select a project first");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tasks/quick-add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: Number(selectedProjectId),
        description: quickTask,
      }),
    });

  const data = await response.json();

if (!response.ok) {
  throw new Error(data.detail || "Quick Add failed");
}

setTasks((prevTasks) => [...prevTasks, data]);

setQuickTaskResult({
  title: data.title,
  priority: data.priority,
  due_date: data.due_date,
});

setQuickTask("");

    alert("✨ Task added successfully!");
  } catch (error) {
    console.error("Quick Add Error:", error);
    alert(error.message);
  }
};

  // ==========================================
// EDIT TASK
// ==========================================

const openEditTask = (task) => {
  setEditingTask(task);
  setEditTaskTitle(task.title || "");
  setEditTaskPriority(task.priority || "medium");
  setEditTaskDueDate(task.due_date || "");
  setMessage("");
  setShowEditTaskModal(true);
};

const updateTask = async () => {
  if (!editingTask) return;

  const cleanTitle = editTaskTitle.trim();

  if (!cleanTitle) {
    setMessage("Enter a task title.");
    return;
  }

  if (!token) {
    setMessage("Please login first.");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const response = await fetch(
      `${API_URL}/tasks/${editingTask.id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: cleanTitle,
          priority: editTaskPriority,
          due_date: editTaskDueDate || null,
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
        task.id === editingTask.id
          ? {
              ...task,
              ...data,
              title: data.title || cleanTitle,
              priority:
                data.priority || editTaskPriority,
              due_date:
                data.due_date ??
                (editTaskDueDate || null),
            }
          : task
      )
    );

    setEditingTask(null);
    setEditTaskTitle("");
    setEditTaskPriority("medium");
    setEditTaskDueDate("");
    setShowEditTaskModal(false);

    setMessage("Task updated successfully ✨");
  } catch (error) {
    console.error("Update task error:", error);

    setMessage(
      error.message || "Failed to update task"
    );
  } finally {
    setLoading(false);
  }
};
  // ==========================================
  // UPDATE TASK STATUS
  // ==========================================

  const updateTaskStatus = async (
    taskId,
    status
  ) => {
    if (!token) {
      setMessage(
        "Please login first."
      );
      return;
    }

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
        if (response.status === 401) {
          logout();
          return;
        }

        throw new Error(
          data.detail ||
            "Failed to update task"
        );
      }

      setTasks(
        (previousTasks) =>
          previousTasks.map(
            (task) =>
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
      setMessage(
        error.message ||
          "Failed to update task"
      );
    }
  };

  // ==========================================
  // DELETE TASK
  // ==========================================

  const deleteTask = async (
    taskId
  ) => {
    if (!token) {
      setMessage(
        "Please login first."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const text =
        await response.text();

      const data = text
        ? JSON.parse(text)
        : {};

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }

        throw new Error(
          data.detail ||
            "Failed to delete task"
        );
      }

      setTasks(
        (previousTasks) =>
          previousTasks.filter(
            (task) =>
              task.id !== taskId
          )
      );

      setMessage(
        "Task deleted successfully 🗑️"
      );
    } catch (error) {
      console.error(
        "Delete task error:",
        error
      );

      setMessage(
        error.message ||
          "Failed to delete task"
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
// PROFILE PHOTO
// ==========================================

const handleProfilePhotoChange = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  // Only allow images
  if (!file.type.startsWith("image/")) {
    setMessage("Please select a valid image.");
    return;
  }

  // Limit to 2MB
  if (file.size > 2 * 1024 * 1024) {
    setMessage("Profile photo must be under 2MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const imageData = reader.result;

    localStorage.setItem(
      "taskflowProfilePhoto",
      imageData
    );

    setProfilePhoto(imageData);

    setMessage(
      "Profile photo updated successfully ✨"
    );
  };

  reader.readAsDataURL(file);
};


const removeProfilePhoto = () => {
  localStorage.removeItem(
    "taskflowProfilePhoto"
  );

  setProfilePhoto("");

  setMessage(
    "Profile photo removed."
  );
};


  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const saveProfile = () => {
    const cleanName =
      settingsName.trim();

    const cleanEmail =
      settingsEmail.trim();

    if (!cleanName) {
      setMessage(
        "Name cannot be empty."
      );
      return;
    }

    if (!cleanEmail) {
      setMessage(
        "Email cannot be empty."
      );
      return;
    }

    localStorage.setItem(
      "taskflowName",
      cleanName
    );

    localStorage.setItem(
      "taskflowEmail",
      cleanEmail
    );

    setSettingsName(cleanName);
    setSettingsEmail(cleanEmail);

    setShowProfileModal(false);

    setMessage(
      "Profile updated successfully ✨"
    );
  };

  // ==========================================
  // SECURITY
  // ==========================================

  const saveSecurity = () => {
    if (!newPassword) {
      setMessage(
        "Enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setMessage(
        "Passwords do not match."
      );
      return;
    }

    /*
      IMPORTANT:
      Your current backend does not expose
      a password-change endpoint.

      So we validate the security form here,
      but we DO NOT pretend that the backend
      password has actually been changed.
    */

    setNewPassword("");
    setConfirmPassword("");
    setShowSecurityModal(false);

    setMessage(
      "Password form validated. Connect a backend password-change endpoint to save the new password."
    );
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    setToken(null);
    setProjects([]);
    setTasks([]);
    localStorage.removeItem("taskflowTasks");

    setMessage("");
    setEmail("");
    setPassword("");
    setName("");

    setProjectName("");
    setTaskTitle("");
    setSelectedProjectId("");

    setEditingProject(null);
    setEditProjectName("");

    setShowEditProjectModal(false);
    setShowProjectModal(false);
    setShowTaskModal(false);
    setShowProfileModal(false);
    setShowSecurityModal(false);

    setSidebarOpen(false);
    setActivePage("dashboard");
  };



  // ==========================================
// GLOBAL SEARCH
// ==========================================


const searchTasksFromBackend = async () => {
  const query = searchQuery.trim();

  if (!query) {
    setBackendSearchTask(null);
    return;
  }

  if (!token) {
    setMessage("Please login first.");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/tasks/search?title=${encodeURIComponent(
        query
      )}&algo=${searchAlgorithm}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setBackendSearchTask(null);
      return;
    }

    setBackendSearchTask(data);
  } catch (error) {
    console.error("Backend search error:", error);
    setBackendSearchTask(null);
  }
};


const searchText = searchQuery.trim().toLowerCase();

const filteredProjects = searchText
  ? projects.filter((project) =>
      project.name
        ?.toLowerCase()
        .includes(searchText)
    )
  : [];


  // ==========================================
// FILTERED + SORTED TASKS
// ==========================================

const displayedTasks = tasks
  .filter((task) => {
    if (
      taskStatusFilter !== "all" &&
      task.status !== taskStatusFilter
    ) {
      return false;
    }

    if (
      taskPriorityFilter !== "all" &&
      task.priority !== taskPriorityFilter
    ) {
      return false;
    }

    return true;
  })
  .sort((a, b) => {
    if (taskSort === "priority") {
      const priorityOrder = {
        high: 3,
        medium: 2,
        low: 1,
      };

      return (
        (priorityOrder[b.priority] || 0) -
        (priorityOrder[a.priority] || 0)
      );
    }

    if (taskSort === "due_date") {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;

      return (
        new Date(a.due_date) -
        new Date(b.due_date)
      );
    }

    if (taskSort === "oldest") {
      return a.id - b.id;
    }

    return b.id - a.id;
  });
const filteredTasks = searchText
  ? tasks.filter((task) =>
      task.title
        ?.toLowerCase()
        .includes(searchText)
    )
  : [];

// ==========================================
// DYNAMIC ISLAND
// ==========================================

function DynamicIsland({ tasks = [], projects = [] }) {
  const [islandOpen, setIslandOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, []);

const formattedTime = currentTime.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

  const currentTask =
    tasks.length > 0
      ? tasks[0]?.title || "No active task"
      : "No active task";

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) =>
      task.completed === true ||
      task.status === "completed"
  ).length;

  const progress =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  return (
    <div
      className={`dynamic-island ${
        islandOpen ? "dynamic-island-open" : ""
      }`}
      onMouseEnter={() => {
        if (window.innerWidth > 768) {
          setIslandOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (window.innerWidth > 768) {
          setIslandOpen(false);
        }
      }}
      onClick={() => {
        if (window.innerWidth <= 768) {
          setIslandOpen((prev) => !prev);
        }
      }}
    >
{/* COLLAPSED PILL */}
<div className="dynamic-island-pill">
  <span className="island-status-dot"></span>
</div>

      {/* EXPANDED CONTENT */}
      {islandOpen && (
        <div className="dynamic-island-content">

          {/* SYSTEM */}
          <div className="island-widget">

            <div className="island-widget-top">
              <span>System Status</span>

              <span className="island-green-dot"></span>
            </div>

            <strong>
              Optimized
            </strong>

            <small>
              All systems operational
            </small>

          </div>
          {/* TIME */}

            <div className="island-widget island-time-widget">

            <div className="island-widget-top">
              <span>Local Time</span>

              <span className="island-clock-icon">
                ◷
              </span>
            </div>

            <strong className="island-live-time">
              {formattedTime}
            </strong>

            <small>
              Your current local time
            </small>

          </div>


          {/* NETWORK */}
          <div className="island-widget">

            <div className="island-widget-top">
              <span>Network</span>

              <span className="network-icon">
                ◉
              </span>
            </div>

            <strong>
              Stable
            </strong>

            <small>
              Connection active
            </small>

          </div>


          {/* CURRENT TASK */}
          <div className="island-widget">

            <div className="island-widget-top">
              <span>Current Task</span>

              <span className="task-live-dot"></span>
            </div>

            <strong className="island-task-name">
              {currentTask}
            </strong>

            <small>
              {totalTasks > 0
                ? `${totalTasks} tasks in workspace`
                : "No tasks available"}
            </small>

          </div>


          {/* PROGRESS */}
          <div className="island-widget">

            <div className="island-widget-top">
              <span>Task Progress</span>

              <span>
                {progress}%
              </span>
            </div>

            <div className="island-progress">
              <div
                style={{
                  width: `${progress}%`,
                }}
              ></div>
            </div>

            <small>
              {completedTasks} of {totalTasks} completed
            </small>

          </div>

        </div>
      )}

    </div>
  );
}
  // ==========================================
  // STATS
  // ==========================================
  const [quickTaskResult, setQuickTaskResult] = useState(null);
  const completedTasks =
    tasks.filter(
      (task) =>
        task.status === "completed"
    ).length;

  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status !== "completed"
    ).length;

  const completion =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks /
            tasks.length) *
            100
        );

// ==========================================
// LOGIN / REGISTER PAGE
// ==========================================

if (!token) {
  return (
    
    <div className="auth-page">

      {/* Background decoration */}
      <div className="auth-glow glow-one"></div>
      <div className="auth-glow glow-two"></div>
      <div className="auth-grid"></div>

      {/* Floating stars */}
      <div className="auth-star star-one">✦</div>
      <div className="auth-star star-two">✦</div>
      <div className="auth-star star-three">✦</div>

      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <span>Task</span>Flow
        </div>

        <p className="auth-subtitle">
          {isLogin
            ? "Welcome back! Login to continue."
            : "Create your TaskFlow account."}
        </p>

        <form onSubmit={handleSubmit}>

          {/* NAME - REGISTER ONLY */}
          {!isLogin && (
            <div className="auth-input-group">

              <label>
                <span className="input-icon">♙</span>
                Name
              </label>

              <div className="auth-input-wrapper">
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

            </div>
          )}

          {/* EMAIL */}
          <div className="auth-input-group">

            <label>
              <span className="input-icon">♙</span>
              Email
            </label>

            <div className="auth-input-wrapper">
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

          </div>

          {/* PASSWORD */}
          <div className="auth-input-group">

            <label>
              <span className="input-icon">♙</span>
              Password
            </label>

            <div className="auth-input-wrapper">
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

          </div>

          {/* REMEMBER + FORGOT */}
          {isLogin && (
            <div className="auth-options">

              <label className="remember-option">
                <input type="checkbox" />
                <span className="custom-checkbox"></span>
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() => {
                  setMessage(
                    "Password reset will be available soon."
                  );
                }}
              >
                Forgot password?
              </button>

            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            <span>
              {loading
                ? "Please wait..."
                : isLogin
                ? "Enter TaskFlow"
                : "Create Account"}
            </span>

            <span className="button-arrow">
              →
            </span>
          </button>

        </form>

        {/* MESSAGE */}
        {message && (
          <div className="auth-message">
            {message}
          </div>
        )}

        {/* SWITCH */}
        <div className="auth-switch">

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
    <>
      <ScrollAnimations />
      {/* ==========================================
          SIDEBAR TOGGLE
      ========================================== */}

      <button
        className={`sidebar-toggle ${
          sidebarOpen ? "open" : ""
        }`}
        onClick={() =>
          setSidebarOpen(!sidebarOpen)
        }
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? "‹" : "›"}
      </button>

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="sidebar-logo">
          <span>Task</span>Flow
        </div>

        <div className="sidebar-menu">

          {/* DASHBOARD */}

          <button
            className={`sidebar-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActivePage(
                "dashboard"
              );

              setSidebarOpen(false);

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            <span>⌂</span>
            Dashboard
          </button>

          {/* PROJECTS */}

          <button
            className="sidebar-item"
            onClick={() => {
              setActivePage(
                "dashboard"
              );

              setSidebarOpen(false);

              setTimeout(() => {
                document
                  .querySelector(
                    ".project-list"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                    block: "start",
                  });
              }, 50);
            }}
          >
            <span>▣</span>
            Projects
          </button>

          {/* TASKS */}

          <button
            className="sidebar-item"
            onClick={() => {
              setActivePage(
                "dashboard"
              );

              setSidebarOpen(false);

              setTimeout(() => {
                const sections =
                  document.querySelectorAll(
                    ".section-block"
                  );

                if (sections[1]) {
                  sections[1].scrollIntoView(
                    {
                      behavior:
                        "smooth",
                      block: "start",
                    }
                  );
                }
              }, 50);
            }}
          >
            <span>✓</span>
            Tasks
          </button>

          {/* ACTIVITY */}

          <button
            className="sidebar-item"
            onClick={() => {
              setActivePage(
                "dashboard"
              );

              setSidebarOpen(false);

              setTimeout(() => {
                document
                  .querySelector(
                    ".activity-section"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                    block: "start",
                  });
              }, 50);
            }}
          >
            <span>◷</span>
            Activity
          </button>

        </div>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          {/* SETTINGS */}

          <button
            className={`sidebar-item ${
              activePage === "settings"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActivePage(
                "settings"
              );

              setSidebarOpen(false);

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            <span>⚙</span>
            Settings
          </button>

          {/* LOGOUT */}

          <button
            className="sidebar-item sidebar-logout"
            onClick={logout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* ==========================================
          NAVBAR
      ========================================== */}

      <header className="navbar">

  <div className="logo">
    <span>Task</span>Flow
  </div>

  {/* GLOBAL SEARCH */}
 <SearchBar
  value={searchQuery}
  onChange={(value) => {
    setSearchQuery(value);
    setBackendSearchTask(null);
  }}
  onSearch={searchTasksFromBackend}
/>
  <DynamicIsland
  tasks={tasks}
  projects={projects}
  />

  <div className="nav-right">

  <div className="online-dot"></div>

 <div
  className="nav-profile"
  onClick={() => {
    if (profilePhoto) {
      setShowProfilePhoto(true);
    }
  }}
>

  {profilePhoto ? (
    <img
      src={profilePhoto}
      alt="Profile"
      className="nav-profile-photo"
    />
  ) : (
    <div className="nav-profile-placeholder">
      {(settingsName || "W")
        .charAt(0)
        .toUpperCase()}
    </div>
  )}

  <span className="user-label">
    {settingsName || "Workspace"}
  </span>

</div>

  <button
    className="logout-btn"
    onClick={logout}
  >
    Logout
  </button>

</div>
      </header>



{/* ==========================================
    SEARCH RESULTS
========================================== */}

{searchQuery.trim() !== "" &&
  activePage !== "settings" && (
    <div className="search-results-panel">

      <div className="search-results-header">
        <span>SEARCH RESULTS</span>

        <button
          onClick={() => {
            setSearchQuery("");
            setShowSearch(false);
          }}
        >
          ×
        </button>
      </div>



  <div className="algorithm-search-controls">

  <select
    value={searchAlgorithm}
    onChange={(e) => {
      setSearchAlgorithm(e.target.value);
      setAlgorithmSearchResult(null);
    }}
  >
    <option value="binary">
      Binary Search
    </option>

    <option value="linear">
      Linear Search
    </option>
  </select>

  <button
    className="algorithm-search-btn"
    onClick={runAlgorithmSearch}
    disabled={
      !searchQuery.trim() ||
      algorithmSearchLoading
    }
  >
    {algorithmSearchLoading
      ? "Searching..."
      : "Run Algorithm"}
  </button>

  </div>



      {/* PROJECT RESULTS */}

      {filteredProjects.length > 0 && (
        <div className="search-result-section">

          <p>PROJECTS</p>

          {filteredProjects.map((project) => (
            <button
              key={`project-${project.id}`}
              className="search-result-item"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");

                setTimeout(() => {
                  document
                    .querySelector(".project-list")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }, 50);
              }}
            >
              <span className="search-result-icon">
                📁
              </span>

              <span>
                <strong>
                  {project.name}
                </strong>

                <small>
                  Project #{project.id}
                </small>
              </span>
            </button>
          ))}

        </div>
      )}


{/* ALGORITHM SEARCH RESULT */}

{algorithmSearchResult && (
  <div className="search-result-section algorithm-result">
    <p>
      {searchAlgorithm === "binary"
        ? "BINARY SEARCH RESULT"
        : "LINEAR SEARCH RESULT"}
    </p>

    <div className="search-result-item algorithm-result-item">
      <span className="search-result-icon">
        ⚡
      </span>

      <span>
        <strong>
          {algorithmSearchResult.title}
        </strong>

        <small>
          Algorithm:{" "}
          {searchAlgorithm === "binary"
            ? "Binary Search"
            : "Linear Search"}

          {" • "}

          Project #
          {algorithmSearchResult.project_id}
        </small>
      </span>
    </div>
  </div>
)}
      {/* TASK RESULTS */}


{backendSearchTask && (
  <div className="search-result-section">
    <p>ALGORITHM SEARCH RESULT</p>

    <button
      className="search-result-item"
      onClick={() => {
        setShowSearch(false);
        setSearchQuery("");
        setBackendSearchTask(null);

        setTimeout(() => {
          document
            .querySelector(".task-list")
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }, 50);
      }}
    >
      <span className="search-result-icon">
        ✓
      </span>

      <span>
        <strong>
          {backendSearchTask.title}
        </strong>

        <small>
          Project #{backendSearchTask.project_id}
          {" • "}
          {searchAlgorithm} search
        </small>
      </span>
    </button>
  </div>
)}

      {filteredTasks.length > 0 && (
        <div className="search-result-section">

          <p>TASKS</p>

          {filteredTasks.map((task) => (
            <button
              key={`task-${task.id}`}
              className="search-result-item"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");

                setTimeout(() => {
                  document
                    .querySelector(".task-list")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }, 50);
              }}
            >
              <span className="search-result-icon">
                ✓
              </span>

              <span>
                <strong>
                  {task.title}
                </strong>

                <small>
                  Project #{task.project_id}
                </small>
              </span>
            </button>
          ))}

        </div>
      )}

      {/* NOTHING FOUND */}

      {filteredProjects.length === 0 &&
      filteredTasks.length === 0 &&
      !backendSearchTask && (
          <div className="search-no-results">
            <span>🔍</span>
            <p>
              No projects or tasks found.
            </p>
          </div>
        )}

    </div>
)}
      {/* ==========================================
          SETTINGS PAGE
      ========================================== */}
       
      {activePage === "settings" ? (

        <main className="dashboard-content settings-page">

          <div className="settings-header">

            <p className="section-kicker">
              PREFERENCES
            </p>

            <h1>
              Settings
            </h1>

            <p>
              Manage your TaskFlow workspace and account.
            </p>

          </div>

          <div className="settings-grid">

            {/* ======================================
                PROFILE
            ====================================== */}

            <div className="settings-card">

              <div className="settings-card-icon">
                👤
              </div>

              <div className="settings-card-info">

                <h3>
                  Profile
                </h3>

                <p>
                  {settingsName
                    ? `${settingsName} • ${settingsEmail}`
                    : "Manage your account information."}
                </p>

              </div>

              <button
                className="settings-action"
                onClick={() => {
                  setMessage("");
                  setShowProfileModal(
                    true
                  );
                }}
              >
                Edit Profile
                <span>→</span>
              </button>

            </div>

{/* ======================================
PROFILE PHOTO
====================================== */}

<div className="settings-card profile-photo-card">

  <div className="settings-card-icon profile-photo-icon">

    {profilePhoto ? (
      <img
        src={profilePhoto}
        alt="Profile"
      />
    ) : (
      "👤"
    )}

  </div>

  <div className="settings-card-info">

    <h3>
      Profile Photo
    </h3>

    <p>
      {profilePhoto
        ? "Your profile photo is currently set."
        : "Add a photo to personalize your TaskFlow profile."}
    </p>

  </div>

  <div className="profile-photo-actions">

    <label className="settings-action profile-upload-btn">

      {profilePhoto
        ? "Change Photo"
        : "Upload Photo"}

      <input
        type="file"
        accept="image/*"
        onChange={handleProfilePhotoChange}
        hidden
      />

    </label>

    {profilePhoto && (
      <button
        className="profile-remove-btn"
        onClick={removeProfilePhoto}
      >
        Remove
      </button>
    )}

  </div>

</div>

            {/* ======================================
                NOTIFICATIONS
            ====================================== */}

            <div className="settings-card">

              <div className="settings-card-icon">
                🔔
              </div>

              <div className="settings-card-info">

                <h3>
                  Notifications
                </h3>

                <p>
                  Control your TaskFlow notifications.
                </p>

              </div>

              <label className="toggle">

                <input
  type="checkbox"
  checked={notificationsEnabled}
  onChange={async (e) => {
    const enabled = e.target.checked;

    if (enabled) {
      if (!("Notification" in window)) {
        setMessage(
          "Your browser does not support notifications."
        );
        return;
      }

      if (Notification.permission === "default") {
        const permission =
          await Notification.requestPermission();

        if (permission !== "granted") {
          setMessage(
            "Please allow browser notifications."
          );
          return;
        }
      }

      if (Notification.permission === "denied") {
        setMessage(
          "Notifications are blocked in browser settings."
        );
        return;
      }

      setNotificationsEnabled(true);

      new Notification("TaskFlow 🔔", {
        body: "Notifications are now enabled!",
      });

      setMessage(
        "Notifications enabled 🔔"
      );
    } else {
      setNotificationsEnabled(false);

      setMessage(
        "Notifications disabled 🔕"
      );
    }
  }}
/>

                <span></span>

              </label>

            </div>

            {/* ======================================
                APPEARANCE
            ====================================== */}

            <div className="settings-card">

              <div className="settings-card-icon">
                {darkMode
                  ? "🌙"
                  : "☀️"}
              </div>

              <div className="settings-card-info">

                <h3>
                  Appearance
                </h3>

                <p>
                  {darkMode
                    ? "TaskFlow is currently using dark mode."
                    : "TaskFlow is currently using light mode."}
                </p>

              </div>

              <label className="toggle">

                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => {
                    setDarkMode(
                      e.target.checked
                    );

                    setMessage(
                      e.target.checked
                        ? "Dark mode enabled 🌙"
                        : "Light mode enabled ☀️"
                    );
                  }}
                />

                <span></span>

              </label>

            </div>

            {/* ======================================
                SECURITY
            ====================================== */}

            <div className="settings-card">

              <div className="settings-card-icon">
                🔐
              </div>

              <div className="settings-card-info">

                <h3>
                  Security
                </h3>

                <p>
                  Manage your account security.
                </p>

              </div>

              <button
                className="settings-action"
                onClick={() => {
                  setMessage("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setShowSecurityModal(
                    true
                  );
                }}
              >
                Manage
                <span>→</span>
              </button>

            </div>

          </div>

          {message && (
            <div className="message settings-message">
              {message}
            </div>
          )}

        </main>

      ) : (

        /* ==========================================
           NORMAL DASHBOARD
        ========================================== */

        <main className="dashboard-content">

          {/* ======================================
              HERO
          ====================================== */}

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

          </section>

          {/* ======================================
              MESSAGE
          ====================================== */}

          {message && (
            <div className="message">
              {message}
            </div>
          )}

          {/* ======================================
              STATS
          ====================================== */}

          <section className="stats-grid">

            <div
              className="stat-card mouse-card"
              onMouseMove={
                handleMouseMove
              }
              onMouseLeave={
                handleMouseLeave
              }
            >

              <span>
                PROJECTS
              </span>

              <strong>
                {projects.length}
              </strong>

              <small>
                Your workspaces
              </small>

            </div>

            <div
              className="stat-card mouse-card"
              onMouseMove={
                handleMouseMove
              }
              onMouseLeave={
                handleMouseLeave
              }
            >

              <span>
                TOTAL TASKS
              </span>

              <strong>
                {tasks.length}
              </strong>

              <small>
                Things to finish
              </small>

            </div>

            <div
              className="stat-card mouse-card"
              onMouseMove={
                handleMouseMove
              }
              onMouseLeave={
                handleMouseLeave
              }
            >

              <span>
                COMPLETED
              </span>

              <strong>
                {completedTasks}
              </strong>

              <small>
                Already crushed
              </small>

            </div>

            <div
              className="stat-card progress-card mouse-card"
              onMouseMove={
                handleMouseMove
              }
              onMouseLeave={
                handleMouseLeave
              }
            >

              <span>
                PROGRESS
              </span>

              <strong>
                {completion}%
              </strong>

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

          {/* ======================================
              PROJECTS
          ====================================== */}

          <section className="section-block">

            <div className="section-heading">

              <div>

                <p className="section-kicker">
                  ORGANIZE
                </p>

                <h2>
                  Your Projects
                </h2>

              </div>

              <button
                className="primary-action"
                onClick={() => {
                  setMessage("");
                  setProjectName("");
                  setShowProjectModal(
                    true
                  );
                }}
                disabled={loading}
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

                  <h3>
                    No projects yet
                  </h3>

                  <p>
                    Create your first workspace
                    and start building.
                  </p>

                </div>

              ) : (

                projects.map(
                  (project, index) => (

                    <div
                      className="project-item mouse-card"
                      key={project.id}
                      onClick={() => openProjectDetails(project)}
                      onMouseMove={
                        handleMouseMove
                      }
                      onMouseLeave={
                        handleMouseLeave
                      }
                    >

                      <div className="project-number">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
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

                      <button
                        className="project-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditProject(
                            project
                          );
                        }}
                        disabled={loading}
                        title="Edit project"
                      >
                        ✏️
                      </button>

                      <button
                        className="project-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(
                            project.id
                          );
                        }}
                        disabled={loading}
                        title="Delete project"
                      >
                        🗑
                      </button>

                      <div className="project-arrow">
                        →
                      </div>

                    </div>

                  )
                )
              )}

            </div>

          </section>

{/* ======================================
    TASKS
====================================== */}

          <section className="section-block">


{/* ======================================
    AI QUICK ADD
====================================== */}
<div className="quick-add-box">

  <h3>
    ✨ AI Quick Add
  </h3>


{quickTaskResult && (
  <div className="quick-add-result">
    <div className="quick-add-result-title">
      ✨ Task Detected
    </div>

    <div className="quick-add-result-row">
      <span>Task</span>
      <strong>{quickTaskResult.title}</strong>
    </div>

    <div className="quick-add-result-row">
      <span>Priority</span>
      <strong
        className={`priority priority-${quickTaskResult.priority}`}
      >
        {quickTaskResult.priority}
      </strong>
    </div>

    <div className="quick-add-result-row">
      <span>Due Date</span>
      <strong>
        {quickTaskResult.due_date || "No due date detected"}
      </strong>
    </div>
  </div>
)}
  <p>
    Type your task naturally — I'll detect
    priority and due date automatically.
  </p>

  <input
    type="text"
    placeholder="e.g. Urgent submit assignment tomorrow"
    value={quickTask}
    onChange={(e) =>
      setQuickTask(e.target.value)
    }
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleQuickAdd();
      }
    }}
  />

  {/* PROJECT SELECT */}
  <select
    className="quick-project-select"
    value={selectedProjectId}
    onChange={(e) =>
      setSelectedProjectId(e.target.value)
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

  <button
    onClick={handleQuickAdd}
    disabled={loading}
  >
    {loading
      ? "Adding..."
      : "✨ Add Task"}
  </button>

</div>
            <div className="section-heading">

              <div>

                <p className="section-kicker">
                  EXECUTE
                </p>

                <h2>
                  Recent Tasks
                </h2>
<div className="task-controls">

  <select
    value={taskStatusFilter}
    onChange={(e) =>
      setTaskStatusFilter(e.target.value)
    }
    className="task-filter"
  >
    <option value="all">
      All Status
    </option>

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

  <select
    value={taskPriorityFilter}
    onChange={(e) =>
      setTaskPriorityFilter(e.target.value)
    }
    className="task-filter"
  >
    <option value="all">
      All Priority
    </option>

    <option value="high">
      High
    </option>

    <option value="medium">
      Medium
    </option>

    <option value="low">
      Low
    </option>
  </select>

  <select
    value={taskSort}
    onChange={(e) =>
      setTaskSort(e.target.value)
    }
    className="task-filter"
  >
    <option value="newest">
      Newest
    </option>

    <option value="oldest">
      Oldest
    </option>

    <option value="priority">
      Priority
    </option>

    <option value="due_date">
      Due Date
    </option>
  </select>

  <button
    className="clear-filters"
    onClick={() => {
      setTaskStatusFilter("all");
      setTaskPriorityFilter("all");
      setTaskSort("newest");
    }}
  >
    Clear
  </button>

</div>
              </div>

              <button
                className="primary-action"
                onClick={() => {
                  setMessage("");
                  setTaskTitle("");
                  setPriority("medium");
                  setSelectedProjectId("");
                  setDueDate("");
                  setShowTaskModal(true);
                }}
                disabled={loading}
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

                  <h3>
                    Nothing here yet
                  </h3>

                  <p>
                    Create a task and get moving.
                  </p>

                </div>

              ) : (

               displayedTasks.map((task) => (

                  <div
                    className={`task-item mouse-card ${
                      task.status ===
                      "completed"
                        ? "task-completed"
                        : ""
                    }`}
                    key={task.id}
                    onMouseMove={
                      handleMouseMove
                    }
                    onMouseLeave={
                      handleMouseLeave
                    }
                  >

                    <div className="task-check">
                      {task.status ===
                      "completed"
                        ? "✓"
                        : "○"}
                    </div>

                    <div className="task-info">

                      <strong>
                        {task.title}
                      </strong>

                      <span>
                        Project #
                        {task.project_id}
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
                      disabled={loading}
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
                    <button
                      className="edit-task-btn"
                      onClick={() => openEditTask(task)}
                      disabled={loading}
                      title="Edit task"
                    >
                     ✏️
                    </button>
                    <button
                      className="delete-task-btn"
                      onClick={() =>
                        deleteTask(
                          task.id
                        )
                      }
                      disabled={loading}
                      title="Delete task"
                    >
                      🗑
                    </button>

                  </div>

                ))
              )}

            </div>

          </section>

          {/* ======================================
              ACTIVITY ANALYTICS
          ====================================== */}

          <section className="activity-section">

            <div className="section-heading">

              <div>

                <p className="section-kicker">
                  ANALYTICS
                </p>

                <h2>
                  Activity Overview
                </h2>

              </div>

              <span className="activity-live">
                ● LIVE DATA
              </span>

            </div>

            <div className="activity-grid">

              <div className="activity-card">

                <span>
                  TOTAL PROJECTS
                </span>

                <strong>
                  {projects.length}
                </strong>

                <small>
                  Workspaces created
                </small>

              </div>

              <div className="activity-card">

                <span>
                  TOTAL TASKS
                </span>

                <strong>
                  {tasks.length}
                </strong>

                <small>
                  Tasks created
                </small>

              </div>

              <div className="activity-card">

                <span>
                  COMPLETED
                </span>

                <strong>
                  {completedTasks}
                </strong>

                <small>
                  Tasks completed
                </small>

              </div>

              <div className="activity-card">

                <span>
                  PENDING
                </span>

                <strong>
                  {pendingTasks}
                </strong>

                <small>
                  Tasks remaining
                </small>

              </div>

            </div>

            {/* PRODUCTIVITY */}

            <div className="activity-chart">

              <div className="chart-header">

                <div>

                  <span>
                    PRODUCTIVITY
                  </span>

                  <h3>
                    Task Progress
                  </h3>

                </div>

                <div className="chart-percentage">
                  {completion}%
                </div>

              </div>

              <div className="activity-bars">

                <div className="activity-bar">

                  <div
                    className="activity-bar-fill projects-bar"
                    style={{
                      height: `${Math.min(
                        Math.max(
                          projects.length *
                            12,
                          8
                        ),
                        100
                      )}%`,
                    }}
                  />

                  <span>
                    Projects
                  </span>

                </div>

                <div className="activity-bar">

                  <div
                    className="activity-bar-fill tasks-bar"
                    style={{
                      height: `${Math.min(
                        Math.max(
                          tasks.length *
                            5,
                          8
                        ),
                        100
                      )}%`,
                    }}
                  />

                  <span>
                    Tasks
                  </span>

                </div>

                <div className="activity-bar">

                  <div
                    className="activity-bar-fill completed-bar"
                    style={{
                      height: `${
                        tasks.length
                          ? Math.max(
                              (completedTasks /
                                tasks.length) *
                                100,
                              8
                            )
                          : 8
                      }%`,
                    }}
                  />

                  <span>
                    Completed
                  </span>

                </div>

                <div className="activity-bar">

                  <div
                    className="activity-bar-fill pending-bar"
                    style={{
                      height: `${
                        tasks.length
                          ? Math.max(
                              (pendingTasks /
                                tasks.length) *
                                100,
                              8
                            )
                          : 8
                      }%`,
                    }}
                  />

                  <span>
                    Pending
                  </span>

                </div>

              </div>

            </div>

          </section>

        </main>
      )}


{/* ==========================================
    PROFILE MODAL
========================================== */}

{showProfileModal && (
  <div
    className="modal-overlay"
    onClick={() => !loading && setShowProfileModal(false)}
  >
    <div
      className="modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="modal-close"
        onClick={() =>
          !loading && setShowProfileModal(false)
        }
      >
        ×
      </button>

      <p className="section-kicker">
        ACCOUNT
      </p>

      <h2>
        Edit Profile
      </h2>

      <p className="modal-subtitle">
        Update your TaskFlow account information.
      </p>

      <input
        className="modal-input"
        type="text"
        placeholder="Your name"
        value={settingsName}
        onChange={(e) =>
          setSettingsName(e.target.value)
        }
        disabled={loading}
      />

      <input
        className="modal-input"
        type="email"
        placeholder="Your email"
        value={settingsEmail}
        onChange={(e) =>
          setSettingsEmail(e.target.value)
        }
        disabled={loading}
      />

      <button
        className="modal-submit"
        onClick={() => {
          const cleanName = settingsName.trim();
          const cleanEmail = settingsEmail.trim();

          if (!cleanName) {
            setMessage("Name cannot be empty.");
            return;
          }

          if (!cleanEmail) {
            setMessage("Email cannot be empty.");
            return;
          }

          localStorage.setItem(
            "taskflowName",
            cleanName
          );

          localStorage.setItem(
            "taskflowEmail",
            cleanEmail
          );

          setSettingsName(cleanName);
          setSettingsEmail(cleanEmail);

          setShowProfileModal(false);

          setMessage(
            "Profile updated successfully ✨"
          );
        }}
        disabled={loading}
      >
        Save Changes →
      </button>
    </div>
  </div>
)}
      {/* ==========================================
          CREATE PROJECT MODAL
      ========================================== */}

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

            <h2>
              Create Project
            </h2>

            <p className="modal-subtitle">
              Give your next idea a place to grow.
            </p>

            <input
              className="modal-input"
              placeholder="e.g. Portfolio Website"
              value={projectName}
              onChange={(e) =>
                setProjectName(
                  e.target.value
                )
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

      {/* ==========================================
          EDIT PROJECT MODAL
      ========================================== */}

      {showEditProjectModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            !loading &&
            setShowEditProjectModal(
              false
            )
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
                setShowEditProjectModal(
                  false
                )
              }
            >
              ×
            </button>

            <p className="section-kicker">
              EDIT WORKSPACE
            </p>

            <h2>
              Edit Project
            </h2>

            <p className="modal-subtitle">
              Change the name of your workspace.
            </p>

            <input
              className="modal-input"
              placeholder="Project name"
              value={editProjectName}
              onChange={(e) =>
                setEditProjectName(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !loading
                ) {
                  updateProject();
                }
              }}
              autoFocus
              disabled={loading}
            />

            <button
              className="modal-submit"
              onClick={updateProject}
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Update Project →"}
            </button>

          </div>

        </div>
      )}

      {/* ==========================================
          CREATE TASK MODAL
      ========================================== */}

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

            <h2>
              Create Task
            </h2>

            <p className="modal-subtitle">
              Turn an idea into something actionable.
            </p>

            <input
              className="modal-input"
              placeholder="e.g. Finish landing page"
              value={taskTitle}
              onChange={(e) =>
                setTaskTitle(
                  e.target.value
                )
              }
              autoFocus
              disabled={loading}
            />
            <input
              className="modal-input"
              type="date"
              value={dueDate}
              onChange={(e) =>
            setDueDate(e.target.value)
             }
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

              {projects.map(
                (project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                )
              )}

            </select>

            <select
              className="modal-input"
              value={priority}
              onChange={(e) =>
                setPriority(
                  e.target.value
                )
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

            {/* ==========================================
    EDIT TASK MODAL
========================================== */}

{showEditTaskModal && (
  <div
    className="modal-overlay"
    onClick={() =>
      !loading && setShowEditTaskModal(false)
    }
  >
    <div
      className="modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="modal-close"
        onClick={() =>
          !loading && setShowEditTaskModal(false)
        }
      >
        ×
      </button>

      <p className="section-kicker">
        EDIT TASK
      </p>

      <h2>
        Update Task
      </h2>

      <p className="modal-subtitle">
        Modify your task details.
      </p>

      <input
        className="modal-input"
        placeholder="Task title"
        value={editTaskTitle}
        onChange={(e) =>
          setEditTaskTitle(e.target.value)
        }
        disabled={loading}
        autoFocus
      />

      <input
        className="modal-input"
        type="date"
        value={editTaskDueDate}
        onChange={(e) =>
          setEditTaskDueDate(e.target.value)
        }
        disabled={loading}
      />

      <select
        className="modal-input"
        value={editTaskPriority}
        onChange={(e) =>
          setEditTaskPriority(e.target.value)
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
        onClick={updateTask}
        disabled={loading}
      >
        {loading
          ? "Updating..."
          : "Update Task →"}
      </button>
    </div>
  </div>
)}
{/* ==========================================
    PROFILE PHOTO VIEWER
========================================== */}

{showProfilePhoto && profilePhoto && (
  <div
    className="profile-photo-viewer"
    onClick={() => setShowProfilePhoto(false)}
  >

    <button
      className="profile-photo-viewer-close"
      onClick={() => setShowProfilePhoto(false)}
      aria-label="Close profile photo"
    >
      ×
    </button>

    <div
      className="profile-photo-viewer-content"
      onClick={(e) => e.stopPropagation()}
    >

      <img
        src={profilePhoto}
        alt="Profile"
        className="profile-photo-large"
      />

      <div className="profile-photo-viewer-name">
        {settingsName || "Workspace"}
      </div>

    </div>

  </div>
)}
     
      {/* ==========================================
          SECURITY MODAL
      ========================================== */}

      {showSecurityModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            !loading &&
            setShowSecurityModal(
              false
            )
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
                setShowSecurityModal(
                  false
                )
              }
            >
              ×
            </button>

            <p className="section-kicker">
              SECURITY
            </p>

            <h2>
              Account Security
            </h2>

            <p className="modal-subtitle">
              Enter a new password for your account.
            </p>

            <label className="modal-label">
              New Password
            </label>

            <input
              className="modal-input"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              minLength={6}
              disabled={loading}
              autoFocus
            />

            <label className="modal-label">
              Confirm Password
            </label>

            <input
              className="modal-input"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              minLength={6}
              disabled={loading}
            />

            <button
              className="modal-submit"
              onClick={saveSecurity}
              disabled={loading}
            >
              Update Password →
            </button>

          </div>

        </div>
      )}

    </>
    
  );
}

export default App;

