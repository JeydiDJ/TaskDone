require("dotenv").config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { scheduleTaskCleanup } = require('./utils/taskCleanup');
const { startReminderScheduler } = require('./utils/reminderScheduler');

// Initialize Express app
const app = express();

// Connect to MongoDB
(async () => {
    await connectDB();

    // CORS: allow local dev + Vercel frontend
    const allowedOrigins = [
      'http://localhost:4200',
      'https://task-done-g10.vercel.app'
    ];
    app.use(cors({
      origin: allowedOrigins,
      credentials: true
    }));

    // Body parser
    app.use(express.json());

    // Swagger docs
    const swaggerOptions = {
      customCss: '.swagger-ui .topbar { background-color: #24292e; }',
      customSiteTitle: 'Task Management API Documentation',
      explorer: true,
    };
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec, swaggerOptions));

    // Routes
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/tasks', require('./routes/task.routes'));
    app.use('/api/users', require('./routes/user.routes'));

    app.get('', (req, res) => {
        res.send('API is running... <br><a href="/api-docs">View API Documentation</a>');
    });

    // Scheduled tasks
    scheduleTaskCleanup();
    startReminderScheduler();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();
