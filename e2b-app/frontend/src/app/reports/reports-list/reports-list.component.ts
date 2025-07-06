import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../services/reports.service';
import { Report } from '../../models/report.model';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss']
})
export class ReportsListComponent implements OnInit {
  reports: Report[] = [];
  currentPage = 1;
  totalPages = 1;
  totalReports = 0;
  isLoading = false;
  error: string | null = null;

  constructor(
    private reportsService: ReportsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.error = null;

    this.reportsService.getReports(this.currentPage, 10).subscribe({
      next: (response) => {
        this.reports = response.reports;
        this.totalPages = response.totalPages;
        this.totalReports = response.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reports';
        this.isLoading = false;
      }
    });
  }

  viewReport(reportId: number): void {
    this.router.navigate(['/reports', reportId]);
  }

  editReport(reportId: number): void {
    this.router.navigate(['/reports', reportId, 'edit']);
  }

  deleteReport(reportId: number): void {
    if (confirm('Are you sure you want to delete this report?')) {
      this.reportsService.deleteReport(reportId).subscribe({
        next: () => {
          this.loadReports(); // Reload the list
        },
        error: (err) => {
          this.error = 'Failed to delete report';
        }
      });
    }
  }

  downloadReport(reportId: number, title: string): void {
    this.reportsService.downloadReport(reportId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error = 'Failed to download report';
      }
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadReports();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadReports();
    }
  }

  createNewReport(): void {
    this.router.navigate(['/dashboard']);
  }
}