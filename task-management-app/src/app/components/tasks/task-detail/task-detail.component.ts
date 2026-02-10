import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { DatePipe, NgClass, CommonModule, NgFor, NgIf } from '@angular/common';
import { Location } from '@angular/common';

@Component({
    selector: 'app-task-detail',
    imports: [DatePipe, NgClass, RouterLink, CommonModule, NgIf, NgFor],
    standalone: true,
    templateUrl: './task-detail.component.html',
})
export class TaskDetailComponent implements OnInit {
  task = signal<any>(null);
  isCompleted = signal<boolean>(false);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  deleting = signal<boolean>(false);
  showCongratsModal = signal(false);
  autoClosing = signal(false);
  allTasks = signal<any[]>([]);
  unfinishedTasks = computed(() =>
  this.allTasks().filter(t => !t.completed && t._id !== this.task()?._id)
  );

  getTaskStatus() {
    const currentTask = this.task();
    if (!currentTask) return 'In Progress';

    if (currentTask.completed) {
      return 'Completed';
    }

    if (currentTask.deadline) {
      const deadline = new Date(currentTask.deadline);
      const now = new Date();
      if (deadline < now) {
        return 'Overdue';
      }
    }

    return 'In Progress';
  }

  isOverdue() {
    const currentTask = this.task();
    if (!currentTask || currentTask.completed) return false;

    if (currentTask.deadline) {
      const deadline = new Date(currentTask.deadline);
      const now = new Date();
      return deadline < now;
    }

    return false;
  }

  getStatusClass() {
    const status = this.getTaskStatus();
    switch (status) {
      case 'Completed':
        return 'text-green-700';
      case 'Overdue':
        return 'text-red-700';
      default:
        return 'text-blue-700';
    }
  }

  getStatusIcon() {
    const status = this.getTaskStatus();
    switch (status) {
      case 'Completed':
        return 'fa-check-circle';
      default:
        return 'fa-clock';
    }
  }

  router = inject(Router);
  taskService = inject(TaskService);
  route = inject(ActivatedRoute);
  location = inject(Location);

  constructor() {}

  ngOnInit() {
    this.loading.set(true);
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.loadTaskDetails(id);
  }

  loadTaskDetails(id: string) {
    this.taskService.getTaskById(id).subscribe({
      next: (response) => {
        this.task.set(response.data);
        this.isCompleted.set(this.task()?.completed || false);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error getting task:', error);
        this.error.set(error?.error?.message || 'Error getting task');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    // Replace location.back() with direct navigation
    this.router.navigate(['/tasks']);
  }

  completeTask() {
  if (!this.task() || this.task().completed) return;

  this.loading.set(true);
  const taskId = this.task()._id;
  const updatedTask = { completed: true };

  this.taskService.updateTask(taskId, updatedTask).subscribe({
    next: (response) => {
      // Update current task locally
      if (response && response.data) {
        this.task.set(response.data);
        this.isCompleted.set(true);
      }

      this.loading.set(false);

      // Fetch all tasks from backend
      this.taskService.getAllTasks().subscribe({
        next: (tasksResponse) => {
          let tasksArray: any[] = [];

          // Access the actual tasks array returned by backend
          if (tasksResponse?.data?.tasks && Array.isArray(tasksResponse.data.tasks)) {
            tasksArray = tasksResponse.data.tasks;
          } else if (Array.isArray(tasksResponse)) {
            tasksArray = tasksResponse;
          } else {
            console.error('Unexpected tasks response format:', tasksResponse);
            tasksArray = [];
          }

          // Mark the just-completed task as completed locally
          const updatedTasks = tasksArray.map(t =>
            t._id === this.task()?._id ? { ...t, completed: true } : t
          );

          this.allTasks.set(updatedTasks);

          console.log('All tasks after update:', updatedTasks);
          console.log('Unfinished tasks:', this.unfinishedTasks());

          // Show popup modal
          this.showCongratsModal.set(true);

          // Auto-close after 5 seconds
          setTimeout(() => this.closeCongratsModal(), 5000);
        },
        error: (err) => {
          console.error('Error fetching tasks:', err);
          this.allTasks.set([]);
          this.showCongratsModal.set(true);
          setTimeout(() => this.closeCongratsModal(), 5000);
        },
      });
    },
    error: (error) => {
      console.error('Error completing task:', error);
      this.error.set(error?.error?.message || 'Error marking task as complete');
      this.loading.set(false);
    },
  });
}



  editTask() {
    if (!this.task()?._id) {
      this.error.set('Cannot edit task: Invalid task ID');
      return;
    }
    this.router.navigate(['/tasks/edit', this.task()._id]);
  }

  deleteTask() {
    if (!this.task()?._id) {
      this.error.set('Cannot delete task: Invalid task ID');
      return;
    }
    
    if (confirm('Are you sure you want to delete this task?')) {
      this.deleting.set(true);
      this.error.set(null);
      
      this.taskService.deleteTask(this.task()._id).subscribe({
        next: (response) => {
          console.log('Task deleted successfully:', response);
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.error.set(error?.error?.message || 'Error deleting task. Please try again.');
          this.deleting.set(false);
        }
      });
    }
  }

  closeCongratsModal() {
    this.autoClosing.set(true);
    setTimeout(() => {
      this.showCongratsModal.set(false);
      this.autoClosing.set(false);
    }, 500);
  }

}
