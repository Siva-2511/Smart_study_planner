const ctxSubjects = document.getElementById('studyChart').getContext('2d');
const ctxPriority = document.getElementById('priorityChart').getContext('2d');
const ctxTrend = document.getElementById('trendChart').getContext('2d');

let studyChart, priorityChart, trendChart;

function updateChart() {
  // ---- Subjects Completed Tasks ----
  const allSubjects = [...new Set(tasks.map(t => t.subject))];
  const subjectCompleted = allSubjects.map(sub =>
    tasks.filter(t => t.subject === sub && t.completed).length
  );

  // ---- Priority Distribution ----
  const priorities = ["Low", "Medium", "High"];
  const priorityCounts = priorities.map(p =>
    tasks.filter(t => t.priority === p).length
  );

  const today = new Date();
  const days = [];
  const completedPerDay = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
  
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    const count = tasks.filter(t => t.completed && t.date === dateStr).length;


    completedPerDay.push(count);
  }

  if (studyChart) studyChart.destroy();
  if (priorityChart) priorityChart.destroy();
  if (trendChart) trendChart.destroy();

  // ---- Bar Chart: Completed Tasks per Subject ----
  studyChart = new Chart(ctxSubjects, {
    type: 'bar',
    data: {
      labels: allSubjects,
      datasets: [{
        label: 'Completed Tasks',
        data: subjectCompleted,
        backgroundColor: '#5a67d8'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.raw} tasks completed✅`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });

  // ---- Doughnut Chart: Priority Distribution ----
  priorityChart = new Chart(ctxPriority, {
    type: 'doughnut',
    data: {
      labels: priorities,
      datasets: [{
        label: 'Priority',
        data: priorityCounts,
        backgroundColor: ['#34d399', '#fbbf24', '#f87171']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.raw} tasks`
          }
        }
      }
    }
  });

  // ---- Line Chart: Weekly Completed Tasks ----
  trendChart = new Chart(ctxTrend, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Tasks Completed',
        data: completedPerDay,
        fill: true,
        backgroundColor: 'rgba(59,130,246,0.2)',
        borderColor: '#3b82f6',
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.raw} completed`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// ---- Initial Chart Load ----
document.addEventListener("DOMContentLoaded", () => {
    if (typeof renderTasks === "function") {
        renderTasks();
    }
});