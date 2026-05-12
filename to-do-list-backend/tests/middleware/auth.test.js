const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../../models/TokenBlacklist');

jest.mock('jsonwebtoken');
jest.mock('../../models/TokenBlacklist');

// Minimal Express-like response mock for middleware unit tests.
const mockResponse = () => {
	const res = {};

	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);

	return res;
};

describe('auth middleware', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns 401 when no Authorization header is provided', async () => {
		const req = { header: jest.fn().mockReturnValue(undefined) };
		const res = mockResponse();
		const next = jest.fn();

		await auth(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'No token provided. Authorization denied.' });
		expect(next).not.toHaveBeenCalled();
	});

	it('returns 401 when token is blacklisted', async () => {
		const req = { header: jest.fn().mockReturnValue('Bearer blocked-token') };
		const res = mockResponse();
		const next = jest.fn();

		// Simulate a blacklisted token in storage.
		TokenBlacklist.findOne.mockResolvedValue({ token: 'blocked-token' });

		await auth(req, res, next);

		expect(TokenBlacklist.findOne).toHaveBeenCalledWith({ token: 'blocked-token' });
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'Token has been invalidated' });
		expect(next).not.toHaveBeenCalled();
	});

	it('returns 401 when token verification fails', async () => {
		const req = { header: jest.fn().mockReturnValue('Bearer bad-token') };
		const res = mockResponse();
		const next = jest.fn();

		TokenBlacklist.findOne.mockResolvedValue(null);
		jwt.verify.mockImplementation(() => {
			throw new Error('Invalid token');
		});

		await auth(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
		expect(next).not.toHaveBeenCalled();
	});

	it('sets req.userId and calls next when token is valid', async () => {
		const req = { header: jest.fn().mockReturnValue('Bearer good-token') };
		const res = mockResponse();
		const next = jest.fn();

		TokenBlacklist.findOne.mockResolvedValue(null);
		jwt.verify.mockReturnValue({ id: 'user-id' });

		await auth(req, res, next);

		expect(req.userId).toBe('user-id');
		expect(next).toHaveBeenCalledTimes(1);
	});
});
