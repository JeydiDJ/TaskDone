import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../core/models/tasks.model';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-task-list',
    imports: [RouterLink, NgClass, DatePipe],
    templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  // Change the name to be consistent (remove $ suffix)
  allTasks = signal<Task[]>([]);
  completedTasks = signal<Task[]>([]);
  pendingTasks = signal<Task[]>([]);
  unfinishedTasks = signal<Task[]>([]);

  completedPaginatedTasks = signal<Task[]>([]);
  pendingPaginatedTasks = signal<Task[]>([]);
  unfinishedPaginatedTasks = signal<Task[]>([]);

  completedCurrentPage = signal<number>(1);
  pendingCurrentPage = signal<number>(1);
  unfinishedCurrentPage = signal<number>(1);

  completedItemsPerPage = signal<number>(10);
  pendingItemsPerPage = signal<number>(10);
  unfinishedItemsPerPage = signal<number>(10);

  completedTotalPages = signal<number>(0);
  pendingTotalPages = signal<number>(0);
  unfinishedTotalPages = signal<number>(0);

  completedTotalTasks = signal<number>(0); // Add signal for total completed tasks
  pendingTotalTasks = signal<number>(0);   // Add signal for total pending tasks
  unfinishedTotalTasks = signal<number>(0); // Add signal for total unfinished tasks

  taskService = inject(TaskService);
  auth = inject(AuthService);
  route = inject(ActivatedRoute);

  completedError = signal<string>('');
  pendingError = signal<string>('');
  unfinishedError = signal<string>('');

  completedLoading = signal<boolean>(false);
  pendingLoading = signal<boolean>(false);
  unfinishedLoading = signal<boolean>(false);

  showReminder = signal<boolean>(false);
  reminderMessage = signal<string>('');

  constructor() {}

  ngOnInit() {
    this.loadPendingTasks(this.pendingCurrentPage(), this.pendingItemsPerPage());
    this.loadCompletedTasks(this.completedCurrentPage(), this.completedItemsPerPage());
    this.loadUnfinishedTasks(this.unfinishedCurrentPage(), this.unfinishedItemsPerPage());
    this.loadAllTasks();

    // Check for reminder message from query params
    this.route.queryParams.subscribe(params => {
      if (params['reminder']) {
        this.reminderMessage.set(params['reminder']);
        this.showReminder.set(true);
      }
    });

    // Check for reminders every minute
    setInterval(() => {
      this.checkReminders();
    }, 60000); // Check every minute

    // Initial check
    setTimeout(() => {
      this.checkReminders();
    }, 1000);
  }

  loadCompletedTasks(page: number, limit: number) {
    this.completedLoading.set(true);
    this.taskService.getCompletedTasks(page, limit).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          // Set the tasks directly from the response
          this.completedTasks.set(response.data.tasks || []);
          this.completedTotalPages.set(response.data.totalPages || 1);
          this.completedCurrentPage.set(response.data.currentPage || 1);
          this.completedTotalTasks.set(response.data.totalTasks || 0);

          // No need to call updateCompletedPaginatedTasks() here
          // as we're directly using the paginated data from the API
          this.completedPaginatedTasks.set(response.data.tasks || []);
        } else {
          this.completedError.set('Invalid response format from server');
        }

        this.completedLoading.set(false);
      },
      error: (error) => {
        console.error('Error getting completed tasks:', error);
        this.completedError.set('Error getting completed tasks');
        this.completedLoading.set(false);
      },
    });
  }

  loadPendingTasks(page: number, limit: number) {
    this.pendingLoading.set(true);
    this.taskService.getPendingTasks(page, limit).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.pendingTasks.set(response.data.tasks || []);
          this.pendingTotalPages.set(response.data.totalPages || 1);
          this.pendingCurrentPage.set(response.data.currentPage || 1);
          this.pendingTotalTasks.set(response.data.totalTasks || 0);

          // Directly set the paginated tasks from the API response
          this.pendingPaginatedTasks.set(response.data.tasks || []);
        } else {
          this.pendingError.set('Invalid response format from server');
        }

        this.pendingLoading.set(false);
      },
      error: (error) => {
        console.error('Error getting pending tasks:', error);
        this.pendingError.set('Error getting pending tasks');
        this.pendingLoading.set(false);
      },
    });
  }

  loadUnfinishedTasks(page: number, limit: number) {
    this.unfinishedLoading.set(true);
    this.taskService.getUnfinishedTasks(page, limit).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.unfinishedTasks.set(response.data.tasks || []);
          this.unfinishedTotalPages.set(response.data.totalPages || 1);
          this.unfinishedCurrentPage.set(response.data.currentPage || 1);
          this.unfinishedTotalTasks.set(response.data.totalTasks || 0);
          this.unfinishedPaginatedTasks.set(response.data.tasks || []);
        } else {
          this.unfinishedError.set('Invalid response format from server');
        }
        this.unfinishedLoading.set(false);
      },
      error: (error) => {
        console.error('Error getting unfinished tasks:', error);
        this.unfinishedError.set('Error getting unfinished tasks');
        this.unfinishedLoading.set(false);
      },
    });
  }

  loadUserTasks(page: number, limit: number) {
    this.pendingLoading.set(true);
    this.taskService.getUserTasks(page, limit).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.pendingTasks.set(response.data.tasks || []);
          this.pendingTotalPages.set(response.data.totalPages || 1);
          this.pendingCurrentPage.set(response.data.currentPage || 1);
          this.pendingTotalTasks.set(response.data.totalTasks || 0);
          this.pendingPaginatedTasks.set(response.data.tasks || []);
        } else {
          this.pendingError.set('Invalid response format from server');
        }
        this.pendingLoading.set(false);
      },
      error: (error) => {
        console.error('Error getting user tasks:', error);
        this.pendingError.set('Error getting user tasks');
        this.pendingLoading.set(false);
      },
    });
  }

  loadAllTasks() {
    this.taskService.getUserTasks(1, 1000).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.allTasks.set(response.data.tasks || []);
          this.checkGentleReminder();
        }
      },
      error: (error) => {
        console.error('Error getting all tasks:', error);
      },
    });
  }

  // These methods are not currently needed since we're using server-side pagination
  // but kept for potential client-side pagination fallback
  updateCompletedPaginatedTasks() {
    const startIndex =
      (this.completedCurrentPage() - 1) * this.completedItemsPerPage();
    const endIndex = startIndex + this.completedItemsPerPage();
    // Update to use the renamed signal
    this.completedPaginatedTasks.set(
      this.completedTasks().slice(startIndex, endIndex)
    );
  }

  updatePendingPaginatedTasks() {
    const startIndex =
      (this.pendingCurrentPage() - 1) * this.pendingItemsPerPage();
    const endIndex = startIndex + this.pendingItemsPerPage();
    this.pendingPaginatedTasks.set(
      this.pendingTasks().slice(startIndex, endIndex)
    );
  }

  nextCompletedPage() {
    if (this.completedCurrentPage() < this.completedTotalPages()) {
      this.completedCurrentPage.set(this.completedCurrentPage() + 1);
      this.loadCompletedTasks(
        this.completedCurrentPage(),
        this.completedItemsPerPage()
      );
    } else {
      console.log('No more pages to display.');
    }
  }

  nextPendingPage() {
    if (this.pendingCurrentPage() < this.pendingTotalPages()) {
      this.pendingCurrentPage.set(this.pendingCurrentPage() + 1);
      this.loadPendingTasks(
        this.pendingCurrentPage(),
        this.pendingItemsPerPage()
      );
    } else {
      console.log('No more pages to display.');
    }
  }

  previousCompletedPage() {
    if (this.completedCurrentPage() > 1) {
      this.completedCurrentPage.set(this.completedCurrentPage() - 1);
      this.loadCompletedTasks(
        this.completedCurrentPage(),
        this.completedItemsPerPage()
      );
    } else {
      console.log('Already on the first page.');
    }
  }

  previousPendingPage() {
    if (this.pendingCurrentPage() > 1) {
      this.pendingCurrentPage.set(this.pendingCurrentPage() - 1);
      this.loadPendingTasks(
        this.pendingCurrentPage(),
        this.pendingItemsPerPage()
      );
    } else {
      console.log('Already on the first page.');
    }
  }

  nextUnfinishedPage() {
    if (this.unfinishedCurrentPage() < this.unfinishedTotalPages()) {
      this.unfinishedCurrentPage.set(this.unfinishedCurrentPage() + 1);
      this.loadUnfinishedTasks(
        this.unfinishedCurrentPage(),
        this.unfinishedItemsPerPage()
      );
    } else {
      console.log('No more pages to display.');
    }
  }

  previousUnfinishedPage() {
    if (this.unfinishedCurrentPage() > 1) {
      this.unfinishedCurrentPage.set(this.unfinishedCurrentPage() - 1);
      this.loadUnfinishedTasks(
        this.unfinishedCurrentPage(),
        this.unfinishedItemsPerPage()
      );
    } else {
      console.log('Already on the first page.');
    }
  }

  refreshData() {
    this.pendingLoading.set(true);
    this.completedLoading.set(true);
    this.unfinishedLoading.set(true);
    this.pendingError.set('');
    this.completedError.set('');
    this.unfinishedError.set('');

    this.loadCompletedTasks(this.completedCurrentPage(), this.completedItemsPerPage());
    this.loadPendingTasks(this.pendingCurrentPage(), this.pendingItemsPerPage());
    this.loadUnfinishedTasks(this.unfinishedCurrentPage(), this.unfinishedItemsPerPage());
  }

  isAdmin() {
    return this.auth.isAdmin();
  }

  checkReminders() {
    const now = new Date();
    const pendingTasks = this.pendingTasks();

    pendingTasks.forEach(task => {
      if (task.deadline) {
        const deadline = new Date(task.deadline);
        const startDate = task.startDate ? new Date(task.startDate) : null;

        // Calculate duration between start and deadline
        let durationDays = 1; // Default to 1 day if no start date
        if (startDate) {
          const diffTime = Math.abs(deadline.getTime() - startDate.getTime());
          durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        let reminderTime: Date;
        if (durationDays <= 1) {
          // Remind 5 hours before deadline
          reminderTime = new Date(deadline.getTime() - 5 * 60 * 60 * 1000);
        } else {
          // Remind 1 day before deadline
          reminderTime = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
        }

        // Check if it's time to show the reminder
        if (now >= reminderTime && now < deadline) {
          const timeUntilDeadline = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 1000));
          const message = `⏰ Reminder: "${task.title}" is due in ${timeUntilDeadline} hours!`;

          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Task Reminder', {
              body: message,
              //icon: '/favicon.ico'
            });
          }

          // Also log to console for debugging
          console.log(message);
        }
      }
    });
  }

  checkGentleReminder() {
    const now = new Date();

    // Group tasks by startDate
    const startDateGroups: { [key: string]: Task[] } = {};

    this.allTasks().forEach(task => {
      if (task.startDate && task.createdAt && !task.completed && task.deadline && new Date(task.deadline) > now) {
        const startDateKey = new Date(task.startDate).toDateString();
        if (!startDateGroups[startDateKey]) {
          startDateGroups[startDateKey] = [];
        }
        startDateGroups[startDateKey].push(task);
      }
    });

    // Check each startDate group for multiples of 5 tasks
    for (const [startDateKey, tasks] of Object.entries(startDateGroups)) {
      const count = tasks.length;
      const milestone = Math.floor(count / 5) * 5; // Get the current milestone (5, 10, 15, etc.)
      const milestoneKey = `gentleReminderShown_${startDateKey}_${milestone}`;

      // If we haven't shown the reminder for this milestone yet
      if (milestone >= 5 && !localStorage.getItem(milestoneKey)) {
        this.reminderMessage.set("You've added quite a few tasks today. Productivity matters, but so does your well-being. You may continue if you feel ready");
        this.showReminder.set(true);
        // Mark that reminder was shown for this milestone
        localStorage.setItem(milestoneKey, 'true');
        break; // Show only one reminder at a time
      }
    }
  }

  isSuperAdmin() {
    return this.auth.isSuper();
  }

  dismissReminder() {
    this.showReminder.set(false);
  }
}
