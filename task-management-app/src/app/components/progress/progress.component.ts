import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
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
export class ProgressComponent implements OnInit {
  private taskService = inject(TaskService);

  @ViewChild('progressCanvas') progressCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyCanvas') monthlyCanvas!: ElementRef<HTMLCanvasElement>;

  completedTasks = 0;
  pendingTasks = 0;
  overallProgress = 0;
  totalTasks = 0;

  pieChart!: Chart;
  barChart!: Chart;

  ngOnInit(): void {
    this.loadProgressStats();
  }

  loadProgressStats(): void {
    this.taskService.getProgressStats().subscribe({
      next: (response) => {
        // Main stats
        this.completedTasks = response.data.completedTasks;
        this.pendingTasks = response.data.pendingTasks;
        this.overallProgress = response.data.overallProgress;
        this.totalTasks = this.completedTasks + this.pendingTasks;

        // Only create charts if there are tasks
        if (this.totalTasks > 0) {
          // -------------------
          // PIE CHART
          // -------------------
          if (this.progressCanvas && !this.pieChart) {
            this.createPieChart();
          } else {
            this.updatePieChart();
          }

          // -------------------
          // BAR CHART
          // -------------------
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

          if (this.monthlyCanvas && !this.barChart) {
            this.createBarChart();
          }
          this.updateBarChart(months, monthlyCounts);
        }
      },
      error: (error) => console.error('Error loading progress stats:', error),
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
        labels: ['Completed', 'Pending'],
        datasets: [
          {
            data: [this.completedTasks, this.pendingTasks],
            backgroundColor: ['#16a34a', '#facc15'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: '65%',
        animation: { duration: 1000 },
        plugins: { legend: { position: 'bottom' } },
      },
      plugins: [
        {
          id: 'centerText',
          beforeDraw: (chart) => {
            const { width, height } = chart;
            const ctx = chart.ctx;
            ctx.save();
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#1f2937';
            ctx.fillText(`${this.overallProgress}%`, width / 2, height / 2);
            ctx.restore();
          },
        },
      ],
    });
  }

  updatePieChart() {
    if (!this.pieChart) return;

    this.pieChart.data.datasets[0].data = [
      this.completedTasks,
      this.pendingTasks,
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
