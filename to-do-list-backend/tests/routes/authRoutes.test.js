const express = require('express');
const request = require('supertest');

// Mock controllers so we only verify routing, not business logic.
jest.mock('../../controllers/authController', () => ({
	register: jest.fn((req, res) => res.status(200).json({ route: 'register' })),
	login: jest.fn((req, res) => res.status(200).json({ route: 'login' })),
	requestPasswordReset: jest.fn((req, res) => res.status(200).json({ route: 'forgot-password' })),
	resetPassword: jest.fn((req, res) => res.status(200).json({ route: 'reset-password' })),
	logout: jest.fn((req, res) => res.status(200).json({ route: 'logout' })),
}));

// Mock auth middleware to confirm it's applied on protected routes.
jest.mock('../../middleware/auth', () => jest.fn((req, res, next) => next()));

const authRoutes = require('../../routes/authRoutes');
const authController = require('../../controllers/authController');
const auth = require('../../middleware/auth');

const buildApp = () => {
	// Minimal app for route wiring tests.
	const app = express();
	app.use(express.json());
	app.use('/auth', authRoutes);
	return app;
};

describe('authRoutes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('routes POST /auth/register to controller', async () => {
		const app = buildApp();

		await request(app).post('/auth/register').send({});

		expect(authController.register).toHaveBeenCalledTimes(1);
	});

	it('routes POST /auth/login to controller', async () => {
		const app = buildApp();

		await request(app).post('/auth/login').send({});

		expect(authController.login).toHaveBeenCalledTimes(1);
	});

	it('applies auth middleware on POST /auth/logout', async () => {
		const app = buildApp();

		await request(app).post('/auth/logout').send({});

		expect(auth).toHaveBeenCalledTimes(1);
		expect(authController.logout).toHaveBeenCalledTimes(1);
	});

	it('routes POST /auth/forgot-password to controller', async () => {
		const app = buildApp();

		await request(app).post('/auth/forgot-password').send({});

		expect(authController.requestPasswordReset).toHaveBeenCalledTimes(1);
	});

	it('routes POST /auth/reset-password to controller', async () => {
		const app = buildApp();

		await request(app).post('/auth/reset-password').send({});

		expect(authController.resetPassword).toHaveBeenCalledTimes(1);
	});
});
