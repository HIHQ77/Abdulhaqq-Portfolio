/* ==========================================================================
   COS 106 Student Portfolio — script.js
   Sections:
     1. Mobile navigation toggle (all pages)
     2. Academic Planner logic (planner.html)
     3. Contact form validation (contact.html)
   ========================================================================== */

/* ---------------------------------------------------------------------
   1. MOBILE NAVIGATION TOGGLE
   -------------------------------------------------------------------- */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close the mobile menu when a link is chosen
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------------------------------------------------------------
   2. ACADEMIC PLANNER
   Tasks are kept in a plain JS array (in-memory only — no storage APIs
   are used, per browser-storage restrictions in this environment).
   -------------------------------------------------------------------- */
function initPlanner() {
  const form = document.querySelector('#task-form');
  if (!form) return; // Not on the planner page

  const titleInput = document.querySelector('#task-title');
  const courseInput = document.querySelector('#task-course');
  const priorityInput = document.querySelector('#task-priority');
  const listEl = document.querySelector('#task-list');
  const emptyState = document.querySelector('#empty-state');
  const countTotal = document.querySelector('#stat-total');
  const countDone = document.querySelector('#stat-done');
  const countPending = document.querySelector('#stat-pending');
  const filterButtons = document.querySelectorAll('.filter-btn');

  /** @type {{id: number, title: string, course: string, priority: string, completed: boolean}[]} */
  let tasks = [
    { id: 1, title: 'Finish Chapter 4 reading response', course: 'ENG-210', priority: 'medium', completed: false },
    { id: 2, title: 'Submit COS 106 portfolio project', course: 'COS-106', priority: 'high', completed: false },
    { id: 3, title: 'Review lecture notes for quiz', course: 'MATH-221', priority: 'low', completed: true },
  ];
  let nextId = 4;
  let activeFilter = 'all';

  function render() {
    const visible = tasks.filter((task) => {
      if (activeFilter === 'active') return !task.completed;
      if (activeFilter === 'completed') return task.completed;
      return true;
    });

    listEl.innerHTML = '';

    if (visible.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      visible.forEach((task) => listEl.appendChild(buildTaskEl(task)));
    }

    countTotal.textContent = String(tasks.length);
    countDone.textContent = String(tasks.filter((t) => t.completed).length);
    countPending.textContent = String(tasks.filter((t) => !t.completed).length);
  }

  function buildTaskEl(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = String(task.id);

    const check = document.createElement('button');
    check.className = 'task-check';
    check.type = 'button';
    check.setAttribute('aria-label', task.completed ? 'Mark task as not completed' : 'Mark task as completed');
    check.textContent = '✓';
    check.addEventListener('click', () => toggleTask(task.id));

    const main = document.createElement('div');
    main.className = 'task-main';

    const title = document.createElement('p');
    title.className = 'task-title';
    title.textContent = task.title;

    const meta = document.createElement('p');
    meta.className = 'task-meta';
    meta.textContent = task.course ? task.course : 'General';

    main.append(title, meta);

    const priority = document.createElement('span');
    priority.className = 'task-priority priority-' + task.priority;
    priority.textContent = task.priority;

    const del = document.createElement('button');
    del.className = 'task-delete';
    del.type = 'button';
    del.setAttribute('aria-label', 'Delete task: ' + task.title);
    del.innerHTML = '&times;';
    del.addEventListener('click', () => deleteTask(task.id));

    li.append(check, main, priority, del);
    return li;
  }

  function addTask(title, course, priority) {
    tasks.push({ id: nextId++, title, course, priority, completed: false });
    render();
  }

  function toggleTask(id) {
    tasks = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    render();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      return;
    }
    addTask(title, courseInput.value.trim(), priorityInput.value);
    form.reset();
    titleInput.focus();
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  render();
}

/* ---------------------------------------------------------------------
   3. CONTACT FORM VALIDATION
   Validates: no empty fields, valid email format, digits-only phone.
   Shows inline error messages and an on-screen success notice instead
   of using alert().
   -------------------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return; // Not on the contact page

  const fields = {
    name: document.querySelector('#field-name'),
    email: document.querySelector('#field-email'),
    phone: document.querySelector('#field-phone'),
    message: document.querySelector('#field-message'),
  };
  const status = document.querySelector('#form-status');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^[0-9]+$/;

  function setError(field, message) {
    const errorEl = document.querySelector('#error-' + field.id);
    field.classList.toggle('invalid', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  }

  function validateField(field) {
    const value = field.value.trim();

    if (!value) {
      setError(field, 'This field is required.');
      return false;
    }
    if (field.id === 'field-email' && !EMAIL_RE.test(value)) {
      setError(field, 'Enter a valid email address (e.g. name@example.com).');
      return false;
    }
    if (field.id === 'field-phone' && !PHONE_RE.test(value)) {
      setError(field, 'Phone number must contain digits only, no spaces or symbols.');
      return false;
    }
    setError(field, '');
    return true;
  }

  // Live validation as the user leaves each field
  Object.values(fields).forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) validateField(field);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const results = Object.values(fields).map(validateField);
    const allValid = results.every(Boolean);

    status.classList.remove('show', 'success', 'error');

    if (!allValid) {
      status.textContent = 'Please fix the highlighted fields before submitting.';
      status.classList.add('show', 'error');
      const firstInvalid = Object.values(fields).find((f) => f.classList.contains('invalid'));
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    status.textContent = 'Message sent! Thanks for reaching out — I\u2019ll reply within a couple of days.';
    status.classList.add('show', 'success');
    form.reset();
  });
}

/* ---------------------------------------------------------------------
   Init
   -------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initPlanner();
  initContactForm();
});
