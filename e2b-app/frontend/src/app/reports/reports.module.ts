import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsListComponent } from './reports-list/reports-list.component';
import { ReportDetailComponent } from './report-detail/report-detail.component';

@NgModule({
  declarations: [
    ReportsListComponent,
    ReportDetailComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule
  ]
})
export class ReportsModule { }