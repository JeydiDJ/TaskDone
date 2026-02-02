const connectDB = require('../_db');
const { auth } = require('../auth.middleware');
const { createTask, getAllTasks } = require('../task.controller');

module.exports = async (req, res) => {
    try {
        await connectDB();

        // Apply auth middleware
        await new Promise((resolve, reject) => {
            auth(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        if (req.method === 'POST') {
            await createTask(req, res);
        } else if (req.method === 'GET') {
            await getAllTasks(req, res);
        } else {
            res.status(405).json({ status: 'error', message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Tasks API error:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};
