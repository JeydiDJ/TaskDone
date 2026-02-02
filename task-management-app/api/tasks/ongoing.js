const connectDB = require('../_db');
const { auth } = require('../auth.middleware');
const { getOngoingTasks } = require('../task.controller');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

    try {
        await connectDB();

        // Apply auth middleware
        await new Promise((resolve, reject) => {
            auth(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await getOngoingTasks(req, res);
    } catch (error) {
        console.error('Tasks ongoing API error:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};
