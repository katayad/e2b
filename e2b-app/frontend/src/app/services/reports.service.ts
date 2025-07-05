import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Report, ReportData, ReportResponse } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  createReport(title: string, data: ReportData): Observable<Report> {
    return this.http.post<Report>(this.apiUrl, { title, data });
  }

  getReports(page: number = 1, limit: number = 10): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getReport(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${id}`);
  }

  updateReport(id: number, data: ReportData): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/${id}`, { data });
  }

  deleteReport(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  downloadReport(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }
}