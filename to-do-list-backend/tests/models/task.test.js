const mongoose = require('mongoose');
const Task = require('../../models/Task');

jest.setTimeout(20000);

// Run pre-save hooks without connecting to a database.
const runSaveHooks = (doc) => Task.schema.s.hooks.execPre('save', doc);

describe('Task model', () => {
	it('requires title and user', async () => {
		// Schema-level required validation.
		const task = new Task({});
		const error = task.validateSync();

		expect(error.errors.title).toBeDefined();
		expect(error.errors.user).toBeDefined();
	});

	it('validates title length', async () => {
		// Enforces minlength: 3.
		const task = new Task({
			title: 'ab',
			user: new mongoose.Types.ObjectId(),
		});
		const error = task.validateSync();

		expect(error.errors.title).toBeDefined();
	});

	it('validates status enum', async () => {
		// Enforces allowed status values only.
		const task = new Task({
			title: 'Valid Title',
			status: 'invalid',
			user: new mongoose.Types.ObjectId(),
		});
		const error = task.validateSync();

		expect(error.errors.status).toBeDefined();
	});

	it('validates priority enum', async () => {
		// Enforces allowed priority values only.
		const task = new Task({
			title: 'Valid Title',
			priority: 'urgent',
			user: new mongoose.Types.ObjectId(),
		});
		const error = task.validateSync();

		expect(error.errors.priority).toBeDefined();
	});

	it('applies default fields', async () => {
		// Defaults should be set when optional fields are omitted.
		const task = new Task({
			title: 'Default Task',
			user: new mongoose.Types.ObjectId(),
		});

		await runSaveHooks(task);

		expect(task.description).toBe('');
		expect(task.status).toBe('not-started');
		expect(task.priority).toBe('medium');
		expect(task.dueDate).toBeNull();
		expect(task.createdAt).toBeInstanceOf(Date);
		expect(task.updatedAt).toBeInstanceOf(Date);
	});

	it('updates updatedAt on save', async () => {
		const task = new Task({
			title: 'Timestamp Task',
			user: new mongoose.Types.ObjectId(),
		});

		await runSaveHooks(task);
		const firstUpdatedAt = task.updatedAt;

		task.title = 'Timestamp Task Updated';
		await runSaveHooks(task);

		expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(firstUpdatedAt.getTime());
	});
});
