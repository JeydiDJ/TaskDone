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
  users: User[] = [];

  router = inject(Router);
  route = inject(ActivatedRoute);
  taskService = inject(TaskService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);
  usersService = inject(UsersService);

  constructor() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const minDateTime =
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
        startDate: [minDateTime],
        deadline: [minDateTime, Validators.required],
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
          startDate: task.startDate ? this.utcToLocal(task.startDate) : '',
          deadline: task.deadline ? this.utcToLocal(task.deadline) : '',
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

  // UTC → local datetime-local string
  private utcToLocal(datetimeUTC: string): string {
    if (!datetimeUTC) return '';
    const date = new Date(datetimeUTC);
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

  // Local datetime → UTC ISO string for backend
  private localToUTC(datetimeLocal: string): string {
    if (!datetimeLocal) return '';
    const [datePart, timePart] = datetimeLocal.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    const localDate = new Date(year, month - 1, day, hours, minutes);
    return localDate.toISOString(); // Converts to UTC
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
    const start = new Date(group.get('startDate')?.value);
    const deadline = new Date(group.get('deadline')?.value);
    return deadline >= start ? null : { deadlineBeforeStart: true };
  }

  updateTask() {
    if (this.taskForm.invalid) return;

    const updatedTask = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      startDate: this.localToUTC(this.taskForm.value.startDate),
      deadline: this.localToUTC(this.taskForm.value.deadline),
      priority: this.taskForm.value.priority,
      userId: this.taskForm.value.userId,
    };

    this.loading = true;
    this.taskService.updateTask(this.taskId, updatedTask).subscribe({
      next: () => this.router.navigate(['/tasks', this.taskId]),
      error: (error) => {
        console.error('Error updating task:', error);
        this.error = 'Failed to update task';
        this.loading = false;
      },
    });
  }
}