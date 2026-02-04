import { Component, inject, signal } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-task-form',
    imports: [ReactiveFormsModule, NgClass, RouterLink],
    templateUrl: './task-form.component.html',
})
export class TaskFormComponent {
  taskForm: FormGroup;
  minDate: string = new Date().toISOString().split('T')[0];
  errorMessage = signal<string>('');
  showReminder = signal<boolean>(false);
  reminderMessage = signal<string>('');

  router = inject(Router);
  taskService = inject(TaskService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      startDate: [this.minDate],
      deadline: [this.minDate, Validators.required],
      priority: ['', Validators.required],
    });
  }

  createTask() {
    if (this.taskForm.invalid) {
      return;
    }

    // Get current user ID from auth service
    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      console.error('No current user found');
      return;
    }

    const task = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      startDate: this.taskForm.value.startDate,
      deadline: this.taskForm.value.deadline,
      priority: this.taskForm.value.priority,
      userId: userId,
    };

    this.taskService.createTask(task).subscribe({
      next: () => {
        // Calculate days until deadline
        const deadlineDate = new Date(this.taskForm.value.deadline);
        const today = new Date();
        const timeDiff = deadlineDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        let reminderMessage = '';
        if (daysDiff === 1) {
          reminderMessage = "Hey! Since you set the deadline in just 1 day, you'll get a reminder later to complete it. Do well and get that Task Done";
        } else {
          reminderMessage = "Hey! Since you set the deadline for more than a day, you'll be reminded 1 day before the deadline. Do well and get that Task Done";
        }

        // Navigate to tasks list with reminder data
        this.router.navigate(['/tasks'], {
          queryParams: { reminder: reminderMessage }
        });
      },
      error: (error) => {
        console.error('Error creating task:', error);
        if (error.status === 401) {
          this.errorMessage.set('Your session has expired. Please log in again.');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000); // Show message for 2 seconds before redirect
        } else if (error.status === 404) {
          this.errorMessage.set('Server not found. Please check your connection.');
        } else {
          const message = error.error?.message || 'An error occurred while creating the task. Please try again.';
          this.errorMessage.set(message);
        }
      },
    });
  }

  dismissReminder() {
    this.showReminder.set(false);
    this.router.navigate(['/tasks']);
  }
}
