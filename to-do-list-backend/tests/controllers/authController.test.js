const authController = require('../../controllers/authController');
const User = require('../../models/User');
const TokenBlacklist = require('../../models/TokenBlacklist');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../../utils/email');

jest.mock('../../models/User');
jest.mock('../../models/TokenBlacklist');
jest.mock('jsonwebtoken');
jest.mock('../../utils/email');

// Minimal Express-like response mock for controller unit tests.
const mockResponse = () => {
    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
};

describe('authController.register', () => {
    beforeEach(() => {
        // Reset mocks and silence controller error logs during negative cases.
        jest.clearAllMocks();
        User.findOne = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it('returns 400 when required fields are missing', async () => {
        const req = { body: { username: '', email: '', password: '' } };
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Please provide all required fields' });
    });

    it('returns 400 when password is too short', async () => {
        const req = { body: { username: 'testuser', email: 'test@example.com', password: '123' } };
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Password must be at least 6 characters' });
    });

    it('returns 400 when user already exists', async () => {
        const req = { body: { username: 'testuser', email: 'test@example.com', password: '123456' } };
        const res = mockResponse();

        // Simulate existing user in database.
        User.findOne.mockResolvedValue({ id: 'existing-user' });

        await authController.register(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ $or: [{ email: 'test@example.com' }, { username: 'testuser' }] });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    it('registers a user successfully', async () => {
        const req = { body: { username: 'testuser', email: 'test@example.com', password: '123456' } };
        const res = mockResponse();

        // Simulate no existing user, and a successful save.
        User.findOne.mockResolvedValue(null);
        User.mockImplementation(({ username, email, password }) => ({
            _id: 'user-id',
            username,
            email,
            password,
            save: jest.fn().mockResolvedValue(),
        }));
        // Mock JWT token generation.
        jwt.sign.mockReturnValue('token-123');

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User registered successfully',
            token: 'token-123',
            user: {
                id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
            },
        });
    });

    it('returns 400 when Mongo unique constraint fails', async () => {
        const req = { body: { username: 'testuser', email: 'test@example.com', password: '123456' } };
        const res = mockResponse();

        // Simulate a duplicate key error on save.
        User.findOne.mockResolvedValue(null);
        const saveError = Object.assign(new Error('Duplicate key'), {
            code: 11000,
            keyPattern: { email: 1 },
        });
        User.mockImplementation(() => ({
            _id: 'user-id',
            username: 'testuser',
            email: 'test@example.com',
            password: '123456',
            save: jest.fn().mockRejectedValue(saveError),
        }));

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'email already exists' });
    });
});

describe('authController.login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        User.findOne = jest.fn();
    });

    it('returns 400 when identifier or password is missing', async () => {
        const req = { body: { identifier: '', password: '' } };
        const res = mockResponse();

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Please provide username/email and password' });
    });

    it('returns 401 when user is not found', async () => {
        const req = { body: { identifier: 'testuser', password: '123456' } };
        const res = mockResponse();

        // Simulate no user found for the query.
        User.findOne.mockResolvedValue(null);

        await authController.login(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username/email or password' });
    });

    it('returns 401 when password does not match', async () => {
        const req = { body: { identifier: 'testuser', password: 'wrongpass' } };
        const res = mockResponse();

        // Simulate a user with a failing password check.
        User.findOne.mockResolvedValue({
            _id: 'user-id',
            username: 'testuser',
            email: 'test@example.com',
            matchPassword: jest.fn().mockResolvedValue(false),
        });

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username/email or password' });
    });

    it('logs in successfully', async () => {
        const req = { body: { identifier: 'test@example.com', password: '123456' } };
        const res = mockResponse();

        // Simulate successful password check and token generation.
        User.findOne.mockResolvedValue({
            _id: 'user-id',
            username: 'testuser',
            email: 'test@example.com',
            matchPassword: jest.fn().mockResolvedValue(true),
        });
        jwt.sign.mockReturnValue('token-123');

        await authController.login(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(res.json).toHaveBeenCalledWith({
            message: 'User logged in successfully',
            token: 'token-123',
            user: {
                id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
            },
        });
    });
});

describe('authController.requestPasswordReset', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        User.findOne = jest.fn();
    });

    it('returns 400 when email is missing', async () => {
        const req = { body: { email: '' } };
        const res = mockResponse();

        await authController.requestPasswordReset(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Please provide an email address' });
    });

    it('sends reset email when user exists', async () => {
        const req = { body: { email: 'test@example.com' } };
        const res = mockResponse();

        // Simulate user and capture the reset token/expires on save.
        const user = {
            email: 'test@example.com',
            save: jest.fn().mockResolvedValue(),
        };
        User.findOne.mockResolvedValue(user);

        await authController.requestPasswordReset(req, res);

        expect(user.passwordResetToken).toBeTruthy();
        expect(user.passwordResetExpires).toBeInstanceOf(Date);
        expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({
            message: 'If that email is registered, a reset link has been sent.',
        });
    });

    it('returns success response even when user is not found', async () => {
        const req = { body: { email: 'missing@example.com' } };
        const res = mockResponse();

        // Deliberately do not reveal whether the email exists.
        User.findOne.mockResolvedValue(null);

        await authController.requestPasswordReset(req, res);

        expect(sendPasswordResetEmail).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            message: 'If that email is registered, a reset link has been sent.',
        });
    });
});

describe('authController.resetPassword', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        User.findOne = jest.fn();
    });

    it('returns 400 when token or password is missing', async () => {
        const req = { body: { token: '', password: '' } };
        const res = mockResponse();

        await authController.resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token and new password are required' });
    });

    it('returns 400 when password is too short', async () => {
        const req = { body: { token: 'reset-token', password: '123' } };
        const res = mockResponse();

        await authController.resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Password must be at least 6 characters' });
    });

    it('returns 400 when reset token is invalid or expired', async () => {
        const req = { body: { token: 'bad-token', password: '123456' } };
        const res = mockResponse();

        // Simulate no user matching the hashed token or expiry window.
        User.findOne.mockResolvedValue(null);

        await authController.resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Reset token is invalid or expired' });
    });

    it('resets password successfully', async () => {
        const token = 'valid-token';
        const req = { body: { token, password: 'newpassword' } };
        const res = mockResponse();

        // Match the controller hashing logic to locate the user.
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const user = {
            passwordResetToken: tokenHash,
            passwordResetExpires: new Date(Date.now() + 60 * 1000),
            save: jest.fn().mockResolvedValue(),
        };
        // Return the user to exercise the happy path.
        User.findOne.mockResolvedValue(user);

        await authController.resetPassword(req, res);

        expect(user.password).toBe('newpassword');
        expect(user.passwordResetToken).toBeUndefined();
        expect(user.passwordResetExpires).toBeUndefined();
        expect(res.json).toHaveBeenCalledWith({ message: 'Password has been reset successfully' });
    });
});