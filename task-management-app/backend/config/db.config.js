const mongoose = require('mongoose');

require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
}

module.exports = async function connectDB() {
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection failed');
        console.error(error);
        process.exit(1);
    }
};
