const connectDB = require('../_db');
const { logout } = require('../auth.controller');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

    try {
        await connectDB();
        await logout(req, res);
    } catch (error) {
        console.error('Logout API error:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};
