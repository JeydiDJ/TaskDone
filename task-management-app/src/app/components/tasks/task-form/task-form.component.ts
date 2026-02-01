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

  router = inject(Router);
  taskService = inject(TaskService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
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
      deadline: this.taskForm.value.deadline,
      priority: this.taskForm.value.priority,
      userId: userId,
    };

    this.taskService.createTask(task).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
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
}
