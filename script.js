// ====== Variables ======
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const taskList = document.getElementById("tasks");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const suggestionText = document.getElementById("suggestion-text");
const pointsText = document.getElementById("points-text");
const greetingText = document.getElementById("greeting");

const tabs = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

const subjectSelect = document.getElementById("task-subject");
const customInput = document.getElementById("custom-subject");

// ====== Greeting ======
function updateGreeting() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good Morning!" : hour < 18 ? "Good Afternoon!" : "Good Evening!";
  greetingText.innerText = `Smart Study Planner — ${greet}`;
}
updateGreeting();

// ====== Theme Toggle ======
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const icon = document.querySelector("#theme-toggle i");
  icon.classList.toggle("fa-moon");
  icon.classList.toggle("fa-sun");
});

// ====== Tabs ======
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    contents.forEach(c => c.classList.remove("active"));
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// ====== Subject "Other" ======
subjectSelect.addEventListener("change", () => {
  customInput.style.display = subjectSelect.value === "Other" ? "inline-block" : "none";
});

// ====== Add Task ======
document.getElementById("add-task").addEventListener("click", () => {
  const title = document.getElementById("task-title").value.trim();
  const date = document.getElementById("task-date").value;
  const priority = document.getElementById("task-priority").value;
  let subject = subjectSelect.value === "Other" ? customInput.value.trim() : subjectSelect.value;

  if (!title || !date || !subject) return alert("Task, Date, and Subject are required!");
  if (subjectSelect.value === "Other" && !customInput.value.trim()) return alert("Please enter a custom subject name.");

  tasks.push({ title, date, subject, priority, completed: false });

  document.getElementById("task-title").value = "";
  if (subjectSelect.value === "Other") customInput.value = "";

  renderTasks();
});

// ====== Render Tasks ======
function renderTasks() {
  taskList.innerHTML = "";
  tasks.sort((a, b) => new Date(a.date) - new Date(b.date));

  const today = new Date();
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task ${task.completed ? "completed" : ""}`;
    const taskDate = new Date(task.date);
    const diffDays = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) li.classList.add("near");
    else if (diffDays <= 3) li.classList.add("medium");
    else li.classList.add("fresh");

    li.innerHTML = `
      <span> <strong>${task.title}</strong> | ${task.subject} | ${task.priority} | Due: ${task.date}</span>
      <div>
        <button onclick="toggleTask(${index})"><i class="fas fa-check"></i></button>
        <button onclick="deleteTask(${index})"><i class="fas fa-trash"></i></button>
      </div>
    `;
    taskList.appendChild(li);

    if (!task.completed && diffDays === 0) {
      setTimeout(() => alert(` Reminder: Task "${task.title}" is due today!`), 500);
    }
  });

  updateProgress();
  updatePoints();
  updateCalendar();
  updateChart();
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ====== Toggle Task ======
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
  updateChart();
}

// ====== Delete Task ======
function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
}

// ====== Progress & Suggestions ======
function updateProgress() {
  const completedCount = tasks.filter(t => t.completed).length;
  const percent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  progressBar.value = percent;
  progressText.innerText = `${percent}% completed`;

  generateSuggestion();
}

function generateSuggestion() {
  if (tasks.length === 0) {
    suggestionText.innerText = " Add some tasks to get study tips!";
    return;
  }

  const subjects = [...new Set(tasks.map(t => t.subject))];
  let subjectData = subjects.map(sub => {
    const subTasks = tasks.filter(t => t.subject === sub);
    const completed = subTasks.filter(t => t.completed).length;
    return { subject: sub, total: subTasks.length, done: completed };
  });

  const weakest = subjectData.reduce((a, b) => {
    const aRatio = a.total ? a.done / a.total : 1;
    const bRatio = b.total ? b.done / b.total : 1;
    return aRatio < bRatio ? a : b;
  });

  let suggestion = "";
  if (weakest.total === 0) suggestion = " All subjects are balanced. Keep adding tasks!";
  else if (weakest.done / weakest.total < 0.5)
    suggestion = `Focus more on ${weakest.subject}. Completion: ${weakest.done}/${weakest.total}`;
  else suggestion = " You're doing well! Keep up the consistency.";

  suggestionText.innerText = suggestion;
}

// ====== Points & Level ======
function updatePoints() {
  const points = tasks.filter(t => t.completed).length * 10;
  const level = Math.floor(points / 50) + 1;
  pointsText.innerHTML = `${points} points | Level ${level} 🎓`;
}

// ====== Search & Filter ======
document.getElementById("search-task").addEventListener("input", filterTasks);
document.getElementById("filter-subject").addEventListener("change", filterTasks);
document.getElementById("filter-priority").addEventListener("change", filterTasks);

function filterTasks() {
  const search = document.getElementById("search-task").value.toLowerCase();
  const subject = document.getElementById("filter-subject").value;
  const priority = document.getElementById("filter-priority").value;

  document.querySelectorAll("#tasks .task").forEach((task, index) => {
    const t = tasks[index];
    let visible = t.title.toLowerCase().includes(search);
    if (subject !== "All") visible = visible && t.subject === subject;
    if (priority !== "All") visible = visible && t.priority === priority;
    task.style.display = visible ? "flex" : "none";
  });
}

// ====== Mini Calendar ======
const calendarGrid = document.getElementById("calendar-grid");

function updateCalendar() {
  calendarGrid.innerHTML = "";
  const today = new Date();
  const startDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  for (let i = 0; i < startDay; i++) {
    const emptyDiv = document.createElement("div");
    calendarGrid.appendChild(emptyDiv);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "calendar-day";
    dayDiv.innerText = day;

    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (tasks.some(t => t.date === dateStr)) dayDiv.classList.add("has-task");

    calendarGrid.appendChild(dayDiv);
  }
}