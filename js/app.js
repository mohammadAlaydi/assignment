document.addEventListener('DOMContentLoaded', () => {
    // boot up
    AppState.init();
    UI.applyTheme(AppState.settings.theme);

    // default view
    UI.switchTab('dashboard');

    // nav handling
    document.querySelector('.nav-links').addEventListener('click', (e) => {
        if (e.target.matches('.nav-btn')) {
            e.preventDefault();
            const target = e.target.dataset.target;
            UI.switchTab(target);
        }
    });

    // task section logic

    // toggle form
    const formBtn = document.getElementById('show-task-form-btn');
    const cancelBtn = document.getElementById('cancel-task-btn');
    const formContainer = document.getElementById('task-form-container');
    const taskForm = document.getElementById('task-form');

    if (formBtn) {
        formBtn.addEventListener('click', () => {
            formContainer.classList.remove('hidden');
            taskForm.reset();
            document.getElementById('task-id').value = '';
            formBtn.classList.add('hidden');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            formContainer.classList.add('hidden');
            formBtn.classList.remove('hidden');
        });
    }

    // add or edit task
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const id = document.getElementById('task-id').value;
            const title = document.getElementById('task-title').value;
            const userDate = document.getElementById('task-date').value;
            const priority = document.getElementById('task-priority').value;
            const category = document.getElementById('task-category').value;
            const desc = document.getElementById('task-desc').value;

            if (!title || !userDate) {
                alert('Title and Date are required');
                return;
            }

            const taskData = { title, dueDate: userDate, priority, category, description: desc };

            if (id) {
                AppState.updateTask(id, taskData);
            } else {
                AppState.addTask(taskData);
            }

            formContainer.classList.add('hidden');
            formBtn.classList.remove('hidden');
            taskForm.reset();
            UI.renderTasks();
        });
    }

    // filters
    ['filter-status', 'filter-category', 'sort-by'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => UI.renderTasks());
    });

    // habits section logic
    const habitFormBtn = document.getElementById('show-habit-form-btn');
    const cancelHabitBtn = document.getElementById('cancel-habit-btn');
    const habitFormContainer = document.getElementById('habit-form-container');
    const habitForm = document.getElementById('habit-form');

    if (habitFormBtn) {
        habitFormBtn.addEventListener('click', () => {
            habitFormContainer.classList.remove('hidden');
            habitFormBtn.classList.add('hidden');
        });
    }

    if (cancelHabitBtn) {
        cancelHabitBtn.addEventListener('click', () => {
            habitFormContainer.classList.add('hidden');
            habitFormBtn.classList.remove('hidden');
        });
    }

    if (habitForm) {
        habitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('habit-title').value;
            const goal = document.getElementById('habit-goal').value;

            if (title && goal) {
                AppState.addHabit({ title, goal: parseInt(goal) });
                habitForm.reset();
                habitFormContainer.classList.add('hidden');
                habitFormBtn.classList.remove('hidden');
                UI.renderHabits();
            }
        });
    }
});

// global app handlers for inline onclicks
window.app = {
    toggleTask(id) {
        const task = AppState.tasks.find(t => t.id == id);
        if (task) {
            AppState.updateTask(id, { completed: !task.completed });
            UI.renderTasks();
        }
    },
    deleteTask(id) {
        AppState.deleteTask(id); // handles confirm internally
        UI.renderTasks();
    },
    editTask(id) {
        const task = AppState.tasks.find(t => t.id == id);
        if (task) {
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-date').value = task.dueDate;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-category').value = task.category || '';
            document.getElementById('task-desc').value = task.description || '';

            document.getElementById('task-form-container').classList.remove('hidden');
            document.getElementById('show-task-form-btn').classList.add('hidden');
            // check if section visible, otherwise switch tab?
            // usually we are already on the tab.
            UI.switchTab('tasks');
            const tasksSection = document.getElementById('tasks');
            if (tasksSection) window.scrollTo(0, tasksSection.offsetTop);
        }
    },
    toggleHabit(id, dayIndex) {
        AppState.toggleHabit(id, dayIndex);
        UI.renderHabits();
    },
    deleteHabit(id) {
        AppState.deleteHabit(id);
        UI.renderHabits();
    },
    toggleFavorite(id) {
        AppState.toggleFavorite(id);
        UI.renderResources();
    }
};

// initialize resources logic
document.addEventListener('DOMContentLoaded', async () => {
    await AppState.loadResources();

    // resource filters
    const searchInput = document.getElementById('resource-search');
    const catFilter = document.getElementById('resource-filter');

    if (searchInput) searchInput.addEventListener('input', () => UI.renderResources());
    if (catFilter) catFilter.addEventListener('change', () => UI.renderResources());

    // settings logic
    const themeBtn = document.getElementById('theme-toggle');
    const resetBtn = document.getElementById('reset-data-btn');

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = AppState.settings.theme;
            const next = current === 'light' ? 'dark' : 'light';
            AppState.settings.theme = next;
            AppState.save();
            UI.applyTheme(next);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('WARNING: This will delete ALL your tasks, habits, and favorites. Continue?')) {
                Storage.clear();
                location.reload();
            }
        });
    }
});
