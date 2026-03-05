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
    const start = group.get('startDate')?.value;
    const end = group.get('deadline')?.value;

    if (!start || !end) return null;

    return new Date(end) >= new Date(start)
      ? null
      : { deadlineBeforeStart: true };
  }

  private toUTCISOString(datetimeLocal: string): string {
    return new Date(datetimeLocal).toISOString();
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
      userId,
    };

    this.taskService.createTask(task).subscribe({
      next: () => {
        const deadlineDate = new Date(this.taskForm.value.deadline);
        const today = new Date();
        const timeDiff = deadlineDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        this.router.navigate(['/tasks'], {
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
          this.errorMessage.set(
            error.error?.message ||
              'An error occurred while creating the task. Please try again.'
          );
        }
      },
    });
  }

  dismissReminder() {
    this.showReminder.set(false);
    this.router.navigate(['/tasks']);
  }


  preventTyping(event: KeyboardEvent) {
    const allowedKeys = [
      'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'
    ];
    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

}

