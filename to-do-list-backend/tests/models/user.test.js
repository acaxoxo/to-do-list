const User = require('../../models/User');

jest.setTimeout(20000);

// Run pre-save hooks without connecting to a database.
const runSaveHooks = (doc) => User.schema.s.hooks.execPre('save', doc);

describe('User model', () => {
	it('requires username, email, and password', async () => {
		// Schema-level required validation.
		const user = new User({});
		const error = user.validateSync();

		expect(error.errors.username).toBeDefined();
		expect(error.errors.email).toBeDefined();
		expect(error.errors.password).toBeDefined();
	});

	it('validates username length', async () => {
		// Enforces minlength: 3.
		const user = new User({
			username: 'ab',
			email: 'test@example.com',
			password: '123456',
		});
		const error = user.validateSync();

		expect(error.errors.username).toBeDefined();
	});

	it('validates email format', async () => {
		// Enforces email regex.
		const user = new User({
			username: 'testuser',
			email: 'invalid-email',
			password: '123456',
		});
		const error = user.validateSync();

		expect(error.errors.email).toBeDefined();
	});

	it('validates password length', async () => {
		// Enforces minlength: 6.
		const user = new User({
			username: 'testuser',
			email: 'test@example.com',
			password: '123',
		});
		const error = user.validateSync();

		expect(error.errors.password).toBeDefined();
	});

	it('hashes password before save', async () => {
		// Pre-save hook should hash the plain password.
		const user = new User({
			username: 'testuser',
			email: 'test@example.com',
			password: '123456',
		});

		await runSaveHooks(user);

		expect(user.password).not.toBe('123456');
	});

	it('matchPassword returns true for correct password', async () => {
		// Instance method should compare hashed password correctly.
		const user = new User({
			username: 'testuser',
			email: 'test@example.com',
			password: '123456',
		});

		await runSaveHooks(user);

		const isMatch = await user.matchPassword('123456');
		expect(isMatch).toBe(true);
	});
});
