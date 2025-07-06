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
      
      // N.1 Batch Information
      batchNumber: [''],
      batchSenderIdentifier: [''],
      batchReceiverIdentifier: [''],
      batchTransmissionDate: [''],
      
      // N.2 Message Header
      messageIdentifier: [''],
      messageSenderIdentifier: [''],
      messageReceiverIdentifier: [''],
      messageCreationDate: [''],
      
      // C.1 Case Safety Report Identification
      senderSafetyReportId: [''],
      safetyReportId: [''],
      safetyReportVersion: [''],
      dateOfCreation: [''],
      typeOfReport: ['1'], // 1=Spontaneous, 2=Report from study, 3=Other, 4=Not available to sender
      dateReportFirstReceived: [''],
      dateReportMostRecent: [''],
      additionalDocuments: ['2'], // 1=Yes, 2=No
      documentsHeld: [''],
      fulfilLocalCriteria: ['1'], // 1=Yes, 2=No
      worldwideUniqueId: [''],
      firstSender: ['2'], // 1=Regulator, 2=Other
      otherCaseIds: [''],
      linkedReportId: [''],
      nullificationAmendment: [''],
      nullificationReason: [''],
      
      // Additional identification fields
      receiveDate: [''],
      receiptDate: [''],
      companyNumber: [''],
      
      // Basic Information
      primarySourceCountry: ['US', Validators.required],
      occurCountry: ['US'],
      
      // C.2 Reporter Information
      reporterTitle: ['Dr.', Validators.required],
      reporterGiveName: ['', Validators.required],
      reporterFamilyName: ['', Validators.required],
      reporterOrganization: ['', Validators.required],
      reporterStreet: ['', Validators.required],
      reporterCity: ['', Validators.required],
      reporterState: ['', Validators.required],
      reporterPostcode: ['', Validators.required],
      reporterCountry: ['US', Validators.required],
      reporterTelephone: [''],
      reporterFax: [''],
      reporterEmail: [''],
      reporterQualification: ['1'], // 1=Physician, 2=Pharmacist, 3=Other health professional, 4=Lawyer, 5=Consumer or other non health professional
      primarySourceRegulatory: ['1'], // 1=Yes, 2=No
      
      // C.3 Sender Information
      senderType: ['1'], // 1=Pharmaceutical company, 2=Regulatory authority, 3=Health professional, 4=Regional pharmacovigilance centre, 5=WHO collaborating centre, 6=Other
      senderOrganization: [''],
      personResponsible: [''],
      senderAddress: [''],
      senderCity: [''],
      senderState: [''],
      senderPostcode: [''],
      senderCountry: ['US'],
      senderTelephone: [''],
      senderFax: [''],
      senderEmail: [''],
      
      // C.4 Literature Reference
      literatureReference: [''],
      includedDocuments: ['2'], // 1=Yes, 2=No
      
      // C.5 Study Information
      studyRegistrationNumber: [''],
      studyRegistrationCountry: [''],
      studyName: [''],
      sponsorStudyNumber: [''],
      studyTypeReaction: [''],
      
      // D Patient Information
      patientInitial: ['', Validators.required],
      patientMedicalRecordNumber: [''],
      patientBirthdate: [''],
      patientAge: ['', [Validators.min(0), Validators.max(120)]],
      patientAgeUnit: ['801'], // 801=Year, 802=Month, 803=Week, 804=Day, 805=Hour
      gestationPeriod: [''],
      patientAgeGroup: [''],
      patientSex: ['1', Validators.required], // 1=Male, 2=Female, 0=Unknown
      patientWeight: ['', [Validators.min(0), Validators.max(500)]],
      patientHeight: ['', [Validators.min(0), Validators.max(300)]],
      lastMenstrualDate: [''],
      
      // D.7 Medical History
      medicalHistoryText: [''],
      medicalHistoryMeddra: [''],
      medicalHistoryStartDate: [''],
      medicalHistoryEndDate: [''],
      concomitantTherapy: [''],
      
      // D.8 Past Drug History
      pastDrugName: [''],
      pastDrugMpid: [''],
      pastDrugPhpid: [''],
      pastDrugStartDate: [''],
      pastDrugEndDate: [''],
      pastDrugIndication: [''],
      pastDrugIndicationMeddra: [''],
      pastDrugReaction: [''],
      pastDrugReactionMeddra: [''],
      
      // D.9 Death Information
      deathDate: [''],
      deathCause: [''],
      deathCauseMeddra: [''],
      autopsyDone: [''],
      autopsyCause: [''],
      
      // D.10 Parent Information
      parentId: [''],
      parentBirthdate: [''],
      parentAge: [''],
      parentAgeUnit: ['801'], // 801=Year, 802=Month, 803=Week, 804=Day, 805=Hour
      parentMenstrualDate: [''],
      parentWeight: [''],
      parentHeight: [''],
      parentSex: [''],
      parentMedicalHistory: [''],
      
      // E Reaction Information
      primarySourceReaction: ['', Validators.required],
      reactionNativeLanguage: [''],
      reactionTranslation: [''],
      reactionMeddrapt: [''],
      reactionMeddrallt: [''],
      termHighlighted: ['2'], // 1=Yes, 2=No
      reactionStartDate: ['', Validators.required],
      reactionEndDate: [''],
      reactionDuration: [''],
      reactionDurationUnit: ['804'], // 804=Day
      reactionOutcome: ['1', Validators.required], // 1=Recovered/Resolved, 2=Recovering/Resolving, 3=Not recovered/Not resolved, 4=Fatal, 5=Unknown
      medicalConfirmation: ['2'], // 1=Yes, 2=No
      reactionCountry: [''],
      
      // F Test Results
      testDate: [''],
      testName: [''],
      testNameMeddra: [''],
      testResult: [''],
      testResultCode: [''],
      testResultValue: [''],
      testResultUnit: [''],
      testResultText: [''],
      testNormalLow: [''],
      testNormalHigh: [''],
      testComments: [''],
      testMoreInfo: ['2'], // 1=Yes, 2=No
      
      // G Drug Information
      drugRole: ['1'], // 1=Suspect, 2=Concomitant, 3=Interacting
      medicinalProduct: ['', Validators.required],
      drugMpid: [''],
      drugPhpid: [''],
      substanceIdentifier: [''],
      substanceStrength: [''],
      substanceStrengthUnit: ['mg'],
      drugBatchNumb: [''],
      drugAuthorizationNumb: [''],
      drugAuthorizationCountry: [''],
      drugAuthorizationHolder: [''],
      drugDoseNumber: [''],
      drugDoseUnit: ['mg'],
      drugDoseInterval: [''],
      drugDoseIntervalUnit: ['h'],
      drugStartDate: ['', Validators.required],
      drugEndDate: [''],
      drugDuration: [''],
      drugDurationUnit: ['d'],
      drugDosageText: ['', Validators.required],
      drugDosageForm: [''],
      drugAdministrationRoute: ['065'], // 065=Oral
      drugParentRoute: [''],
      drugCumulativeDose: [''],
      drugCumulativeDoseUnit: ['mg'],
      drugGestationPeriod: [''],
      drugGestationPeriodUnit: ['wk'],
      drugIndication: [''],
      drugIndicationMeddra: [''],
      actionDrug: ['5'], // 1=Drug withdrawn, 2=Dose reduced, 3=Dose increased, 4=Dose not changed, 5=Unknown, 6=Not applicable
      drugReactionAssessed: [''],
      drugRelatedness: [''], // 1=Certain, 2=Probable/Likely, 3=Possible, 4=Unlikely, 5=Conditional/Unclassified, 6=Unassessable/Unclassifiable
      drugReactionInterval: [''],
      drugReactionIntervalUnit: ['h'],
      drugRecurrence: ['3'], // 1=Yes, 2=No, 3=Unknown
      drugAdditionalInfo: [''],
      drugAdditionalInfoText: [''],
      
      // H Narrative
      narrativeText: [''],
      reporterComments: [''],
      senderDiagnosis: [''],
      senderDiagnosisMeddra: [''],
      senderComments: [''],
      caseSummaryNative: [''],
      caseSummaryLanguage: [''],
      
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
          this.isLoading = false;
          // Redirect to the newly created report's detail page
          this.router.navigate(['/reports', report.id]);
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
      title: 'Sample E2B(R3) Report - Comprehensive Test Case',
      
      // N.1 Batch Information
      batchNumber: 'BATCH-2024-001',
      batchSenderIdentifier: 'SENDER-ID-123',
      batchReceiverIdentifier: 'RECEIVER-ID-456',
      batchTransmissionDate: '2024-12-06T10:30:00',
      
      // N.2 Message Header
      messageIdentifier: 'MSG-2024-001',
      messageSenderIdentifier: 'MSG-SENDER-123',
      messageReceiverIdentifier: 'MSG-RECEIVER-456',
      messageCreationDate: '2024-12-06T10:30:00',
      
      // C.1 Case Safety Report Identification
      senderSafetyReportId: 'US-E2BAPP-2024-001',
      safetyReportId: 'ICSR-2024-001',
      safetyReportVersion: '1.0',
      dateOfCreation: '2024-12-06',
      typeOfReport: '1', // Spontaneous
      dateReportFirstReceived: '2024-12-05',
      dateReportMostRecent: '2024-12-06',
      additionalDocuments: '2', // No
      fulfilLocalCriteria: '1', // Yes
      worldwideUniqueId: 'WW-UNIQUE-2024-001',
      firstSender: '2', // Other
      
      // C.2 Reporter Information
      reporterGiveName: 'John',
      reporterFamilyName: 'Smith',
      reporterOrganization: 'City General Hospital',
      reporterStreet: '123 Medical Center Drive',
      reporterCity: 'New York',
      reporterState: 'NY',
      reporterPostcode: '10001',
      reporterTelephone: '+1-555-123-4567',
      reporterEmail: 'john.smith@hospital.com',
      reporterQualification: '1', // Physician
      primarySourceRegulatory: '1', // Yes
      
      // C.3 Sender Information
      senderType: '3', // Health professional
      senderOrganization: 'City General Hospital Pharmacovigilance',
      personResponsible: 'Jane Doe',
      senderAddress: '123 Medical Center Drive',
      senderCity: 'New York',
      senderState: 'NY',
      senderPostcode: '10001',
      senderTelephone: '+1-555-123-4568',
      senderEmail: 'pharmacovigilance@hospital.com',
      
      // C.4 Literature Reference
      literatureReference: 'Sample literature reference for testing purposes',
      includedDocuments: '2', // No
      
      // C.5 Study Information
      studyRegistrationNumber: 'NCT12345678',
      studyRegistrationCountry: 'US',
      studyName: 'Sample Clinical Study',
      sponsorStudyNumber: 'SPONSOR-123',
      studyTypeReaction: 'Phase III Clinical Trial',
      
      // D Patient Information  
      patientInitial: 'J.D.',
      patientMedicalRecordNumber: 'MRN-123456',
      patientBirthdate: '1980-01-15',
      patientAge: 44,
      patientAgeUnit: '801', // Year
      gestationPeriod: '',
      gestationPeriodUnit: '803', // Week
      patientAgeGroup: 'Adult',
      patientWeight: 75,
      patientHeight: 175,
      lastMenstrualDate: '',
      
      // D.7 Medical History
      medicalHistoryText: 'Hypertension diagnosed 5 years ago, well controlled with medication',
      medicalHistoryMeddra: '10020772', // Hypertension
      medicalHistoryStartDate: '2019-06-01',
      medicalHistoryEndDate: '',
      concomitantTherapy: 'Lisinopril 10mg daily for hypertension',
      
      // D.8 Past Drug History
      pastDrugName: 'Ibuprofen',
      pastDrugMpid: 'MPID-IBU-001',
      pastDrugPhpid: 'PHPID-IBU-001',
      pastDrugStartDate: '2024-11-01',
      pastDrugEndDate: '2024-11-15',
      pastDrugIndication: 'Pain relief',
      pastDrugIndicationMeddra: '10033371', // Pain
      pastDrugReaction: 'Mild gastric upset',
      pastDrugReactionMeddra: '10017944', // Gastrointestinal disorder
      
      // E Reaction Information
      primarySourceReaction: 'Patient experienced severe headache, nausea, and dizziness approximately 2 hours after taking the medication. Symptoms persisted for 4 days and gradually improved after discontinuation.',
      reactionNativeLanguage: 'Severe headache and nausea',
      reactionTranslation: 'Severe headache and nausea',
      reactionMeddrapt: '10019211', // Headache
      reactionMeddrallt: '10028813', // Nausea
      termHighlighted: '1', // Yes
      reactionStartDate: '2024-12-01',
      reactionEndDate: '2024-12-05',
      reactionDuration: '4',
      reactionDurationUnit: '804', // Day
      reactionOutcome: '1', // Recovered/Resolved
      medicalConfirmation: '1', // Yes
      reactionCountry: 'US',
      
      // F Test Results
      testDate: '2024-12-02',
      testName: 'Complete Blood Count',
      testNameMeddra: '10009663', // Blood count
      testResult: 'Normal',
      testResultCode: 'NORMAL',
      testResultValue: 'WBC: 7.2, RBC: 4.5, PLT: 250',
      testResultUnit: '10^9/L, 10^12/L, 10^9/L',
      testNormalLow: 'WBC: 4.0, RBC: 4.0, PLT: 150',
      testNormalHigh: 'WBC: 11.0, RBC: 5.5, PLT: 450',
      testResultText: 'All blood parameters within normal limits',
      testComments: 'No abnormal findings detected',
      testMoreInfo: '2', // No
      
      // G Drug Information
      drugRole: '1', // Suspect
      medicinalProduct: 'Aspirin 500mg Tablets',
      drugMpid: 'MPID-ASP-500',
      drugPhpid: 'PHPID-ASP-500',
      substanceIdentifier: 'ASP-SUBSTANCE-001',
      substanceStrength: '500',
      substanceStrengthUnit: 'mg',
      drugBatchNumb: 'BATCH123456',
      drugAuthorizationNumb: 'NDA-021234',
      drugAuthorizationCountry: 'US',
      drugAuthorizationHolder: 'Pharmaceutical Company Inc.',
      drugDoseNumber: 500,
      drugDoseUnit: 'mg',
      drugDoseInterval: 12,
      drugDoseIntervalUnit: 'h',
      drugStartDate: '2024-12-01',
      drugEndDate: '2024-12-05',
      drugDuration: '4',
      drugDurationUnit: 'd',
      drugDosageText: '500mg twice daily with meals',
      drugDosageForm: 'Tablet',
      drugAdministrationRoute: '065', // Oral
      drugParentRoute: '',
      drugCumulativeDose: '4000',
      drugCumulativeDoseUnit: 'mg',
      drugGestationPeriod: '',
      drugIndication: 'Headache treatment and pain relief',
      drugIndicationMeddra: '10019211', // Headache
      actionDrug: '1', // Drug withdrawn
      drugReactionAssessed: 'Headache',
      drugRelatedness: '2', // Probable/Likely
      drugReactionInterval: '2',
      drugReactionIntervalUnit: 'h',
      drugRecurrence: '3', // Unknown
      drugAdditionalInfo: 'Patient had no previous history of aspirin sensitivity',
      drugAdditionalInfoText: 'Patient reported taking medication on empty stomach despite instructions. No known drug allergies or contraindications.',
      
      // H Narrative
      narrativeText: 'A 44-year-old male patient presented with severe headache and was prescribed Aspirin 500mg twice daily. Approximately 2 hours after the first dose, the patient developed severe headache, nausea, and dizziness. The symptoms persisted for 4 days. The medication was discontinued and symptoms gradually resolved. Blood tests performed during the event showed normal results. The patient recovered completely without sequelae.',
      reporterComments: 'Patient had no previous adverse reactions to aspirin. Temporal relationship suggests drug-related adverse event.',
      senderDiagnosis: 'Drug-induced headache and nausea',
      senderDiagnosisMeddra: '10013663', // Drug toxicity
      senderComments: 'Case assessed as probably related to aspirin administration. Patient counseled on proper medication administration with food.',
      caseSummaryNative: 'Paciente de 44 años desarrolló cefalea severa y náuseas tras tomar aspirina',
      caseSummaryLanguage: 'es'
    });
    
    console.log('Comprehensive sample data filled');
  }
}