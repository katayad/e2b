export interface Report {
  id: number;
  title: string;
  filename: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

export interface ReportData {
  // Basic Report Information
  title: string;
  
  // N.1 Batch Information
  batchNumber?: string;
  batchSenderIdentifier?: string;
  batchReceiverIdentifier?: string;
  batchTransmissionDate?: string;
  
  // N.2 Message Header
  messageIdentifier?: string;
  messageSenderIdentifier?: string;
  messageReceiverIdentifier?: string;
  messageCreationDate?: string;
  
  // C.1 Case Safety Report Identification
  senderSafetyReportId?: string; // C.1.1 - Required format: "country-company-reportnumber"
  dateOfCreation?: string; // C.1.2 - Required with format CCYYMMDDHHMMSS
  typeOfReport?: string; // C.1.3 - Required: 1=Spontaneous, 2=Study, 3=Other, 4=Not available
  dateReportFirstReceived?: string; // C.1.4 - Required CCYYMMDD minimum
  dateReportMostRecent?: string; // C.1.5 - Required CCYYMMDD minimum
  additionalDocuments?: string; // C.1.6.1 - boolean
  documentsHeld?: string; // C.1.6.1.r.1 - free text
  fulfilLocalCriteria?: string; // C.1.7 - Required boolean
  worldwideUniqueId?: string; // C.1.8.1 - Required
  firstSender?: string; // C.1.8.2 - Required: 1=Regulator, 2=Other
  otherCaseIds?: string; // C.1.9.1 - boolean
  linkedReportId?: string; // C.1.10.r
  nullificationAmendment?: string; // C.1.11.1 - 1=Nullification, 2=Amendment
  nullificationReason?: string; // C.1.11.2
  
  // Geographic Information
  primarySourceCountry?: string; // Required - ISO 3166-1 alpha-2
  occurCountry?: string;
  
  // Legacy fields for backward compatibility
  safetyReportId?: string;
  safetyReportVersion?: string;
  receiveDate?: string;
  receiptDate?: string;
  companyNumber?: string;
  
  // C.2.r Reporter Information (Primary Source)
  reporterTitle?: string;
  reporterGiveName?: string;
  reporterFamilyName?: string;
  reporterOrganization?: string;
  reporterStreet?: string;
  reporterCity?: string;
  reporterState?: string;
  reporterPostcode?: string;
  reporterCountry?: string; // C.2.r.3 - Required - ISO 3166-1 alpha-2
  reporterTelephone?: string;
  reporterFax?: string;
  reporterEmail?: string;
  reporterQualification?: string; // C.2.r.4 - ICH codes: 1=Physician, 2=Pharmacist, 3=Other health prof, 4=Lawyer, 5=Consumer
  primarySourceRegulatory?: string; // C.2.r.5 - boolean
  
  // C.3 Sender Information
  senderType?: string; // C.3.1 - ICH codes: 1=Pharma, 2=Regulator, 3=Health prof, 4=Regional PV, 5=WHO, 6=Other
  senderOrganization?: string; // C.3.2
  personResponsible?: string; // C.3.3
  senderAddress?: string;
  senderCity?: string;
  senderState?: string;
  senderPostcode?: string;
  senderCountry?: string;
  senderTelephone?: string;
  senderFax?: string;
  senderEmail?: string;
  
  // C.4 Literature Reference
  literatureReference?: string; // C.4.r.1
  includedDocuments?: string; // C.4.r.2 - boolean
  
  // C.5 Study Information
  studyRegistrationNumber?: string; // C.5.1.r.1
  studyRegistrationCountry?: string; // C.5.1.r.2 - ISO 3166-1 alpha-2
  studyName?: string; // C.5.2
  sponsorStudyNumber?: string; // C.5.3
  studyTypeReaction?: string; // C.5.4
  
  // D Patient Information
  patientInitial?: string; // D.1 - Required for minimum criteria
  patientMedicalRecordNumber?: string; // D.1.1
  patientBirthdate?: string; // D.2.1 - format CCYYMMDD
  patientAge?: string; // D.2.2
  patientAgeUnit?: string; // D.2.2b - ICH codes: 801=Year, 802=Month, 803=Week, 804=Day, 805=Hour
  gestationPeriod?: string; // D.2.2.1a
  gestationPeriodUnit?: string; // D.2.2.1b
  patientAgeGroup?: string; // D.2.3
  patientWeight?: string; // D.3 in kg
  patientHeight?: string; // D.4 in cm
  patientSex?: string; // D.5 - ISO 5218: 0=Unknown, 1=Male, 2=Female
  lastMenstrualDate?: string; // D.6 - format CCYYMMDD
  
  // D.7 Medical History
  medicalHistoryText?: string; // D.7.2
  medicalHistoryMeddra?: string; // D.7.1.r.1b - MedDRA code
  medicalHistoryStartDate?: string;
  medicalHistoryEndDate?: string;
  concomitantTherapy?: string; // D.7.3
  
  // D.8 Past Drug History
  pastDrugName?: string; // D.8.r.1
  pastDrugMpid?: string; // D.8.r.2b - ISO IDMP MPID
  pastDrugPhpid?: string; // D.8.r.3b - ISO IDMP PhPID
  pastDrugStartDate?: string; // D.8.r.4
  pastDrugEndDate?: string; // D.8.r.5
  pastDrugIndication?: string; // D.8.r.6a
  pastDrugIndicationMeddra?: string; // D.8.r.6b - MedDRA code
  pastDrugReaction?: string; // D.8.r.7a
  pastDrugReactionMeddra?: string; // D.8.r.7b - MedDRA code
  
  // D.9 Death Information
  deathDate?: string; // D.9.1 - format CCYYMMDD
  deathCause?: string; // D.9.2.r.2
  deathCauseMeddra?: string; // D.9.2.r.1b - MedDRA code
  autopsyDone?: string; // D.9.3 - 1=Yes, 2=No, 3=Unknown
  autopsyCause?: string; // D.9.4.r
  
  // D.10 Parent Information (for parent-child/foetus reports)
  parentId?: string; // D.10.1
  parentBirthdate?: string; // D.10.2.1
  parentAge?: string; // D.10.2.2
  parentAgeUnit?: string; // D.10.2.2b
  parentMenstrualDate?: string; // D.10.3
  parentWeight?: string; // D.10.4
  parentHeight?: string; // D.10.5
  parentSex?: string; // D.10.6 - ISO 5218
  parentMedicalHistory?: string; // D.10.7.2
  
  // E.i Reaction Information (Required - at least one adverse event)
  primarySourceReaction?: string; // E.i.1 - Required
  reactionNativeLanguage?: string; // E.i.1.1a
  reactionTranslation?: string; // E.i.1.2
  reactionMeddrapt?: string; // E.i.2.1b - MedDRA PT code
  reactionMeddrallt?: string; // E.i.2.1a - MedDRA LLT code
  termHighlighted?: string; // E.i.3.1 - ICH codes: 1=Yes, 2=No
  reactionStartDate?: string; // E.i.4 - format CCYYMMDD minimum
  reactionEndDate?: string; // E.i.5 - format CCYYMMDD
  reactionDuration?: string; // E.i.6
  reactionDurationUnit?: string; // E.i.6b - UCUM units
  reactionOutcome?: string; // E.i.7 - ICH codes: 1=Recovered, 2=Recovering, 3=Not recovered, 4=Fatal, 5=Unknown
  medicalConfirmation?: string; // E.i.8 - boolean
  reactionCountry?: string; // E.i.9 - ISO 3166-1 alpha-2
  
  // Seriousness Criteria (E.i.3.2)
  seriousnessDeath?: string; // E.i.3.2a - 1=Yes, 2=No
  seriousnessLifeThreatening?: string; // E.i.3.2b - 1=Yes, 2=No
  seriousnessHospitalization?: string; // E.i.3.2c - 1=Yes, 2=No
  seriousnessDisabling?: string; // E.i.3.2d - 1=Yes, 2=No
  seriousnessCongenitalAnomali?: string; // E.i.3.2e - 1=Yes, 2=No
  seriousnessOther?: string; // E.i.3.2f - 1=Yes, 2=No
  
  // F.r Test Results
  testDate?: string; // F.r.1 - format CCYYMMDD
  testName?: string; // F.r.2.1
  testNameMeddra?: string; // F.r.2.2b - MedDRA code
  testResult?: string; // F.r.3
  testResultCode?: string; // F.r.3.1
  testResultValue?: string; // F.r.3.2
  testResultUnit?: string; // F.r.3.3 - UCUM units
  testResultText?: string; // F.r.3.4
  testNormalLow?: string; // F.r.4
  testNormalHigh?: string; // F.r.5
  testComments?: string; // F.r.6
  testMoreInfo?: string; // F.r.7 - boolean
  
  // G.k Drug Information (Required - at least one suspect drug)
  drugRole?: string; // G.k.1 - ICH codes: 1=Suspect, 2=Concomitant, 3=Interacting
  medicinalProduct?: string; // G.k.2.2 - Required
  drugMpid?: string; // G.k.2.1.1b - ISO IDMP MPID
  drugPhpid?: string; // G.k.2.1.2b - ISO IDMP PhPID
  substanceIdentifier?: string; // G.k.2.3.r.2b - ISO IDMP Substance
  substanceStrength?: string; // G.k.2.3.r.3a
  substanceStrengthUnit?: string; // G.k.2.3.r.3b - UCUM units
  drugBatchNumb?: string; // G.k.4.r.7
  drugAuthorizationNumb?: string; // G.k.3.1
  drugAuthorizationCountry?: string; // G.k.3.2 - ISO 3166-1 alpha-2
  drugAuthorizationHolder?: string; // G.k.3.3
  drugDoseNumber?: string; // G.k.4.r.1a
  drugDoseUnit?: string; // G.k.4.r.1b - UCUM units
  drugDoseInterval?: string; // G.k.4.r.2
  drugDoseIntervalUnit?: string; // G.k.4.r.3 - UCUM units
  drugStartDate?: string; // G.k.4.r.4 - format CCYYMMDD minimum
  drugEndDate?: string; // G.k.4.r.5 - format CCYYMMDD
  drugDuration?: string; // G.k.4.r.6
  drugDurationUnit?: string; // G.k.4.r.6b - UCUM units
  drugDosageText?: string; // G.k.4.r.8 - Required if no structured dose
  drugDosageForm?: string; // G.k.4.r.9 - ISO IDMP codes
  drugAdministrationRoute?: string; // G.k.4.r.10 - E2B route codes
  drugParentRoute?: string; // G.k.4.r.11 - for parent-child reports
  drugCumulativeDose?: string; // G.k.5
  drugCumulativeDoseUnit?: string; // G.k.5b - UCUM units
  drugGestationPeriod?: string; // G.k.6
  drugGestationPeriodUnit?: string; // G.k.6b - UCUM units
  drugIndication?: string; // G.k.7.r.1
  drugIndicationMeddra?: string; // G.k.7.r.2b - MedDRA code
  actionDrug?: string; // G.k.8 - ICH codes: 1=Withdrawn, 2=Reduced, 3=Increased, 4=Not changed, 5=Unknown, 6=N/A
  drugReactionAssessed?: string; // G.k.9.i.1
  drugRelatedness?: string; // G.k.9.i.2 - ICH codes: 1=Certain, 2=Probable, 3=Possible, 4=Unlikely, 5=Conditional, 6=Unassessable
  drugReactionInterval?: string; // G.k.9.i.3
  drugReactionIntervalUnit?: string; // G.k.9.i.3.1b - UCUM units
  drugRecurrence?: string; // G.k.9.i.4 - ICH codes: 1=Yes, 2=No, 3=Unknown
  drugAdditionalInfo?: string; // G.k.10.r
  drugAdditionalInfoText?: string; // G.k.11
  
  // H Narrative Case Summary
  narrativeText?: string; // H.1 - Case narrative
  reporterComments?: string; // H.2 - Reporter's comments
  senderDiagnosis?: string; // H.3.r.1a - Sender's diagnosis
  senderDiagnosisMeddra?: string; // H.3.r.1b - MedDRA code
  senderComments?: string; // H.4 - Sender's comments
  caseSummaryNative?: string; // H.5.r.1a - Native language summary
  caseSummaryLanguage?: string; // H.5.r.1b - ISO 639-2 language code
}

export interface ReportResponse {
  reports: Report[];
  total: number;
  totalPages: number;
}