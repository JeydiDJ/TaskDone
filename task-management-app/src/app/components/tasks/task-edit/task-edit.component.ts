import { Component, inject, OnInit } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from '../../../core/models/user.model';
import { NgClass } from '@angular/common';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-task-edit',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './task-edit.component.html',
})
export class TaskEditComponent implements OnInit {
  taskForm: FormGroup;
  taskId: string = '';
  loading = false;
  error: string | null = null;
  minDate: string = new Date().toISOString().split('T')[0];
  minDateTime: string = new Date().toISOString().slice(0, 16);
  users: User[] = [];

  router = inject(Router);
  route = inject(ActivatedRoute);
  taskService = inject(TaskService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);
  usersService = inject(UsersService);

  constructor() {
    this.taskForm = this.fb.group(
      {
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required, Validators.minLength(3)]],
        startDate: [''],
        deadline: ['', Validators.required],
        priority: ['', Validators.required],
        userId: ['', Validators.required],
      },
      { validators: this.deadlineAfterStartValidator }
    );
  }

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    this.loading = true;

    this.taskService.getTaskById(this.taskId).subscribe({
      next: (response) => {
        const task = response.data;

        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          startDate: task.startDate ? this.formatForDateTimeLocal(task.startDate) : '',
          deadline: task.deadline ? this.formatForDateTimeLocal(task.deadline) : '',
          priority: task.priority,
          userId: task.user._id,
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.error = 'Error loading task details';
        this.loading = false;
      },
    });

    this.getUsers();
  }

  // Convert UTC/ISO string to datetime-local for inputs
  private formatForDateTimeLocal(dateString: string): string {
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');

    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes())
    );
  }

  // Convert datetime-local string to UTC ISO string preserving local time
  private toLocalISOString(datetimeLocal: string): string {
    if (!datetimeLocal) return '';
    const [datePart, timePart] = datetimeLocal.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    const localDate = new Date(year, month - 1, day, hours, minutes);
    const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
    return utcDate.toISOString();
  }

  getUsers() {
    this.auth.getUsers().subscribe({
      next: (response) => {
        this.users = response;
      },
      error: (error) => {
        console.error('Error getting users:', error);
      },
    });
  }

  deadlineAfterStartValidator(group: FormGroup) {
    const start = group.get('startDate')?.value;
    const deadline = group.get('deadline')?.value;

    if (start && deadline) {
      if (new Date(deadline) <= new Date(start)) {
        return { deadlineBeforeStart: true };
      }
    }

    return null;
  }

  updateTask() {
    if (this.taskForm.invalid) return;

    const updatedTask = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      startDate: this.toLocalISOString(this.taskForm.value.startDate),
      deadline: this.toLocalISOString(this.taskForm.value.deadline),
      priority: this.taskForm.value.priority,
      userId: this.taskForm.value.userId,
    };

    this.loading = true;
    this.taskService.updateTask(this.taskId, updatedTask).subscribe({
      next: () => {
        this.router.navigate(['/tasks', this.taskId]);
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.error = 'Failed to update task';
        this.loading = false;
      },
    });
  }
}