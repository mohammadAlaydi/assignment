const AppState = {
    tasks: [],
    habits: [],
    resources: [], // Metadata for resources
    favorites: [], // IDs of favorite resources
    settings: {
        theme: 'light'
    },

    init() {
        // Load from LS or use defaults
        this.tasks = Storage.get('tasks', []);
        this.habits = Storage.get('habits', []);
        this.favorites = Storage.get('favorites', []);
        this.settings = Storage.get('settings', { theme: 'light' });
    },

    save() {
        Storage.set('tasks', this.tasks);
        Storage.set('habits', this.habits);
        Storage.set('favorites', this.favorites);
        Storage.set('settings', this.settings);
    },

    async loadResources() {
        try {
            const res = await fetch('./resources.json');
            this.resources = await res.json();
            return this.resources;
        } catch (e) {
            console.error('Failed to load resources', e);
            return [];
        }
    },

    toggleFavorite(id) {
        if (this.favorites.includes(id)) {
            this.favorites = this.favorites.filter(fav => fav !== id);
        } else {
            this.favorites.push(id);
        }
        this.save();
    },

    // Task methods
    addTask(task) {
        task.id = Date.now();
        task.completed = false;
        this.tasks.push(task);
        this.save();
    },

    updateTask(id, updates) {
        const idx = this.tasks.findIndex(t => t.id == id);
        if (idx !== -1) {
            this.tasks[idx] = { ...this.tasks[idx], ...updates };
            this.save();
        }
    },

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id != id);
            this.save();
        }
    },

    // Habit methods
    addHabit(habit) {
        habit.id = Date.now();
        // Initialize progress for 7 days (0-6)
        habit.progress = Array(7).fill(false);
        this.habits.push(habit);
        this.save();
    },

    toggleHabit(id, dayIndex) {
        const habit = this.habits.find(h => h.id == id);
        if (habit) {
            habit.progress[dayIndex] = !habit.progress[dayIndex];
            this.save();
        }
    },

    deleteHabit(id) {
        if (confirm('Delete this habit?')) {
            this.habits = this.habits.filter(h => h.id != id);
            this.save();
        }
    },

    getDashboardStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

        // Simple habit streak: Count total "true" in all habit progress arrays
        let weeklyHabits = 0;
        this.habits.forEach(h => {
            if (h.progress && Array.isArray(h.progress)) {
                weeklyHabits += h.progress.filter(p => p).length;
            }
        });

        return {
            tasksDueSoon: this.getTasksDueSoon().length,
            tasksCompleted: completed,
            habitStreak: weeklyHabits,
            progress: progress
        };
    },

    getTasksDueSoon() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const limit = new Date(today);
        limit.setDate(limit.getDate() + 2); // Today + 2 days

        return this.tasks.filter(t => {
            if (t.completed) return false;
            // Handle string dates (input type="date" is YYYY-MM-DD)
            const d = new Date(t.dueDate);
            d.setHours(0, 0, 0, 0);
            return d >= today && d <= limit;
        });
    }
};
