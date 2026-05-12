const taskController = require('../../controllers/taskController');
const Task = require('../../models/Task');

jest.mock('../../models/Task');

// CRUD flow (controller perspective):
// - Create: validate input -> build Task -> save -> 201 + payload
// - Read: query by user -> return list or single task
// - Update: load task -> authorize -> validate -> mutate -> save
// - Delete: load task -> authorize -> delete
// Minimal Express-like response mock for controller unit tests.
const mockResponse = () => {
	const res = {};

	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);

	return res;
};

describe('taskController.createTask', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		console.error.mockRestore();
	});

	it('returns 400 when title is missing or too short', async () => {
		const req = { body: { title: 'ab' }, userId: 'user-id' };
		const res = mockResponse();

		await taskController.createTask(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: 'Title must be at least 3 characters' });
	});

	it('creates a task successfully', async () => {
		const req = {
			body: { title: 'Test Task', description: 'Desc', status: 'not-started', priority: 'medium' },
			userId: 'user-id',
		};
		const res = mockResponse();

		Task.mockImplementation((data) => ({
			...data,
			_id: 'task-id',
			save: jest.fn().mockResolvedValue(),
		}));

		await taskController.createTask(req, res);

		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith({
			message: 'Task created successfully',
			task: expect.objectContaining({
				title: 'Test Task',
				user: 'user-id',
			}),
		});
	});

	it('applies default fields when optional values are missing', async () => {
		const req = {
			body: { title: 'Default Task' },
			userId: 'user-id',
		};
		const res = mockResponse();

		Task.mockImplementation((data) => ({
			...data,
			save: jest.fn().mockResolvedValue(),
		}));

		await taskController.createTask(req, res);

		const createdTask = res.json.mock.calls[0][0].task;
		// Defaults come from controller when fields are omitted.
		expect(createdTask.status).toBe('not-started');
		expect(createdTask.priority).toBe('medium');
		expect(createdTask.description).toBe('');
		expect(createdTask.dueDate).toBeNull();
	});

	it('returns 500 when create task throws', async () => {
		const req = {
			body: { title: 'Test Task' },
			userId: 'user-id',
		};
		const res = mockResponse();

		Task.mockImplementation(() => ({
			save: jest.fn().mockRejectedValue(new Error('DB error')),
		}));

		await taskController.createTask(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			message: 'Server error',
			error: 'DB error',
		});
	});
});

describe('taskController.getTasks', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns tasks for the user', async () => {
		const req = { userId: 'user-id' };
		const res = mockResponse();

		// Simulate mongoose query chain: Task.find(...).sort(...)
		const tasks = [{ _id: 'task-1' }, { _id: 'task-2' }];
		Task.find.mockReturnValue({
			sort: jest.fn().mockResolvedValue(tasks),
		});

		await taskController.getTasks(req, res);

		expect(Task.find).toHaveBeenCalledWith({ user: 'user-id' });
		expect(res.json).toHaveBeenCalledWith({ tasks });
	});

	it('returns 500 when getTasks throws', async () => {
		const req = { userId: 'user-id' };
		const res = mockResponse();

		// Simulate query-level failure.
		Task.find.mockImplementation(() => {
			throw new Error('DB error');
		});

		await taskController.getTasks(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Server error', error: 'DB error' });
	});
});

describe('taskController.getTask', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns 404 when task is not found', async () => {
		const req = { params: { id: 'task-id' }, userId: 'user-id' };
		const res = mockResponse();

		Task.findById.mockResolvedValue(null);

		await taskController.getTask(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
	});

	it('returns 403 when user does not own the task', async () => {
		const req = { params: { id: 'task-id' }, userId: 'user-id' };
		const res = mockResponse();

		// Simulate task owned by someone else.
		Task.findById.mockResolvedValue({
			_id: 'task-id',
			user: { toString: () => 'other-user' },
		});

		await taskController.getTask(req, res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to access this task' });
	});

	it('returns the task when authorized', async () => {
		const req = { params: { id: 'task-id' }, userId: 'user-id' };
		const res = mockResponse();

		// Simulate task owned by the requester.
		const task = { _id: 'task-id', user: { toString: () => 'user-id' } };
		Task.findById.mockResolvedValue(task);

		await taskController.getTask(req, res);

		expect(res.json).toHaveBeenCalledWith({ task });
	});

	it('returns 500 when getTask throws', async () => {
		const req = { params: { id: 'task-id' }, userId: 'user-id' };
		const res = mockResponse();

		// Simulate data layer failure.
		Task.findById.mockRejectedValue(new Error('DB error'));

		await taskController.getTask(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Server error', error: 'DB error' });
	});
});

describe('taskController.updateTask', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns 404 when task is not found', async () => {
		const req = { params: { id: 'task-id' }, userId: 'user-id', body: {} };
		const res = mockResponse();

		Task.findById.mockResolvedValue(null);

		await taskController.updateTask(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
	});

	it('returns 403 when user does not own the task', async () => {
		const req = { params: { id: 'task-id' }, userId: 'user-id', body: {} };
		const res = mockResponse();

		// Simulate task owned by someone else.
		Task.findById.mockResolvedValue({
			_id: 'task-id',
			user: { toString: () => 'other-user' },
		});

		await taskController.updateTask(req, res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to update this task' });
	});

	it('returns 400 when title is too short', async () => {
		const req = { params: { id: 'task-id' }, userId: 'user-id', body: { title: 'ab' } };
		const res = mockResponse();

		// Simulate owned task with invalid new title.
		Task.findById.mockResolvedValue({
			_id: 'task-id',
			title: 'Old title',
			user: { toString: () => 'user-id' },
		});

		await taskController.updateTask(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: 'Title must be at least 3 characters' });
	});

	it('updates the task successfully', async () => {
		const req = {
			params: { id: 'task-id' },
			userId: 'user-id',
			body: { title: 'New Title', status: 'done' },
		};
		const res = mockResponse();

		// Simulate owned task for a successful update.
		const task = {
			_id: 'task-id',
			title: 'Old Title',
			status: 'not-started',
			user: { toString: () => 'user-id' },
			save: jest.fn().mockResolvedValue(),
		};
		Task.findById.mockResolvedValue(task);

		await taskController.updateTask(req, res);

		expect(task.title).toBe('New Title');
		expect(task.status).toBe('done');
		expect(res.json).toHaveBeenCalledWith({ message: 'Task updated successfully', task });
	});

	it('preserves fields when not provided', async () => {
		const req = {
			params: { id: 'task-id' },
			userId: 'user-id',
			body: { description: 'Updated desc' },
		};
		const res = mockResponse();

		// Only update description; keep other fields intact.
		const task = {
			_id: 'task-id',
			title: 'Existing Title',
			description: 'Old desc',
			status: 'not-started',
			priority: 'medium',
			dueDate: null,
			user: { toString: () => 'user-id' },
			save: jest.fn().mockResolvedValue(),
		};
		Task.findById.mockResolvedValue(task);

		await taskController.updateTask(req, res);

		expect(task.title).toBe('Existing Title');
		expect(task.description).toBe('Updated desc');
		expect(task.status).toBe('not-started');
		expect(res.json).toHaveBeenCalledWith({ message: 'Task updated successfully', task });
	});

	it('returns 500 when updateTask throws', async () => {
		const req = { params: { id: 'task-id' }, userId: 'user-id', body: {} };
		const res = mockResponse();

		// Simulate data layer failure.
		Task.findById.mockRejectedValue(new Error('DB error'));

		await taskController.updateTask(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Server error', error: 'DB error' });
	});
});

describe('taskController.deleteTask', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns 404 when task is not found', async () => {
		const req = { params: { id: 'task-id' }, userId: 'user-id' };
		const res = mockResponse();

		Task.findById.mockResolvedValue(null);

		await taskController.deleteTask(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
	});

	it('returns 403 when user does not own the task', async () => {
		const req = { params: { id: 'task-id' }, userId: 'user-id' };
		const res = mockResponse();

		// Simulate task owned by someone else.
		Task.findById.mockResolvedValue({
			_id: 'task-id',
			user: { toString: () => 'other-user' },
		});

		await taskController.deleteTask(req, res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to delete this task' });
	});

	it('deletes the task successfully', async () => {
		const req = { params: { id: 'task-id' }, userId: 'user-id' };
		const res = mockResponse();

		// Simulate owned task to allow deletion.
		Task.findById.mockResolvedValue({
			_id: 'task-id',
			user: { toString: () => 'user-id' },
		});
		Task.deleteOne.mockResolvedValue({ deletedCount: 1 });

		await taskController.deleteTask(req, res);

		expect(Task.deleteOne).toHaveBeenCalledWith({ _id: 'task-id' });
		expect(res.json).toHaveBeenCalledWith({ message: 'Task deleted successfully' });
	});

	it('returns 500 when deleteTask throws', async () => {
		const req = { params: { id: 'task-id' }, userId: 'user-id' };
		const res = mockResponse();

		// Simulate data layer failure.
		Task.findById.mockRejectedValue(new Error('DB error'));

		await taskController.deleteTask(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Server error', error: 'DB error' });
	});
});
