// app.js

// Utility: Debounce
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Utility: Throttle
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-tasks');
const backToTopBtn = document.getElementById('back-to-top');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function renderTasks(filteredTasks = tasks) {
  taskList.innerHTML = '';
  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <span class="${task.completed ? 'task-completed' : ''}" data-index="${index}">${task.text}</span>
      <div>
        <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}" class="toggle-complete" />
        <button data-index="${index}" class="delete-task">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function addTask(e) {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text === '') return;
  tasks.push({ text, completed: false });
  taskInput.value = '';
  saveTasks();
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function searchTasks(e) {
  const keyword = e.target.value.toLowerCase();
  const filtered = tasks.filter(task => task.text.toLowerCase().includes(keyword));
  renderTasks(filtered);
}

function clearAllTasks() {
  tasks = [];
  saveTasks();
  renderTasks();
}

function handleTaskClick(e) {
  const index = e.target.dataset.index;
  if (e.target.classList.contains('toggle-complete')) toggleTask(index);
  else if (e.target.classList.contains('delete-task')) deleteTask(index);
}

function scrollFunction() {
  if (window.scrollY > 300) backToTopBtn.style.display = 'block';
  else backToTopBtn.style.display = 'none';
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Event Listeners
taskForm.addEventListener('submit', addTask);
taskList.addEventListener('click', handleTaskClick);
searchInput.addEventListener('input', debounce(searchTasks, 300));
clearBtn.addEventListener('click', clearAllTasks);
window.addEventListener('scroll', throttle(scrollFunction, 200));
backToTopBtn.addEventListener('click', backToTop);

// Initial render
renderTasks();
