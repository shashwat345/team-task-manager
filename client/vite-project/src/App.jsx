import { useEffect, useState } from "react";

export default function App() {
  // ===== AUTH =====
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  // ===== DATA =====
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);

  // ===== MODALS =====
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // ===== FORM =====
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("low");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teamName, setTeamName] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) setIsLoggedIn(true);
  }, []);

  // ===== API =====
  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      fetchTasks();
    } else alert("Login Failed");
  };

  const handleSignup = async () => {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      fetchTasks();
    } else alert("Signup Failed");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const fetchTasks = async () => {
    const res = await fetch("http://localhost:5000/api/task/all", {
      headers: { Authorization: token }
    });
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
  };

  const createTask = async () => {
    await fetch("http://localhost:5000/api/task/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        title,
        dueDate,
        priority,
        team: selectedTeam
      })
    });
    setShowTaskModal(false);
    setTitle("");
    setDueDate("");
    setPriority("low");
    setSelectedTeam("");
    fetchTasks();
  };

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/task/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ status })
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/api/task/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    fetchTasks();
  };

  const assignTeam = async (id, team) => {
    await fetch(`http://localhost:5000/api/task/assign-team/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ team })
    });
    fetchTasks();
  };

  // ===== TEAM (local for UI) =====
  const createTeam = () => {
    if (!teamName.trim()) return alert("Enter team name");
    setTeams((prev) => [...prev, { id: Date.now(), name: teamName }]);
    setTeamName("");
    setShowTeamModal(false);
  };

  // ===== ANALYTICS =====
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === "pending").length;
  const inProgress = tasks.filter(t => t.status === "in-progress").length;
  const done = tasks.filter(t => t.status === "done").length;

  // ===== UI HELPERS =====
  const priorityStyle = (p) => ({
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    marginLeft: "8px",
    background: p === "low" ? "#ff9ecb" : p === "medium" ? "#FFD54F" : "#ff4d4d",
    color: "#000"
  });

  const renderColumn = (status) => (
    <div style={column}>
      <h3 style={{ textAlign: "center", letterSpacing: 1 }}>
        {status.toUpperCase()}
      </h3>

      {tasks
        .filter(t => t.status === status)
        .map(task => {
          const overdue = new Date(task.dueDate) < new Date();
          return (
            <div key={task._id} style={card}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {task.title}
              </div>

              <div style={{ marginBottom: 8 }}>
                <span style={priorityStyle(task.priority)}>
                  {task.priority}
                </span>

                {overdue && (
                  <span style={{ color: "#ff4d4d", marginLeft: 8, fontSize: 12 }}>
                    ⚠ Overdue
                  </span>
                )}

                {task.team && (
                  <span style={{ marginLeft: 8, fontSize: 12 }}>
                    👥 {task.team}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: 8 }}>
                <button style={{ ...miniBtn, background: "#ff9800" }}
                  onClick={() => updateStatus(task._id, "pending")}>P</button>

                <button style={{ ...miniBtn, background: "#2196F3" }}
                  onClick={() => updateStatus(task._id, "in-progress")}>IP</button>

                <button style={{ ...miniBtn, background: "#4CAF50" }}
                  onClick={() => updateStatus(task._id, "done")}>D</button>

                <button style={{ ...miniBtn, background: "#f44336" }}
                  onClick={() => deleteTask(task._id)}>❌</button>
              </div>

              <select
                style={select}
                onChange={(e) => assignTeam(task._id, e.target.value)}
              >
                <option>Assign Team</option>
                {teams.map(t => (
                  <option key={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          );
        })}
    </div>
  );

  // ===== LOGIN UI =====
  if (!isLoggedIn) {
    return (
      <div style={pageCenter}>
        <div style={authBox}>
          <h2 style={{ marginBottom: 10 }}>Welcome</h2>

          <div style={fieldRow}>
            <span style={icon}>📧</span>
            <input style={input} placeholder="Email"
              onChange={e => setEmail(e.target.value)} />
          </div>

          <div style={fieldRow}>
            <span style={icon}>🔒</span>
            <input style={input} type="password" placeholder="Password"
              onChange={e => setPassword(e.target.value)} />
          </div>

          <div style={{ marginTop: 12 }}>
            <button style={primaryBtn} onClick={handleLogin}>Login</button>
            <button style={secondaryBtn} onClick={() => setShowSignup(true)}>Signup</button>
          </div>

          {showSignup && (
            <div style={overlay}>
              <div style={modal}>
                <h3 style={{ marginBottom: 8 }}>Create Account</h3>
                <input style={input} placeholder="Name"
                  onChange={e => setName(e.target.value)} />
                <input style={input} placeholder="Email"
                  onChange={e => setEmail(e.target.value)} />
                <input style={input} type="password" placeholder="Password"
                  onChange={e => setPassword(e.target.value)} />

                <div style={{ marginTop: 10 }}>
                  <button style={primaryBtn} onClick={handleSignup}>Create</button>
                  <button style={secondaryBtn} onClick={() => setShowSignup(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== DASHBOARD =====
  return (
    <div style={app}>
      <div style={headerRow}>
        <h1 style={{ margin: 0 }}>Team Task Manager 🚀</h1>
        <button style={logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={analyticsBox}>
        <div>Total: {total}</div>
        <div style={{ color: "#ff9800" }}>Pending: {pending}</div>
        <div style={{ color: "#2196F3" }}>In-Progress: {inProgress}</div>
        <div style={{ color: "#4CAF50" }}>Done: {done}</div>
      </div>

      <div style={actionRow}>
        <button style={purpleBtn} onClick={() => setShowTeamModal(true)}>
          Create Team 👥
        </button>
        <button style={greenBtn} onClick={() => setShowTaskModal(true)}>
          Create Task ➕
        </button>
        <button style={greyBtn} onClick={fetchTasks}>
          Load Tasks
        </button>
      </div>

      {/* TEAM MODAL */}
      {showTeamModal && (
        <div style={overlay}>
          <div style={modal}>
            <h3>Create Team</h3>
            <input style={input} placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)} />
            <div style={{ marginTop: 10 }}>
              <button style={primaryBtn} onClick={createTeam}>Create</button>
              <button style={secondaryBtn} onClick={() => setShowTeamModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* TASK MODAL */}
      {showTaskModal && (
        <div style={overlay}>
          <div style={modal}>
            <h3>Create Task</h3>

            <input style={input} placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)} />

            <input style={input} type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)} />

            <select style={input}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select style={input}
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}>
              <option value="">Select Team</option>
              {teams.map(t => <option key={t.id}>{t.name}</option>)}
            </select>

            <div style={{ marginTop: 10 }}>
              <button style={primaryBtn} onClick={createTask}>Create</button>
              <button style={secondaryBtn} onClick={() => setShowTaskModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* BOARD */}
      <div style={board}>
        {renderColumn("pending")}
        {renderColumn("in-progress")}
        {renderColumn("done")}
      </div>
    </div>
  );
}

// ===== STYLES =====
const app = {
  minHeight: "100vh",
  background: "linear-gradient(120deg, #0f1220, #1b1f3a)",
  color: "#fff",
  padding: "20px"
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px"
};

const analyticsBox = {
  display: "flex",
  justifyContent: "space-around",
  background: "#1e1e2f",
  padding: "12px",
  borderRadius: "10px",
  margin: "10px 0 20px"
};

const actionRow = {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  marginBottom: "20px"
};

const board = {
  display: "flex",
  gap: "10px"
};

const column = {
  flex: 1,
  padding: "10px"
};

const card = {
  background: "#1e1e2f",
  padding: "14px",
  borderRadius: "12px",
  marginBottom: "12px",
  border: "1px solid #333",
  boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
};

const miniBtn = {
  padding: "4px 8px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  marginRight: "6px",
  color: "#fff",
  fontSize: "12px"
};

const select = {
  width: "100%",
  padding: "6px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#121428",
  color: "#fff"
};

const primaryBtn = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  background: "#4CAF50",
  color: "#fff",
  marginRight: "8px"
};

const secondaryBtn = {
  ...primaryBtn,
  background: "#555"
};

const purpleBtn = {
  ...primaryBtn,
  background: "#7c4dff"
};

const greenBtn = {
  ...primaryBtn,
  background: "#4CAF50"
};

const greyBtn = {
  ...primaryBtn,
  background: "#555"
};

const logoutBtn = {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  background: "#e53935",
  color: "#fff",
  cursor: "pointer"
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10
};

const modal = {
  background: "#1e1e2f",
  padding: "20px",
  borderRadius: "12px",
  width: "320px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  border: "1px solid #333"
};

const input = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#121428",
  color: "#fff"
};

const pageCenter = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(120deg, #0f1220, #1b1f3a)",
  color: "#fff"
};

const authBox = {
  background: "#1e1e2f",
  padding: "24px",
  borderRadius: "12px",
  width: "320px",
  border: "1px solid #333",
  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  textAlign: "center"
};

const fieldRow = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "8px"
};

const icon = { fontSize: "16px" };