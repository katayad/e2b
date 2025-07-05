import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../services/reports.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  reportForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.reportForm = this.createReportForm();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  private createReportForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      
      // Basic Information
      primarySourceCountry: ['US', Validators.required],
      occurCountry: ['US', Validators.required],
      
      // Reporter Information
      reporterTitle: ['Dr.', Validators.required],
      reporterGiveName: ['', Validators.required],
      reporterFamilyName: ['', Validators.required],
      reporterOrganization: ['', Validators.required],
      reporterStreet: ['', Validators.required],
      reporterCity: ['', Validators.required],
      reporterState: ['', Validators.required],
      reporterPostcode: ['', Validators.required],
      reporterCountry: ['US', Validators.required],
      
      // Patient Information
      patientInitial: ['', Validators.required],
      patientBirthdate: ['', Validators.required],
      patientAge: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      patientSex: ['1', Validators.required], // 1=Male, 2=Female, 0=Unknown
      patientWeight: ['', [Validators.min(0), Validators.max(500)]],
      patientHeight: ['', [Validators.min(0), Validators.max(300)]],
      
      // Reaction Information
      primarySourceReaction: ['', Validators.required],
      reactionMeddrapt: [''],
      reactionMeddrallt: [''],
      reactionStartDate: ['', Validators.required],
      reactionEndDate: [''],
      reactionDuration: [''],
      reactionOutcome: ['1', Validators.required], // 1=Recovered, 2=Recovering, 3=Not recovered, 4=Fatal, 5=Unknown
      
      // Drug Information
      medicinalProduct: ['', Validators.required],
      drugBatchNumb: [''],
      drugAuthorizationNumb: [''],
      drugDosageText: ['', Validators.required],
      drugDosageForm: [''],
      drugAdministrationRoute: ['065'], // 065 = oral
      drugIndication: [''],
      drugStartDate: ['', Validators.required],
      drugEndDate: [''],
      actionDrug: ['5'], // 5 = unknown
      drugRecurrence: ['3'], // 3 = unknown
      
      // Seriousness Criteria
      seriousnessDeath: ['2'], // 1=Yes, 2=No
      seriousnessLifeThreatening: ['2'],
      seriousnessHospitalization: ['2'],
      seriousnessDisabling: ['2'],
      seriousnessCongenitalAnomali: ['2'],
      seriousnessOther: ['2']
    });
  }

  onSubmit(): void {
    console.log('Form submitted');
    console.log('Form valid:', this.reportForm.valid);
    console.log('Form errors:', this.reportForm.errors);
    console.log('Form value:', this.reportForm.value);
    
    if (this.reportForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.success = null;

      const formData = this.reportForm.value;
      console.log('Creating report with data:', formData);
      
      this.reportsService.createReport(formData.title, formData).subscribe({
        next: (report) => {
          console.log('Report created successfully:', report);
          this.success = 'Report created successfully!';
          this.isLoading = false;
          // Reset form after successful submission
          this.reportForm.reset();
          this.reportForm.patchValue({
            primarySourceCountry: 'US',
            occurCountry: 'US',
            reporterTitle: 'Dr.',
            reporterCountry: 'US',
            patientSex: '1',
            reactionOutcome: '1',
            drugAdministrationRoute: '065',
            actionDrug: '5',
            drugRecurrence: '3',
            seriousnessDeath: '2',
            seriousnessLifeThreatening: '2',
            seriousnessHospitalization: '2',
            seriousnessDisabling: '2',
            seriousnessCongenitalAnomali: '2',
            seriousnessOther: '2'
          });
        },
        error: (err) => {
          console.error('Error creating report:', err);
          this.error = 'Failed to create report. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
      console.log('Form is invalid');
      // Mark all fields as touched to show validation errors
      Object.keys(this.reportForm.controls).forEach(key => {
        this.reportForm.get(key)?.markAsTouched();
      });
    }
  }

  navigateToReports(): void {
    this.router.navigate(['/reports']);
  }

  testClick(): void {
    console.log('Test click working!');
    alert('Click event is working!');
  }

  fillSampleData(): void {
    this.reportForm.patchValue({
      title: 'Sample E2B Report - Adverse Reaction',
      
      // Reporter Information
      reporterGiveName: 'John',
      reporterFamilyName: 'Smith',
      reporterOrganization: 'City General Hospital',
      reporterStreet: '123 Medical Center Drive',
      reporterCity: 'New York',
      reporterState: 'NY',
      reporterPostcode: '10001',
      
      // Patient Information  
      patientInitial: 'J.D.',
      patientBirthdate: '1980-01-15',
      patientAge: 44,
      
      // Reaction Information
      primarySourceReaction: 'Patient experienced severe headache and nausea after taking medication',
      reactionStartDate: '2024-12-01',
      reactionEndDate: '2024-12-05',
      reactionDuration: '4',
      
      // Drug Information
      medicinalProduct: 'Aspirin',
      drugBatchNumb: 'BATCH123456',
      drugDosageText: '500mg twice daily',
      drugDosageForm: 'Tablet',
      drugIndication: 'Headache treatment',
      drugStartDate: '2024-12-01',
      drugEndDate: '2024-12-05'
    });
    
    console.log('Sample data filled');
  }
}