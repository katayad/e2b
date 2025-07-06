import { Routes } from '@angular/router';

export const reportsRoutes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./reports-list/reports-list.component').then(m => m.ReportsListComponent)
  },
  { 
    path: ':id', 
    loadComponent: () => import('./report-detail/report-detail.component').then(m => m.ReportDetailComponent)
  }
];