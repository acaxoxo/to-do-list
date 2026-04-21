const Task = require('../models/Task');

// Create task
exports.createTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;
        
        if (!title || title.trim().length < 3) {
            return res.status(400).json({ message: 'Title must be at least 3 characters' });
        }
        
        const task = new Task({
            title,
            description: description || '',
            status: status || 'not-started',
            priority: priority || 'medium',
            dueDate: dueDate || null,
            user: req.userId,
        });
        
        await task.save();
        res.status(201).json({ message: 'Task created successfully', task });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all tasks for user
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json({ tasks });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get single task
exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        // Check if user owns the task
        if (task.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to access this task' });
        }
        
        res.json({ task });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        // Check if user owns the task
        if (task.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }
        
        const { title, description, status, priority, dueDate } = req.body;
        
        if (title && title.trim().length < 3) {
            return res.status(400).json({ message: 'Title must be at least 3 characters' });
        }
        
        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.dueDate = dueDate || task.dueDate;
        
        await task.save();
        res.json({ message: 'Task updated successfully', task });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        // Check if user owns the task
        if (task.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this task' });
        }
        
        await Task.deleteOne({ _id: req.params.id });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
