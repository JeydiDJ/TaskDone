const cron = require('node-cron');
const Task = require('../models/task.model');

/**
 * Scheduled job to automatically delete completed tasks older than 5 days
 * Runs every day at 2 AM
 */
const scheduleTaskCleanup = () => {
  // Schedule to run every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('Running scheduled task cleanup...');

      // Calculate date 5 days ago
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      // Delete completed tasks older than 5 days
      const result = await Task.deleteMany({
        completed: true,
        updatedAt: { $lt: fiveDaysAgo }
      });

      if (result.deletedCount > 0) {
        console.log(`Successfully deleted ${result.deletedCount} completed tasks older than 5 days`);
      } else {
        console.log('No completed tasks older than 5 days found for deletion');
      }
    } catch (error) {
      console.error('Error during scheduled task cleanup:', error);
    }
  });

  console.log('Task cleanup scheduler initialized - runs daily at 2:00 AM');
};

/**
 * Manual function to clean up completed tasks older than 5 days
 * Can be called for immediate cleanup or testing
 */
const cleanupOldCompletedTasks = async () => {
  try {
    console.log('Running manual task cleanup...');

    // Calculate date 5 days ago
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    // Delete completed tasks older than 5 days
    const result = await Task.deleteMany({
      completed: true,
      updatedAt: { $lt: fiveDaysAgo }
    });

    console.log(`Manual cleanup completed: ${result.deletedCount} tasks deleted`);
    return result;
  } catch (error) {
    console.error('Error during manual task cleanup:', error);
    throw error;
  }
};

module.exports = {
  scheduleTaskCleanup,
  cleanupOldCompletedTasks
};
