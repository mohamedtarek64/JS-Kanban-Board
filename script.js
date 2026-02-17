// Kanban Board - Enhanced Version with improved UI/UX
class KanbanBoard {
    constructor() {
        this.columns = [];
        this.tasks = {};
        this.history = [];
        this.historyIndex = -1;
        this.selectedColumnId = null;
        this.filterText = '';
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.isDarkTheme = true;
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.loadThemePreference();
        
        if (this.columns.length === 0) {
            this.initializeDefaultColumns();
        }
        
        this.render();
        this.attachEventListeners();
        this.saveHistory();
        this.updateBoardStats();
    }

    initializeDefaultColumns() {
        const defaultColumns = [
            { id: 'todo', title: 'To Do' },
            { id: 'inprogress', title: 'In Progress' },
            { id: 'review', title: 'Review' },
            { id: 'done', title: 'Done' }
        ];

        this.columns = defaultColumns;
        defaultColumns.forEach(col => {
            this.tasks[col.id] = [];
        });

        this.saveToLocalStorage();
    }

    render() {
        const board = document.querySelector('.board');
        board.innerHTML = '';

        this.columns.forEach(column => {
            const columnEl = this.createColumnElement(column);
            board.appendChild(columnEl);
        });

        this.attachDragDropListeners();
        this.updateUndoRedoButtons();
    }

    createColumnElement(column) {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';
        columnDiv.dataset.columnId = column.id;

        const headerDiv = document.createElement('div');
        headerDiv.className = 'column-header';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'column-title';
        titleDiv.textContent = column.title;

        const countDiv = document.createElement('div');
        countDiv.className = 'task-count';
        countDiv.textContent = this.tasks[column.id].length;

        const addBtn = document.createElement('button');
        addBtn.className = 'add-task-btn';
        addBtn.textContent = '+';
        addBtn.title = `Add task to ${column.title}`;
        addBtn.addEventListener('click', () => this.openTaskModal(column.id));

        headerDiv.appendChild(titleDiv);
        headerDiv.appendChild(countDiv);
        headerDiv.appendChild(addBtn);

        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'tasks-container';
        tasksContainer.dataset.columnId = column.id;

        const columnTasks = this.tasks[column.id];
        const filteredTasks = columnTasks.filter(task => this.matchesFilter(task));

        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            if (columnTasks.length === 0) {
                emptyState.innerHTML = '📭<br/>No tasks yet<br/><small>Click + to add one</small>';
            } else {
                emptyState.textContent = 'No matching tasks';
            }
            tasksContainer.appendChild(emptyState);
        } else {
            filteredTasks.forEach(task => {
                const taskEl = this.createTaskElement(task, column.id);
                tasksContainer.appendChild(taskEl);
            });
        }

        columnDiv.appendChild(headerDiv);
        columnDiv.appendChild(tasksContainer);

        return columnDiv;
    }

    createTaskElement(task, columnId) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.classList.add(`priority-${task.priority || 'low'}`);
        taskCard.draggable = true;
        taskCard.dataset.taskId = task.id;
        taskCard.dataset.columnId = columnId;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'task-title';
        titleDiv.textContent = task.title;

        const descDiv = document.createElement('div');
        descDiv.className = 'task-description';
        descDiv.textContent = task.description;

        contentDiv.appendChild(titleDiv);
        contentDiv.appendChild(descDiv);

        // Add task metadata
        const metaDiv = document.createElement('div');
        metaDiv.className = 'task-meta';

        const priorityBadge = document.createElement('span');
        priorityBadge.className = `priority-badge ${task.priority || 'low'}`;
        priorityBadge.textContent = (task.priority || 'low').charAt(0).toUpperCase() + (task.priority || 'low').slice(1);
        metaDiv.appendChild(priorityBadge);

        if (task.dueDate) {
            const dueDateEl = document.createElement('span');
            dueDateEl.className = 'due-date';
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            const isOverdue = dueDate < today && columnId !== 'done';
            if (isOverdue) {
                dueDateEl.classList.add('overdue');
            }
            dueDateEl.textContent = '📅 ' + this.formatDate(dueDate);
            metaDiv.appendChild(dueDateEl);
        }

        contentDiv.appendChild(metaDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'task-edit';
        editBtn.textContent = '✎';
        editBtn.title = 'Edit task';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openTaskModal(columnId, task);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Delete task';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(task.id, columnId);
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        taskCard.appendChild(contentDiv);
        taskCard.appendChild(actionsDiv);

        return taskCard;
    }

    attachDragDropListeners() {
        const taskCards = document.querySelectorAll('.task-card');
        const tasksContainers = document.querySelectorAll('.tasks-container');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', (e) => this.handleDragStart(e));
            card.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        tasksContainers.forEach(container => {
            container.addEventListener('dragover', (e) => this.handleDragOver(e));
            container.addEventListener('drop', (e) => this.handleDrop(e));
            container.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }

    handleDragStart(e) {
        const taskCard = e.target.closest('.task-card');
        taskCard.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('taskId', taskCard.dataset.taskId);
        e.dataTransfer.setData('sourceColumnId', taskCard.dataset.columnId);
    }

    handleDragEnd(e) {
        document.querySelectorAll('.task-card').forEach(card => {
            card.classList.remove('dragging');
        });
        document.querySelectorAll('.column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const container = e.target.closest('.tasks-container');
        if (container) {
            const column = container.closest('.column');
            column.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const container = e.target.closest('.tasks-container');
        if (container) {
            const column = container.closest('.column');
            column.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const container = e.target.closest('.tasks-container');
        
        if (!container) return;

        const targetColumnId = container.dataset.columnId;
        const taskId = e.dataTransfer.getData('taskId');
        const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

        this.moveTask(taskId, sourceColumnId, targetColumnId);
        this.saveHistory();
        this.render();
        this.showToast(`Task moved to ${this.getColumnTitle(targetColumnId)}`, 'success');
    }

    moveTask(taskId, sourceColumnId, targetColumnId) {
        const sourceIndex = this.tasks[sourceColumnId].findIndex(task => task.id === taskId);
        
        if (sourceIndex === -1) return;

        const task = this.tasks[sourceColumnId].splice(sourceIndex, 1)[0];
        this.tasks[targetColumnId].push(task);
        
        this.saveToLocalStorage();
    }

    getColumnTitle(columnId) {
        const column = this.columns.find(col => col.id === columnId);
        return column ? column.title : 'Column';
    }

    openTaskModal(columnId, task = null) {
        this.selectedColumnId = columnId;
        this.editingTaskId = task ? task.id : null;
        
        const isEditing = !!task;
        let modal = document.querySelector('.modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h2 class="modal-title">${isEditing ? '✏️ Edit Task' : '➕ Add New Task'}</h2>
                    <form id="taskForm">
                        <div class="form-group">
                            <label for="taskTitle">Task Title</label>
                            <input type="text" id="taskTitle" placeholder="Enter task title" required>
                        </div>
                        <div class="form-group">
                            <label for="taskDescription">Description</label>
                            <textarea id="taskDescription" placeholder="Enter task description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="taskPriority">Priority</label>
                            <select id="taskPriority">
                                <option value="low">🟢 Low</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="high">🔴 High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="taskDueDate">Due Date</label>
                            <input type="date" id="taskDueDate">
                        </div>
                        <div class="form-buttons">
                            <button type="submit" class="btn btn-primary">${isEditing ? 'Update Task' : 'Add Task'}</button>
                            <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            const titleEl = modal.querySelector('.modal-title');
            const submitBtn = modal.querySelector('.btn-primary');
            titleEl.innerHTML = isEditing ? '✏️ Edit Task' : '➕ Add New Task';
            submitBtn.textContent = isEditing ? 'Update Task' : 'Add Task';
        }

        modal.classList.add('active');

        const form = document.getElementById('taskForm');
        const titleInput = document.getElementById('taskTitle');
        const descriptionInput = document.getElementById('taskDescription');
        const priorityInput = document.getElementById('taskPriority');
        const dueDateInput = document.getElementById('taskDueDate');
        const cancelBtn = document.getElementById('cancelBtn');

        // Populate with existing task data if editing
        if (task) {
            titleInput.value = task.title;
            descriptionInput.value = task.description;
            priorityInput.value = task.priority || 'low';
            dueDateInput.value = task.dueDate ? task.dueDate.split('T')[0] : '';
        } else {
            titleInput.value = '';
            descriptionInput.value = '';
            priorityInput.value = 'low';
            dueDateInput.value = '';
        }

        titleInput.focus();

        const handleSubmit = (e) => {
            e.preventDefault();
            const title = titleInput.value.trim();
            const description = descriptionInput.value.trim();
            const priority = priorityInput.value;
            const dueDate = dueDateInput.value;

            if (title) {
                if (isEditing) {
                    this.updateTask(task.id, columnId, title, description, priority, dueDate);
                } else {
                    this.addTask(columnId, title, description, priority, dueDate);
                }
                modal.classList.remove('active');
                form.removeEventListener('submit', handleSubmit);
                cancelBtn.removeEventListener('click', handleCancel);
            }
        };

        const handleCancel = () => {
            modal.classList.remove('active');
            form.removeEventListener('submit', handleSubmit);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        form.removeEventListener('submit', handleSubmit);
        form.addEventListener('submit', handleSubmit);
        cancelBtn.removeEventListener('click', handleCancel);
        cancelBtn.addEventListener('click', handleCancel);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                form.removeEventListener('submit', handleSubmit);
                cancelBtn.removeEventListener('click', handleCancel);
            }
        });
    }

    addTask(columnId, title, description, priority = 'low', dueDate = '') {
        const task = {
            id: 'task_' + Date.now(),
            title: title,
            description: description,
            priority: priority,
            dueDate: dueDate,
            createdAt: new Date().toISOString()
        };

        this.tasks[columnId].push(task);
        this.saveToLocalStorage();
        this.saveHistory();
        this.render();
        this.updateBoardStats();
        this.showToast(`✅ Task "${title}" created!`, 'success');
    }

    updateTask(taskId, columnId, title, description, priority, dueDate) {
        const task = this.tasks[columnId].find(t => t.id === taskId);
        if (task) {
            task.title = title;
            task.description = description;
            task.priority = priority;
            task.dueDate = dueDate;
            this.saveToLocalStorage();
            this.saveHistory();
            this.render();
            this.updateBoardStats();
            this.showToast(`✏️ Task updated!`, 'success');
        }
    }

    deleteTask(taskId, columnId) {
        const index = this.tasks[columnId].findIndex(task => task.id === taskId);
        if (index !== -1) {
            const taskTitle = this.tasks[columnId][index].title;
            this.tasks[columnId].splice(index, 1);
            this.saveToLocalStorage();
            this.saveHistory();
            this.render();
            this.updateBoardStats();
            this.showToast(`🗑️ Task deleted`, 'info');
        }
    }

    matchesFilter(task) {
        // Search filter
        if (this.filterText) {
            const search = this.filterText.toLowerCase();
            if (!task.title.toLowerCase().includes(search) && 
                !task.description.toLowerCase().includes(search)) {
                return false;
            }
        }

        // View filter
        switch (this.currentFilter) {
            case 'today':
                if (!task.dueDate) return false;
                const today = new Date();
                const dueDate = new Date(task.dueDate);
                return dueDate.toDateString() === today.toDateString();
            
            case 'overdue':
                if (!task.dueDate) return false;
                return new Date(task.dueDate) < new Date();
            
            case 'high-priority':
                return task.priority === 'high';
            
            default:
                return true;
        }
    }

    // History / Undo-Redo
    saveHistory() {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(JSON.stringify({
            columns: this.columns,
            tasks: this.tasks
        }));
        this.historyIndex = this.history.length - 1;
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = JSON.parse(this.history[this.historyIndex]);
            this.columns = state.columns;
            this.tasks = state.tasks;
            this.saveToLocalStorage();
            this.render();
            this.updateBoardStats();
            this.showToast('↶ Undo', 'info');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = JSON.parse(this.history[this.historyIndex]);
            this.columns = state.columns;
            this.tasks = state.tasks;
            this.saveToLocalStorage();
            this.render();
            this.updateBoardStats();
            this.showToast('↷ Redo', 'info');
        }
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn && redoBtn) {
            undoBtn.disabled = this.historyIndex <= 0;
            redoBtn.disabled = this.historyIndex >= this.history.length - 1;
        }
    }

    // Export / Import
    exportBoard() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            columns: this.columns,
            tasks: this.tasks
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('✅ Board exported!', 'success');
    }

    importBoard(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.columns = data.columns;
                this.tasks = data.tasks;
                this.saveToLocalStorage();
                this.historyIndex = -1;
                this.history = [];
                this.saveHistory();
                this.render();
                this.updateBoardStats();
                this.showToast('✅ Board imported successfully!', 'success');
            } catch (err) {
                this.showToast('❌ Error importing board: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    // Statistics
    showStatistics() {
        const stats = this.calculateStats();
        
        let modal = document.querySelector('.stats-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal stats-modal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content">
                <h2 class="modal-title">📊 Board Statistics</h2>
                <div class="stats-container">
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalTasks}</div>
                        <div class="stat-label">Total Tasks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.completedTasks}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.inProgress}</div>
                        <div class="stat-label">In Progress</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.overdueTasks}</div>
                        <div class="stat-label">Overdue</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.highPriority}</div>
                        <div class="stat-label">High Priority</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.completionRate}%</div>
                        <div class="stat-label">Completion Rate</div>
                    </div>
                </div>
                <div class="form-buttons">
                    <button class="btn btn-secondary" onclick="document.querySelector('.stats-modal').classList.remove('active')">Close</button>
                </div>
            </div>
        `;

        modal.classList.add('active');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    calculateStats() {
        let totalTasks = 0;
        let completedTasks = 0;
        let inProgress = 0;
        let overdueTasks = 0;
        let highPriority = 0;
        const today = new Date();

        Object.entries(this.tasks).forEach(([columnId, columnTasks]) => {
            columnTasks.forEach(task => {
                totalTasks++;

                if (columnId === 'done') {
                    completedTasks++;
                } else if (columnId === 'inprogress') {
                    inProgress++;
                }

                if (task.priority === 'high') {
                    highPriority++;
                }

                if (task.dueDate && columnId !== 'done') {
                    const dueDate = new Date(task.dueDate);
                    if (dueDate < today) {
                        overdueTasks++;
                    }
                }
            });
        });

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            totalTasks,
            completedTasks,
            inProgress,
            overdueTasks,
            highPriority,
            completionRate
        };
    }

    updateBoardStats() {
        const stats = this.calculateStats();
        const statsEl = document.getElementById('boardStats');
        if (statsEl) {
            statsEl.textContent = `${stats.completedTasks}/${stats.totalTasks} tasks completed • ${stats.overdueTasks} overdue`;
        }
    }

    formatDate(date) {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    saveToLocalStorage() {
        const data = {
            columns: this.columns,
            tasks: this.tasks,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('kanbanBoard', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('kanbanBoard');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.columns = data.columns || [];
                this.tasks = data.tasks || {};
            } catch (e) {
                console.error('Error loading from localStorage:', e);
                this.columns = [];
                this.tasks = {};
            }
        }
    }

    // Theme Management
    loadThemePreference() {
        const saved = localStorage.getItem('kanbanTheme');
        this.isDarkTheme = saved ? JSON.parse(saved) : true;
        this.applyTheme();
    }

    toggleTheme(isDark) {
        this.isDarkTheme = isDark;
        localStorage.setItem('kanbanTheme', JSON.stringify(isDark));
        this.applyTheme();
        this.updateThemeButtons();
    }

    applyTheme() {
        const html = document.documentElement;
        if (this.isDarkTheme) {
            html.classList.remove('light-theme');
        } else {
            html.classList.add('light-theme');
        }
    }

    updateThemeButtons() {
        const darkBtn = document.getElementById('themeDarkBtn');
        const lightBtn = document.getElementById('themeLightBtn');
        
        if (darkBtn && lightBtn) {
            if (this.isDarkTheme) {
                darkBtn.style.opacity = '1';
                lightBtn.style.opacity = '0.5';
            } else {
                darkBtn.style.opacity = '0.5';
                lightBtn.style.opacity = '1';
            }
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Keyboard Shortcuts
    showKeyboardShortcuts() {
        let modal = document.querySelector('.shortcuts-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal shortcuts-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h2 class="modal-title">⌨️ Keyboard Shortcuts</h2>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <div style="margin-bottom: 15px;">
                            <strong>Global Shortcuts:</strong>
                            <div style="font-size: 0.9rem; margin-top: 8px;">
                                <p>🖱️ <kbd>Ctrl+Z</kbd> / <kbd>Cmd+Z</kbd> - Undo</p>
                                <p>🖱️ <kbd>Ctrl+Y</kbd> / <kbd>Cmd+Y</kbd> - Redo</p>
                                <p>🖱️ <kbd>Esc</kbd> - Close modals</p>
                                <p>🖱️ <kbd>Ctrl+K</kbd> / <kbd>Cmd+K</kbd> - Focus search</p>
                            </div>
                        </div>
                        <div>
                            <strong>Features:</strong>
                            <div style="font-size: 0.9rem; margin-top: 8px;">
                                <p>📋 Drag & drop tasks to move between columns</p>
                                <p>➕ Click + button to add new task</p>
                                <p>✏️ Click pencil icon to edit task</p>
                                <p>🗑️ Click × button to delete task</p>
                                <p>🔍 Search to filter tasks instantly</p>
                            </div>
                        </div>
                    </div>
                    <div class="form-buttons">
                        <button class="btn btn-secondary" onclick="document.querySelector('.shortcuts-modal').classList.remove('active')">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        modal.classList.add('active');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    attachEventListeners() {
        // Search functionality with quick create
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.filterText = e.target.value;
            this.render();
        });

        // Undo/Redo buttons
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        undoBtn.addEventListener('click', () => this.undo());
        redoBtn.addEventListener('click', () => this.redo());

        // Statistics button
        const statsBtn = document.getElementById('statsBtn');
        statsBtn.addEventListener('click', () => this.showStatistics());

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.addEventListener('click', () => this.exportBoard());

        // Import button
        const importBtn = document.getElementById('importBtn');
        let importInput = document.getElementById('importInput');
        if (!importInput) {
            importInput = document.createElement('input');
            importInput.id = 'importInput';
            importInput.type = 'file';
            importInput.accept = '.json';
            importInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.importBoard(e.target.files[0]);
                    e.target.value = '';
                }
            });
            document.body.appendChild(importInput);
        }
        importBtn.addEventListener('click', () => importInput.click());

        // Filter tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                filterTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.view;
                this.render();
            });
        });

        // Sidebar navigation
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Theme buttons
        const themeDarkBtn = document.getElementById('themeDarkBtn');
        const themeLightBtn = document.getElementById('themeLightBtn');
        if (themeDarkBtn) themeDarkBtn.addEventListener('click', () => this.toggleTheme(true));
        if (themeLightBtn) themeLightBtn.addEventListener('click', () => this.toggleTheme(false));
        this.updateThemeButtons();

        // Help buttons
        const shortcutsBtn = document.getElementById('shortcutsBtn');
        if (shortcutsBtn) shortcutsBtn.addEventListener('click', () => this.showKeyboardShortcuts());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal.active');
                if (modal) {
                    modal.classList.remove('active');
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undo();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                this.redo();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KanbanBoard();
});
class KanbanBoard {
    constructor() {
        this.columns = [];
        this.tasks = {};
        this.history = [];
        this.historyIndex = -1;
        this.selectedColumnId = null;
        this.filterText = '';
        this.editingTaskId = null;
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        
        if (this.columns.length === 0) {
            this.initializeDefaultColumns();
        }
        
        this.render();
        this.attachEventListeners();
        this.saveHistory();
    }

    initializeDefaultColumns() {
        const defaultColumns = [
            { id: 'todo', title: 'To Do' },
            { id: 'inprogress', title: 'In Progress' },
            { id: 'review', title: 'Review' },
            { id: 'done', title: 'Done' }
        ];

        this.columns = defaultColumns;
        defaultColumns.forEach(col => {
            this.tasks[col.id] = [];
        });

        this.saveToLocalStorage();
    }

    render() {
        const board = document.querySelector('.board');
        board.innerHTML = '';

        this.columns.forEach(column => {
            const columnEl = this.createColumnElement(column);
            board.appendChild(columnEl);
        });

        this.attachDragDropListeners();
        this.updateUndoRedoButtons();
    }

    createColumnElement(column) {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';
        columnDiv.dataset.columnId = column.id;

        const headerDiv = document.createElement('div');
        headerDiv.className = 'column-header';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'column-title';
        titleDiv.textContent = column.title;

        const countDiv = document.createElement('div');
        countDiv.className = 'task-count';
        countDiv.textContent = this.tasks[column.id].length;

        const addBtn = document.createElement('button');
        addBtn.className = 'add-task-btn';
        addBtn.textContent = '+';
        addBtn.addEventListener('click', () => this.openTaskModal(column.id));

        headerDiv.appendChild(titleDiv);
        headerDiv.appendChild(countDiv);
        headerDiv.appendChild(addBtn);

        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'tasks-container';
        tasksContainer.dataset.columnId = column.id;

        const columnTasks = this.tasks[column.id];
        const filteredTasks = columnTasks.filter(task => this.matchesFilter(task));

        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = columnTasks.length === 0 ? 'No tasks yet' : 'No matching tasks';
            tasksContainer.appendChild(emptyState);
        } else {
            filteredTasks.forEach(task => {
                const taskEl = this.createTaskElement(task, column.id);
                tasksContainer.appendChild(taskEl);
            });
        }

        columnDiv.appendChild(headerDiv);
        columnDiv.appendChild(tasksContainer);

        return columnDiv;
    }

    createTaskElement(task, columnId) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.classList.add(`priority-${task.priority || 'low'}`);
        taskCard.draggable = true;
        taskCard.dataset.taskId = task.id;
        taskCard.dataset.columnId = columnId;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'task-title';
        titleDiv.textContent = task.title;

        const descDiv = document.createElement('div');
        descDiv.className = 'task-description';
        descDiv.textContent = task.description;

        contentDiv.appendChild(titleDiv);
        contentDiv.appendChild(descDiv);

        // Add task metadata
        const metaDiv = document.createElement('div');
        metaDiv.className = 'task-meta';

        const priorityBadge = document.createElement('span');
        priorityBadge.className = `priority-badge ${task.priority || 'low'}`;
        priorityBadge.textContent = (task.priority || 'low').charAt(0).toUpperCase() + (task.priority || 'low').slice(1);
        metaDiv.appendChild(priorityBadge);

        if (task.dueDate) {
            const dueDateEl = document.createElement('span');
            dueDateEl.className = 'due-date';
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            const isOverdue = dueDate < today && columnId !== 'done';
            if (isOverdue) {
                dueDateEl.classList.add('overdue');
            }
            dueDateEl.textContent = '📅 ' + this.formatDate(dueDate);
            metaDiv.appendChild(dueDateEl);
        }

        contentDiv.appendChild(metaDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'task-edit';
        editBtn.textContent = '✎';
        editBtn.title = 'Edit task';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openTaskModal(columnId, task);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Delete task';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(task.id, columnId);
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        taskCard.appendChild(contentDiv);
        taskCard.appendChild(actionsDiv);

        return taskCard;
    }

    attachDragDropListeners() {
        const taskCards = document.querySelectorAll('.task-card');
        const tasksContainers = document.querySelectorAll('.tasks-container');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', (e) => this.handleDragStart(e));
            card.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        tasksContainers.forEach(container => {
            container.addEventListener('dragover', (e) => this.handleDragOver(e));
            container.addEventListener('drop', (e) => this.handleDrop(e));
            container.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }

    handleDragStart(e) {
        const taskCard = e.target.closest('.task-card');
        taskCard.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('taskId', taskCard.dataset.taskId);
        e.dataTransfer.setData('sourceColumnId', taskCard.dataset.columnId);
    }

    handleDragEnd(e) {
        document.querySelectorAll('.task-card').forEach(card => {
            card.classList.remove('dragging');
        });
        document.querySelectorAll('.column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const container = e.target.closest('.tasks-container');
        if (container) {
            const column = container.closest('.column');
            column.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const container = e.target.closest('.tasks-container');
        if (container) {
            const column = container.closest('.column');
            column.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const container = e.target.closest('.tasks-container');
        
        if (!container) return;

        const targetColumnId = container.dataset.columnId;
        const taskId = e.dataTransfer.getData('taskId');
        const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

        this.moveTask(taskId, sourceColumnId, targetColumnId);
        this.saveHistory();
        this.render();
    }

    moveTask(taskId, sourceColumnId, targetColumnId) {
        const sourceIndex = this.tasks[sourceColumnId].findIndex(task => task.id === taskId);
        
        if (sourceIndex === -1) return;

        const task = this.tasks[sourceColumnId].splice(sourceIndex, 1)[0];
        this.tasks[targetColumnId].push(task);
        
        this.saveToLocalStorage();
    }

    openTaskModal(columnId, task = null) {
        this.selectedColumnId = columnId;
        this.editingTaskId = task ? task.id : null;
        
        const isEditing = !!task;
        let modal = document.querySelector('.modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h2 class="modal-title">${isEditing ? 'Edit Task' : 'Add New Task'}</h2>
                    <form id="taskForm">
                        <div class="form-group">
                            <label for="taskTitle">Task Title</label>
                            <input type="text" id="taskTitle" placeholder="Enter task title" required>
                        </div>
                        <div class="form-group">
                            <label for="taskDescription">Description</label>
                            <textarea id="taskDescription" placeholder="Enter task description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="taskPriority">Priority</label>
                            <select id="taskPriority">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="taskDueDate">Due Date</label>
                            <input type="date" id="taskDueDate">
                        </div>
                        <div class="form-buttons">
                            <button type="submit" class="btn btn-primary">${isEditing ? 'Update Task' : 'Add Task'}</button>
                            <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            const titleEl = modal.querySelector('.modal-title');
            const submitBtn = modal.querySelector('.btn-primary');
            titleEl.textContent = isEditing ? 'Edit Task' : 'Add New Task';
            submitBtn.textContent = isEditing ? 'Update Task' : 'Add Task';
        }

        modal.classList.add('active');

        const form = document.getElementById('taskForm');
        const titleInput = document.getElementById('taskTitle');
        const descriptionInput = document.getElementById('taskDescription');
        const priorityInput = document.getElementById('taskPriority');
        const dueDateInput = document.getElementById('taskDueDate');
        const cancelBtn = document.getElementById('cancelBtn');

        // Populate with existing task data if editing
        if (task) {
            titleInput.value = task.title;
            descriptionInput.value = task.description;
            priorityInput.value = task.priority || 'low';
            dueDateInput.value = task.dueDate ? task.dueDate.split('T')[0] : '';
        } else {
            titleInput.value = '';
            descriptionInput.value = '';
            priorityInput.value = 'low';
            dueDateInput.value = '';
        }

        titleInput.focus();

        const handleSubmit = (e) => {
            e.preventDefault();
            const title = titleInput.value.trim();
            const description = descriptionInput.value.trim();
            const priority = priorityInput.value;
            const dueDate = dueDateInput.value;

            if (title) {
                if (isEditing) {
                    this.updateTask(task.id, columnId, title, description, priority, dueDate);
                } else {
                    this.addTask(columnId, title, description, priority, dueDate);
                }
                modal.classList.remove('active');
                form.removeEventListener('submit', handleSubmit);
                cancelBtn.removeEventListener('click', handleCancel);
            }
        };

        const handleCancel = () => {
            modal.classList.remove('active');
            form.removeEventListener('submit', handleSubmit);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        form.removeEventListener('submit', handleSubmit);
        form.addEventListener('submit', handleSubmit);
        cancelBtn.removeEventListener('click', handleCancel);
        cancelBtn.addEventListener('click', handleCancel);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                form.removeEventListener('submit', handleSubmit);
                cancelBtn.removeEventListener('click', handleCancel);
            }
        });
    }

    addTask(columnId, title, description, priority = 'low', dueDate = '') {
        const task = {
            id: 'task_' + Date.now(),
            title: title,
            description: description,
            priority: priority,
            dueDate: dueDate,
            createdAt: new Date().toISOString()
        };

        this.tasks[columnId].push(task);
        this.saveToLocalStorage();
        this.saveHistory();
        this.render();
    }

    updateTask(taskId, columnId, title, description, priority, dueDate) {
        const task = this.tasks[columnId].find(t => t.id === taskId);
        if (task) {
            task.title = title;
            task.description = description;
            task.priority = priority;
            task.dueDate = dueDate;
            this.saveToLocalStorage();
            this.saveHistory();
            this.render();
        }
    }

    deleteTask(taskId, columnId) {
        const index = this.tasks[columnId].findIndex(task => task.id === taskId);
        if (index !== -1) {
            this.tasks[columnId].splice(index, 1);
            this.saveToLocalStorage();
            this.saveHistory();
            this.render();
        }
    }

    matchesFilter(task) {
        if (!this.filterText) return true;
        const search = this.filterText.toLowerCase();
        return task.title.toLowerCase().includes(search) || 
               task.description.toLowerCase().includes(search);
    }

    // History / Undo-Redo
    saveHistory() {
        // Remove any future history if we're not at the end
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Save current state
        this.history.push(JSON.stringify({
            columns: this.columns,
            tasks: this.tasks
        }));
        
        this.historyIndex = this.history.length - 1;
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = JSON.parse(this.history[this.historyIndex]);
            this.columns = state.columns;
            this.tasks = state.tasks;
            this.saveToLocalStorage();
            this.render();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = JSON.parse(this.history[this.historyIndex]);
            this.columns = state.columns;
            this.tasks = state.tasks;
            this.saveToLocalStorage();
            this.render();
        }
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        undoBtn.disabled = this.historyIndex <= 0;
        redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }

    // Export / Import
    exportBoard() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            columns: this.columns,
            tasks: this.tasks
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importBoard(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.columns = data.columns;
                this.tasks = data.tasks;
                this.saveToLocalStorage();
                this.historyIndex = -1;
                this.history = [];
                this.saveHistory();
                this.render();
                alert('Board imported successfully!');
            } catch (err) {
                alert('Error importing board: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    // Statistics
    showStatistics() {
        const stats = this.calculateStats();
        
        let modal = document.querySelector('.stats-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal stats-modal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content">
                <h2 class="modal-title">📊 Board Statistics</h2>
                <div class="stats-container">
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalTasks}</div>
                        <div class="stat-label">Total Tasks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.completedTasks}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.inProgress}</div>
                        <div class="stat-label">In Progress</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.overdueTasks}</div>
                        <div class="stat-label">Overdue</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.highPriority}</div>
                        <div class="stat-label">High Priority</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.completionRate}%</div>
                        <div class="stat-label">Completion Rate</div>
                    </div>
                </div>
                <div class="form-buttons">
                    <button class="btn btn-secondary" onclick="document.querySelector('.stats-modal').classList.remove('active')">Close</button>
                </div>
            </div>
        `;

        modal.classList.add('active');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    calculateStats() {
        let totalTasks = 0;
        let completedTasks = 0;
        let inProgress = 0;
        let overdueTasks = 0;
        let highPriority = 0;
        const today = new Date();

        Object.entries(this.tasks).forEach(([columnId, columnTasks]) => {
            columnTasks.forEach(task => {
                totalTasks++;

                if (columnId === 'done') {
                    completedTasks++;
                } else if (columnId === 'inprogress') {
                    inProgress++;
                }

                if (task.priority === 'high') {
                    highPriority++;
                }

                if (task.dueDate && columnId !== 'done') {
                    const dueDate = new Date(task.dueDate);
                    if (dueDate < today) {
                        overdueTasks++;
                    }
                }
            });
        });

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            totalTasks,
            completedTasks,
            inProgress,
            overdueTasks,
            highPriority,
            completionRate
        };
    }

    formatDate(date) {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    saveToLocalStorage() {
        const data = {
            columns: this.columns,
            tasks: this.tasks,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('kanbanBoard', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('kanbanBoard');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.columns = data.columns || [];
                this.tasks = data.tasks || {};
            } catch (e) {
                console.error('Error loading from localStorage:', e);
                this.columns = [];
                this.tasks = {};
            }
        }
    }

    attachEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.filterText = e.target.value;
            this.render();
        });

        // Undo/Redo buttons
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        undoBtn.addEventListener('click', () => this.undo());
        redoBtn.addEventListener('click', () => this.redo());

        // Statistics button
        const statsBtn = document.getElementById('statsBtn');
        statsBtn.addEventListener('click', () => this.showStatistics());

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.addEventListener('click', () => this.exportBoard());

        // Import button
        const importBtn = document.getElementById('importBtn');
        let importInput = document.getElementById('importInput');
        if (!importInput) {
            importInput = document.createElement('input');
            importInput.id = 'importInput';
            importInput.type = 'file';
            importInput.accept = '.json';
            importInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.importBoard(e.target.files[0]);
                    e.target.value = '';
                }
            });
            document.body.appendChild(importInput);
        }
        importBtn.addEventListener('click', () => importInput.click());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal.active');
                if (modal) {
                    modal.classList.remove('active');
                }
            }
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    this.undo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    this.redo();
                }
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KanbanBoard();
});
