import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../services/reports.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
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
    if (this.reportForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.success = null;

      const formData = this.reportForm.value;
      
      this.reportsService.createReport(formData.title, formData).subscribe({
        next: (report) => {
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
          this.error = 'Failed to create report. Please try again.';
          this.isLoading = false;
        }
      });
    }
  }

  navigateToReports(): void {
    this.router.navigate(['/reports']);
  }
}