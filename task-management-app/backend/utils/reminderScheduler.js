const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Task = require('../models/task.model');
const User = require('../models/user.model');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send reminder email
const sendReminderEmail = async (userEmail, task) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Reminder: Task "${task.title}" is due tomorrow`,
    text: `Hi there,\n\nThis is a reminder that your task "${task.title}" is due tomorrow (${task.deadline.toDateString()}).\n\nDescription: ${task.description}\nPriority: ${task.priority}\n\nPlease complete it on time!\n\nBest regards,\nTask Management App`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${userEmail} for task: ${task.title}`);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

// Function to check and send reminders for tasks due in 1 day or today
const checkAndSendReminders = async () => {
  try {
    console.log('Checking for tasks requiring reminders...');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

    // Tasks due tomorrow
    const tasksDueTomorrow = await Task.find({
      deadline: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      completed: false
    }).populate('user', 'email');

    console.log(`Found ${tasksDueTomorrow.length} tasks due tomorrow`);
    for (const task of tasksDueTomorrow) {
      if (task.user && task.user.email) {
        console.log(`Sending reminder for task "${task.title}" to ${task.user.email}`);
        await sendReminderEmail(task.user.email, task);
      }
    }

    // Tasks due today (edge case)
    const tasksDueToday = await Task.find({
      deadline: {
        $gte: today,
        $lt: tomorrow
      },
      completed: false
    }).populate('user', 'email');

    console.log(`Found ${tasksDueToday.length} tasks due today`);
    for (const task of tasksDueToday) {
      if (task.user && task.user.email) {
        console.log(`Sending reminder for task "${task.title}" to ${task.user.email} (due today)`);
        await sendReminderEmail(task.user.email, task);
      }
    }
    console.log('Reminder check completed');
  } catch (error) {
    console.error('Error checking and sending reminders:', error);
  }
};

// Schedule the reminder check to run daily at 9 AM
const startReminderScheduler = () => {
  cron.schedule('0 9 * * *', () => {
    console.log('Running daily reminder check...');
    checkAndSendReminders();
  });
};

module.exports = { startReminderScheduler };
