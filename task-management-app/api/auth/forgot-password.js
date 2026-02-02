const connectDB = require('../_db');
const { forgotPassword } = require('../auth.controller');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

    try {
        await connectDB();
        await forgotPassword(req, res);
    } catch (error) {
        console.error('Forgot password API error:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};
