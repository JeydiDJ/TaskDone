const connectDB = require('../_db');
const { register } = require('../auth.controller');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

    try {
        await connectDB();
        await register(req, res);
    } catch (error) {
        console.error('Register API error:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};
