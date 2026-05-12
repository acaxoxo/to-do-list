const TokenBlacklist = require('../../models/TokenBlacklist');

describe('TokenBlacklist model', () => {
	it('requires token and expiresAt', async () => {
		// Schema-level required validation.
		const entry = new TokenBlacklist({});
		const error = entry.validateSync();

		expect(error.errors.token).toBeDefined();
		expect(error.errors.expiresAt).toBeDefined();
	});

	it('saves a valid blacklisted token', async () => {
		const entry = new TokenBlacklist({
			token: 'token-123',
			expiresAt: new Date(Date.now() + 60 * 1000),
		});
		const error = entry.validateSync();

		expect(error).toBeUndefined();
	});
});
