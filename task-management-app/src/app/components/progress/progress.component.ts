import { Component, inject, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
})
export class ProgressComponent implements OnInit {
  private taskService = inject(TaskService);

  completedTasks: number = 0;
  pendingTasks: number = 0;
  overallProgress: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.loadProgressStats();
  }

  loadProgressStats(): void {
    this.taskService.getProgressStats().subscribe({
      next: (response) => {
        console.log('Progress stats received:', response);
        this.completedTasks = response.data.completedTasks;
        this.pendingTasks = response.data.pendingTasks;
        this.overallProgress = response.data.overallProgress;
      },
      error: (error) => {
        console.error('Error loading progress stats:', error);
        // Keep default values (0) on error
      }
    });
  }
}
