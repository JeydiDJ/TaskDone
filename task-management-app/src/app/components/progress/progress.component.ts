import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Chart, registerables } from 'chart.js';
import { NgIf } from '@angular/common';

Chart.register(...registerables);

interface CompletedTask {
  completedAt: string;
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [NgIf],
  templateUrl: './progress.component.html',
})
export class ProgressComponent implements OnInit, AfterViewInit, OnDestroy {
  private taskService = inject(TaskService);

  @ViewChild('progressCanvas') progressCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyCanvas') monthlyCanvas!: ElementRef<HTMLCanvasElement>;

  completedTasks = 0;
  pendingTasks = 0;
  overdueTasks = 0;
  overallProgress = 0;
  totalTasks = 0;

  pieChart!: Chart;
  barChart!: Chart;

  // Store resize listener reference to remove it later
  private resizeListener = () => {
    if (this.pieChart) this.pieChart.resize();
    if (this.barChart) this.barChart.resize();
  };

  ngOnInit(): void {
    this.loadProgressStats();
  }

  ngAfterViewInit(): void {
    // Listen for window resize to automatically resize charts
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    // Clean up listener when component is destroyed
    window.removeEventListener('resize', this.resizeListener);
  }

  loadProgressStats(): void {
    this.taskService.getProgressStats().subscribe({
      next: (response) => {
        // Main stats
        this.completedTasks = response.data.completedTasks;
        this.pendingTasks = response.data.pendingTasks;
        this.overdueTasks = response.data.overdueTasks;
        this.overallProgress = response.data.overallProgress;

        // Total tasks
        this.totalTasks =
          this.completedTasks +
          this.pendingTasks +
          this.overdueTasks;

        if (this.totalTasks > 0) {
          // Pie chart
          if (!this.pieChart) this.createPieChart();
          else this.updatePieChart();

          // Bar chart
          const tasks: CompletedTask[] = response.data.tasks || [];
          const now = new Date();
          const months: string[] = [];
          const monthlyCounts: number[] = [];

          for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(date.toLocaleString('default', { month: 'short' }));

            const count = tasks.filter((task) => {
              const completed = new Date(task.completedAt);
              return (
                completed.getMonth() === date.getMonth() &&
                completed.getFullYear() === date.getFullYear()
              );
            }).length;

            monthlyCounts.push(count);
          }

          if (!this.barChart) this.createBarChart();
          this.updateBarChart(months, monthlyCounts);
        }
      },
      error: (error) =>
        console.error('Error loading progress stats:', error),
    });
  }

  // ======================
  // PIE CHART
  // ======================
  createPieChart() {
    if (!this.progressCanvas) return;

    this.pieChart = new Chart(this.progressCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending', 'Overdue'],
        datasets: [
          {
            data: [this.completedTasks, this.pendingTasks, this.overdueTasks],
            backgroundColor: ['#16a34a', '#facc15', '#ef4444'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // important for responsive container
        cutout: '65%',
        animation: { duration: 1000 },
        plugins: { legend: { position: 'bottom' } },
      },
     
    });
  }

  updatePieChart() {
    if (!this.pieChart) return;
    this.pieChart.data.datasets[0].data = [
      this.completedTasks,
      this.pendingTasks,
      this.overdueTasks,
    ];
    this.pieChart.update();
  }

  // ======================
  // BAR CHART
  // ======================
  createBarChart() {
    if (!this.monthlyCanvas) return;

    this.barChart = new Chart(this.monthlyCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Tasks Completed',
            data: [],
            backgroundColor: '#3b82f6',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // important for responsive container
        animation: { duration: 1000 },
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  updateBarChart(labels: string[], data: number[]) {
    if (!this.barChart) return;
    this.barChart.data.labels = labels;
    this.barChart.data.datasets[0].data = data;
    this.barChart.update();
  }
}
