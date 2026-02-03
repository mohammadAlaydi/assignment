const UI = {
    // render logic goes here

    applyTheme(theme) {
        document.body.className = theme === 'dark' ? 'dark-mode' : '';
    },

    switchTab(tabId) {
        // highlight active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === tabId);
        });

        // hide or show sections
        document.querySelectorAll('section').forEach(sec => {
            sec.classList.toggle('hidden', sec.id !== tabId);
        });

        if (tabId === 'dashboard') this.renderDashboard();
        if (tabId === 'tasks') this.renderTasks();
        if (tabId === 'habits') this.renderHabits();
        if (tabId === 'resources') this.renderResources();
    },

    renderResources() {
        const list = document.getElementById('resources-list');
        if (!list) return;

        const search = document.getElementById('resource-search')?.value.toLowerCase() || '';
        const catFilter = document.getElementById('resource-filter')?.value || 'all';

        let data = AppState.resources;

        if (search) {
            data = data.filter(r => r.title.toLowerCase().includes(search) || r.description.toLowerCase().includes(search));
        }
        if (catFilter !== 'all') {
            data = data.filter(r => r.category === catFilter);
        }

        list.innerHTML = data.map(r => {
            const isFav = AppState.favorites.includes(r.id);
            return `
            <div class="resource-card">
                <button class="fav-btn ${isFav ? 'active' : ''}" onclick="app.toggleFavorite(${r.id})">
                   ${isFav ? '★' : '☆'}
                </button>
                <h3>${r.title}</h3>
                <div><span class="resource-cat">${r.category}</span></div>
                <p class="resource-desc">${r.description}</p>
                <a href="${r.link}" target="_blank" class="resource-link">Visit Resource</a>
            </div>`;
        }).join('');

        if (data.length === 0) list.innerHTML = '<p class="empty-state">No resources found.</p>';

        // populate filter if needed
        const categories = [...new Set(AppState.resources.map(r => r.category))];
        const resFilter = document.getElementById('resource-filter');
        if (resFilter && resFilter.children.length <= 1) {
            categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                resFilter.appendChild(opt);
            });
        }
    },

    renderHabits() {
        const list = document.getElementById('habits-list');
        if (!list) return;

        const habits = AppState.habits;
        // days from saturday to friday as requested
        const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

        list.innerHTML = habits.map(habit => {
            const completedDays = habit.progress.filter(Boolean).length;

            return `
            <div class="habit-card">
                <div class="habit-header">
                    <h3>${habit.title}</h3>
                    <button onclick="app.deleteHabit(${habit.id})" class="action-btn btn-delete" style="border:none;">×</button>
                </div>
                <div class="habit-week-grid">
                    ${habit.progress.map((done, idx) => `
                        <div class="day-check">
                            <span class="day-label">${days[idx]}</span>
                            <button 
                                class="check-btn ${done ? 'completed' : ''}" 
                                onclick="app.toggleHabit(${habit.id}, ${idx})">
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="habit-footer">
                   <span class="habit-progress-text">${completedDays} / ${habit.goal} days</span>
                </div>
            </div>`;
        }).join('');

        if (habits.length === 0) list.innerHTML = '<p class="empty-state">No habits started yet.</p>';
    },

    renderTasks(filters = {}) {
        const list = document.getElementById('task-list');
        if (!list) return;

        // defaults
        const statusFilter = filters.status || document.getElementById('filter-status').value || 'all';
        const catFilter = filters.category || document.getElementById('filter-category').value || 'all';
        const sortBy = filters.sort || document.getElementById('sort-by').value || 'date';

        let tasks = [...AppState.tasks];

        // filter
        if (statusFilter !== 'all') {
            tasks = tasks.filter(t => statusFilter === 'completed' ? t.completed : !t.completed);
        }
        if (catFilter !== 'all') {
            tasks = tasks.filter(t => t.category === catFilter);
        }

        // sort
        tasks.sort((a, b) => {
            if (sortBy === 'date') return new Date(a.dueDate) - new Date(b.dueDate);
            if (sortBy === 'priority') {
                const map = { High: 0, Medium: 1, Low: 2 };
                return map[a.priority] - map[b.priority];
            }
            return 0;
        });

        // render
        list.innerHTML = tasks.map(task => `
            <div class="task-card priority-${task.priority} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-header">
                    <h3>${task.title}</h3>
                    ${task.category ? `<span class="task-category">${task.category}</span>` : ''}
                </div>
                <div class="task-meta">
                    <span>📅 ${task.dueDate}</span>
                    <span>⚡ ${task.priority}</span>
                </div>
                ${task.description ? `<p class="task-desc">${task.description}</p>` : ''}
                <div class="task-actions">
                    <button class="action-btn btn-check" onclick="app.toggleTask(${task.id})">
                        ${task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="action-btn" onclick="app.editTask(${task.id})">Edit</button>
                    <button class="action-btn btn-delete" onclick="app.deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `).join('');

        if (tasks.length === 0) list.innerHTML = '<p class="empty-state">No tasks found.</p>';

        // populate category filter if needed
        const categories = [...new Set(AppState.tasks.map(t => t.category).filter(Boolean))];
        const catSelect = document.getElementById('filter-category');
        if (catSelect && catSelect.children.length <= 1) { // only 'All' exists
            categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                catSelect.appendChild(opt);
            });
        }
    },

    renderDashboard() {
        const stats = AppState.getDashboardStats();
        const todayTasks = AppState.getTasksDueSoon();
        const dashContainer = document.querySelector('#dashboard .grid-container');

        if (!dashContainer) return;

        // stats html
        const statsHTML = `
            <div class="card stat-card">
              <h3>Target</h3>
              <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${stats.progress}%"></div>
              </div>
              <p>${stats.progress}% Done</p>
            </div>
            <div class="card stat-card">
              <h3>Due Soon</h3>
              <div class="big-number">${stats.tasksDueSoon}</div>
            </div>
            <div class="card stat-card">
              <h3>Completed</h3>
              <div class="big-number">${stats.tasksCompleted}</div>
            </div>
            <div class="card stat-card">
              <h3>Habit Wins</h3>
              <div class="big-number">${stats.habitStreak}</div>
            </div>
        `;

        // tasks html
        let taskListHTML = '<div class="dashboard-section" style="grid-column: 1 / -1;"><h2>🚀 Priority Focus</h2>';
        if (todayTasks.length === 0) {
            taskListHTML += '<p class="empty-state">No urgent tasks!</p>';
        } else {
            todayTasks.forEach(task => {
                taskListHTML += `
                    <div class="task-preview-item priority-${task.priority}">
                        <div class="task-info">
                            <h4>${task.title}</h4>
                            <small>Due: ${task.dueDate}</small>
                        </div>
                    </div>
                `;
            });
        }
        taskListHTML += '</div>';

        dashContainer.innerHTML = statsHTML + taskListHTML;
    }
};
