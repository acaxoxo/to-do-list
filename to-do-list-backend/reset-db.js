const mongoose = require('mongoose');
require('dotenv').config();

async function resetDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Drop users collection
        const db = mongoose.connection.db;
        await db.collection('users').drop().catch(() => {
            console.log('Users collection does not exist or already dropped');
        });

        console.log('✅ Database reset successfully! Users collection dropped.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting database:', error.message);
        process.exit(1);
    }
}

resetDatabase();
