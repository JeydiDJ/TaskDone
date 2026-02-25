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
  minDateTime: string;
  errorMessage = signal<string>('');
  showReminder = signal<boolean>(false);
  reminderMessage = signal<string>('');

  router = inject(Router);
  taskService = inject(TaskService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);

  constructor() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    // Initialize datetime-local with current local time
    this.minDateTime =
      now.getFullYear() +
      '-' +
      pad(now.getMonth() + 1) +
      '-' +
      pad(now.getDate()) +
      'T' +
      pad(now.getHours()) +
      ':' +
      pad(now.getMinutes());

    this.taskForm = this.fb.group(
      {
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required, Validators.minLength(3)]],
        startDate: [this.minDateTime],
        deadline: [this.minDateTime, Validators.required],
        priority: ['', Validators.required],
      },
      { validators: this.deadlineAfterStartDate }
    );
  }

  deadlineAfterStartDate(group: FormGroup) {
    const start = new Date(group.get('startDate')?.value);
    const end = new Date(group.get('deadline')?.value);
    return end >= start ? null : { deadlineBeforeStart: true };
  }

  // Convert datetime-local string to ISO string (UTC) while **subtracting 8 hours**
  private toUTCISOString(datetimeLocal: string): string {
    if (!datetimeLocal) return '';
    const [datePart, timePart] = datetimeLocal.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // Subtract 8 hours to compensate for the shift
    const localDate = new Date(year, month - 1, day, hours - 8, minutes);
    return localDate.toISOString();
  }

  createTask() {
    if (this.taskForm.invalid) return;

    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      console.error('No current user found');
      return;
    }

    const task = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      startDate: this.toUTCISOString(this.taskForm.value.startDate),
      deadline: this.toUTCISOString(this.taskForm.value.deadline),
      priority: this.taskForm.value.priority,
      userId: userId,
    };

    this.taskService.createTask(task).subscribe({
      next: () => {
        const deadlineDate = new Date(this.taskForm.value.deadline);
        const today = new Date();
        const timeDiff = deadlineDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const reminderMessage =
          daysDiff === 1
            ? "Hey! Since you set the deadline in just 1 day, you'll get a reminder later to complete it. Do well and get that Task Done"
            : "Hey! Since you set the deadline for more than a day, you'll be reminded for the deadline to accomplish it. Do well and get that Task Done";

        this.router.navigate(['/tasks'], {
          queryParams: { reminder: reminderMessage },
        });
      },
      error: (error) => {
        console.error('Error creating task:', error);
        if (error.status === 401) {
          this.errorMessage.set('Your session has expired. Please log in again.');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else if (error.status === 404) {
          this.errorMessage.set('Server not found. Please check your connection.');
        } else {
          const message =
            error.error?.message || 'An error occurred while creating the task. Please try again.';
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