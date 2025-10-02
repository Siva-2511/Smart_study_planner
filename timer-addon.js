/* timer-addon.js — Countdown badges + time input support */
(function () {
    function parseDueFromLi(li) {
      if (!li) return null;
      const text = li.innerText || li.textContent || "";
      const m = text.match(/Due:\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?/);
      if (!m) return null;
      return { date: m[1], time: m[2] || "23:59" };
    }
  
    function formatMs(ms) {
      if (ms <= 0) return "0s";
      const s = Math.floor(ms / 1000);
      const days = Math.floor(s / 86400);
      const hours = Math.floor((s % 86400) / 3600);
      const minutes = Math.floor((s % 3600) / 60);
      const seconds = s % 60;
      if (days > 0) return `${days}d ${hours}h ${minutes}m`;
      if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
      if (minutes > 0) return `${minutes}m ${seconds}s`;
      return `${seconds}s`;
    }
  
    function ensureCountdownEl(li) {
      let el = li.querySelector(".countdown");
      if (!el) {
        el = document.createElement("span");
        el.className = "countdown countdown-left";
        const meta = li.querySelector(".task-meta, .task-title, .task-left") || li;
        meta.insertBefore(el, meta.firstChild);
      }
      return el;
    }
  
    function updateLiTimer(li) {
      const due = parseDueFromLi(li);
      if (!due) return;
      const el = ensureCountdownEl(li);
      const [y, m, d] = due.date.split("-").map(Number);
      const [hh, mm] = due.time.split(":").map(Number);
      const deadline = new Date(y, m - 1, d, hh, mm, 0);
      const now = new Date();
      const diff = deadline - now;
  
      el.title = `Due: ${due.date} ${due.time}`;
  
      if (li.classList.contains("completed")) {
        el.textContent = "✅ Done";
        el.classList.remove("overdue");
        return;
      }
  
      if (diff <= 0) {
        el.textContent = "⏰ Overdue";
        el.classList.add("overdue");
      }
      else {
        el.classList.remove("overdue");
        el.textContent = formatMs(diff) + " left";
      }
    }
  
    function updateAll() {
      const list = document.querySelectorAll("#tasks .task");
      if (!list || list.length === 0) return;
      list.forEach(li => {
        try {
          updateLiTimer(li);
        } catch (err) {
          console.error("timer-addon error for li:", err);
        }
      });
    }
  
    function createTaskFromTimeInput() {
      const timeInput = document.getElementById("task-time");
      const dateInput = document.getElementById("task-date");
      const titleInput = document.getElementById("task-title");
  
      if (!timeInput || !timeInput.value || !dateInput || !dateInput.value) return;
  
      const [hh, mm] = timeInput.value.split(":").map(Number);
      const [y, m, d] = dateInput.value.split("-").map(Number);
      const deadline = new Date(y, m - 1, d, hh, mm, 0);
      const dateStr = deadline.toISOString().slice(0, 10);
      const timeStr = timeInput.value;
      const title = titleInput?.value.trim() || "New Task";
  
      const li = document.createElement("li");
      li.className = "task";
      li.innerHTML = `
  <span class="task-title">${title}</span>
  <span class="task-meta">Due: ${dateStr} ${timeStr}</span>
  `;
      document.querySelector("#tasks").appendChild(li);
      updateLiTimer(li);
    }
  
    document.addEventListener("DOMContentLoaded", function () {
        // Initial timer update after page load
        setTimeout(updateAll, 300);
      
        // Start auto-refreshing countdowns every second
        if (!window._smartPlannerTimerAddon) {
          window._smartPlannerTimerAddon = setInterval(updateAll, 1000);
        }
      
        //  Add Task button click triggers task creation
        const addBtn = document.getElementById("add-task");
        if (addBtn) {
          addBtn.addEventListener("click", createTaskFromTimeInput);
        }
      
        const timeInput = document.getElementById("task-time");
        if (timeInput) {
          timeInput.addEventListener("change", createTaskFromTimeInput);
        }
      });
      
  })();
  