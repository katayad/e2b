import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsListComponent } from './reports-list/reports-list.component';
import { ReportDetailComponent } from './report-detail/report-detail.component';

const routes: Routes = [
  { path: '', component: ReportsListComponent },
  { path: ':id', component: ReportDetailComponent },
  { path: ':id/edit', redirectTo: '/dashboard' } // Edit redirects to dashboard with form pre-filled
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }