const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
    },
    description: {
        type: String,
        default: '',
        maxlength: 500,
    },
    status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    dueDate: {
        type: Date,
        default: null,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update updatedAt sebelum save
taskSchema.pre('save', function() {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Task', taskSchema);
