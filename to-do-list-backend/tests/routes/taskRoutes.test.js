const express = require('express');
const request = require('supertest');

// Mock controllers to verify route wiring only.
jest.mock('../../controllers/taskController', () => ({
	createTask: jest.fn((req, res) => res.status(200).json({ route: 'createTask' })),
	getTasks: jest.fn((req, res) => res.status(200).json({ route: 'getTasks' })),
	getTask: jest.fn((req, res) => res.status(200).json({ route: 'getTask' })),
	updateTask: jest.fn((req, res) => res.status(200).json({ route: 'updateTask' })),
	deleteTask: jest.fn((req, res) => res.status(200).json({ route: 'deleteTask' })),
}));

// Mock auth middleware to confirm it's applied to all routes.
jest.mock('../../middleware/auth', () => jest.fn((req, res, next) => next()));

const taskRoutes = require('../../routes/taskRoutes');
const taskController = require('../../controllers/taskController');
const auth = require('../../middleware/auth');

const buildApp = () => {
	// Minimal app for route wiring tests.
	const app = express();
	app.use(express.json());
	app.use('/tasks', taskRoutes);
	return app;
};

describe('taskRoutes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('applies auth middleware for any task route', async () => {
		const app = buildApp();

		await request(app).get('/tasks').send();

		expect(auth).toHaveBeenCalledTimes(1);
	});

	it('routes POST /tasks to controller', async () => {
		const app = buildApp();

		await request(app).post('/tasks').send({});

		expect(taskController.createTask).toHaveBeenCalledTimes(1);
	});

	it('routes GET /tasks to controller', async () => {
		const app = buildApp();

		await request(app).get('/tasks').send();

		expect(taskController.getTasks).toHaveBeenCalledTimes(1);
	});

	it('routes GET /tasks/:id to controller', async () => {
		const app = buildApp();

		await request(app).get('/tasks/task-id').send();

		expect(taskController.getTask).toHaveBeenCalledTimes(1);
	});

	it('routes PUT /tasks/:id to controller', async () => {
		const app = buildApp();

		await request(app).put('/tasks/task-id').send({});

		expect(taskController.updateTask).toHaveBeenCalledTimes(1);
	});

	it('routes DELETE /tasks/:id to controller', async () => {
		const app = buildApp();

		await request(app).delete('/tasks/task-id').send();

		expect(taskController.deleteTask).toHaveBeenCalledTimes(1);
	});
});
