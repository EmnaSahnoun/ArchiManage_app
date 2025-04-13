import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.scss'
})
export class SuperAdminDashboardComponent {
ngAfterViewInit(): void {
    this.createChart();
  }

  createChart() {
    const ctx = document.getElementById('taskChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
          datasets: [{
            label: 'Tâches complétées',
            data: [50, 60, 75, 90, 110, 130],
            backgroundColor: '#3498db',
            borderColor: '#2980b9',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  }
}
