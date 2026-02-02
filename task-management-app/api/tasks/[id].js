const connectDB = require('../_db');
const { auth } = require('../auth.middleware');
const { getTaskById, updateTask, deleteTask } = require('../task.controller');

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

        // Extract ID from query parameters (Vercel uses query params for dynamic routes)
        req.params = { id: req.query.id };

        if (req.method === 'GET') {
            await getTaskById(req, res);
        } else if (req.method === 'PUT') {
            await updateTask(req, res);
        } else if (req.method === 'DELETE') {
            await deleteTask(req, res);
        } else {
            res.status(405).json({ status: 'error', message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Task by ID API error:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};
