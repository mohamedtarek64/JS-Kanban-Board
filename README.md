# 📋 Kanban Board - Project Management Tool

A modern, feature-rich Kanban board application built with vanilla JavaScript, HTML5, and CSS3. Perfect for managing tasks, tracking projects, and improving team productivity.

## 🌟 Features

### Core Functionality
- ✅ **Drag & Drop**: Seamlessly move tasks between columns
- ✅ **Task Management**: Create, edit, and delete tasks
- ✅ **Priority Levels**: Assign High, Medium, or Low priority to tasks
- ✅ **Due Dates**: Set deadlines and track overdue tasks
- ✅ **Search & Filter**: Find tasks instantly with real-time search
- ✅ **Multiple Views**: Filter by today's tasks, overdue, or high priority

### Advanced Features
- 🔄 **Undo/Redo**: Full history tracking with keyboard shortcuts
- 💾 **Auto-Save**: Automatic localStorage persistence
- 📊 **Statistics**: Real-time board analytics and completion rates
- 📤 **Export/Import**: Save and restore board data as JSON files
- 🌓 **Dark/Light Theme**: Switch between themes instantly
- ⌨️ **Keyboard Shortcuts**: Power user navigation support

### User Experience
- 📱 **Responsive Design**: Works beautifully on all screen sizes
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations
- 🔔 **Toast Notifications**: Real-time feedback for all actions
- 🎯 **Accessibility**: Semantic HTML and keyboard navigation

## 📁 Project Structure

```
JS-Kanban-Board/
├── index.html          # Main HTML file
├── style.css           # Styling & theme management
├── script.js           # Core application logic
├── README.md           # This file
├── icons/              # SVG Icons
│   ├── add.svg         # Add task icon
│   ├── edit.svg        # Edit icon
│   ├── delete.svg      # Delete icon
│   ├── undo.svg        # Undo icon
│   ├── redo.svg        # Redo icon
│   ├── stats.svg       # Statistics icon
│   ├── download.svg    # Export icon
│   ├── upload.svg      # Import icon
│   ├── search.svg      # Search icon
│   ├── calendar.svg    # Date picker icon
│   ├── alert.svg       # Alert/Warning icon
│   ├── check.svg       # Success/Checkmark icon
│   ├── close.svg       # Close/Delete icon
│   └── menu.svg        # Menu icon
└── assets/             # Additional resources (future use)
```

## 🚀 Getting Started

### Installation
1. Download or clone the repository
2. Open `index.html` in a modern web browser
3. Start creating and managing tasks!

### No Dependencies
This project uses only **vanilla JavaScript** - no frameworks or libraries required!

## 💡 Usage Guide

### Creating Tasks
1. Click the **+** button in any column
2. Enter task title and description
3. Set priority (Low/Medium/High)
4. Add a due date (optional)
5. Click "Add Task"

### Managing Tasks
- **Edit**: Click the pencil icon on any task
- **Delete**: Click the × button on any task
- **Move**: Drag tasks between columns
- **Search**: Use the search bar to filter all tasks

### Board Navigation
- **Filter Tabs**: Switch between All, Due Today, Overdue, and High Priority views
- **Statistics**: Click 📊 to see completion rates and metrics
- **Theme**: Switch between Dark and Light themes in the sidebar
- **Shortcut Help**: Click ⌨️ Shortcuts to view keyboard commands

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo last action |
| `Ctrl+Y` / `Cmd+Y` | Redo last action |
| `Ctrl+K` / `Cmd+K` | Focus search bar |
| `Esc` | Close modals |

## 💾 Data Management

### Auto-Save
All data is automatically saved to your browser's localStorage whenever you:
- Create a new task
- Edit an existing task
- Move tasks between columns
- Delete tasks

### Export Board
1. Click the **⬇** (Download) button
2. Your board will be downloaded as `kanban-board-YYYY-MM-DD.json`

### Import Board
1. Click the **⬆** (Upload) button
2. Select a previously exported JSON file
3. Your board will be restored instantly

## 🎨 Customization

### Change Theme Colors
Edit the CSS variables in `style.css`:
```css
:root {
    --primary: #00d4ff;           /* Main color */
    --secondary: #533483;         /* Secondary color */
    --background: #1a1a2e;        /* Background */
    --text-primary: #e0e0e0;      /* Text color */
    --success: #4caf50;           /* Success color */
    --warning: #ff9800;           /* Warning color */
    --danger: #f44336;            /* Danger/Error color */
}
```

### Add New Columns
Modify the `initializeDefaultColumns()` method in `script.js`:
```javascript
const defaultColumns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'testing', title: 'Testing' },
    { id: 'done', title: 'Done' }
];
```

## 📊 Features Detail

### Priority System
- 🔴 **High**: Critical tasks that need immediate attention
- 🟡 **Medium**: Important tasks with moderate urgency
- 🟢 **Low**: Nice-to-have tasks with low priority

### Statistics
The board tracks:
- Total number of tasks
- Completed tasks count
- Tasks in progress
- Overdue tasks
- High priority tasks
- Overall completion percentage

### Smart Filtering
- **All Tasks**: View everything
- **Due Today**: Only tasks due today
- **Overdue**: Tasks with expired deadlines
- **High Priority**: Only high priority items

## 🌐 Browser Support

- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Opera (Latest)

## 📝 Task Properties

Each task includes:
- **Title**: Task name (required)
- **Description**: Detailed task information
- **Priority**: Low, Medium, or High
- **Due Date**: Target completion date
- **Status**: Current column/state
- **Created**: Timestamp of creation

## 🔐 Data Privacy

- All data is stored **locally** in your browser
- No server uploads or cloud synchronization
- No tracking or analytics
- Complete control over your data

## 🚀 Future Enhancements

- [ ] Task categories/tags
- [ ] Team collaboration features
- [ ] File attachments
- [ ] Comments & activity timeline
- [ ] Analytics dashboard
- [ ] Mobile app version
- [ ] Database integration
- [ ] User authentication

## 🐛 Troubleshooting

### Data Not Saving
- Check if localStorage is enabled in your browser
- Clear browser cache and try again
- Ensure you're not in private/incognito mode

### Icons Not Showing
- Verify that the `icons/` folder exists
- Check browser console for 404 errors
- Ensure SVG files are in the correct location

### Drag & Drop Not Working
- Use a modern browser (Chrome, Firefox, Safari, Edge)
- Disable browser extensions that might interfere
- Clear cache and reload the page

## 📄 License

This project is open source and available for personal and commercial use.

## 👨‍💻 Development

### Built With
- **HTML5**: Semantic markup
- **CSS3**: Modern styling and animations
- **JavaScript ES6+**: Functional programming patterns
- **SVG**: Scalable vector icons

### Code Quality
- Vanilla JavaScript (no frameworks)
- Modular object-oriented design
- Responsive and accessible
- Clean, commented code

## 🤝 Contributing

Feel free to fork, modify, and improve this project for your needs!

## 📞 Support

For issues, suggestions, or improvements, feel free to reach out or create an issue.

---

**Made with ❤️ for productive task management**

Last Updated: February 2026
Version: 1.0.0
