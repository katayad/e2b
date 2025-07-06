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
  messageNumber?: string;
  senderIdentifier?: string;
  receiverIdentifier?: string;
  reportId?: string;
  reportType?: string;
  
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
  safetyReportId?: string;
  safetyReportVersion?: string;
  dateOfCreation?: string;
  typeOfReport?: string;
  dateReportFirstReceived?: string;
  dateReportMostRecent?: string;
  additionalDocuments?: string;
  fulfilLocalCriteria?: string;
  worldwideUniqueId?: string;
  firstSender?: string;
  linkedReportId?: string;
  nullificationAmendment?: string;
  
  // Geographic Information
  primarySourceCountry?: string;
  occurCountry?: string;
  
  // Dates
  receiveDate?: string;
  receiptDate?: string;
  
  // Seriousness Criteria
  seriousnessDeath?: string;
  seriousnessLifeThreatening?: string;
  seriousnessHospitalization?: string;
  seriousnessDisabling?: string;
  seriousnessCongenitalAnomali?: string;
  seriousnessOther?: string;
  
  // Company Information
  companyNumber?: string;
  
  // C.2 Reporter Information
  reporterTitle?: string;
  reporterGiveName?: string;
  reporterFamilyName?: string;
  reporterOrganization?: string;
  reporterStreet?: string;
  reporterCity?: string;
  reporterState?: string;
  reporterPostcode?: string;
  reporterCountry?: string;
  reporterTelephone?: string;
  reporterFax?: string;
  reporterEmail?: string;
  reporterQualification?: string;
  primarySourceRegulatory?: string;
  
  // C.3 Sender Information
  senderType?: string;
  senderOrganization?: string;
  personResponsible?: string;
  senderAddress?: string;
  senderCity?: string;
  senderState?: string;
  senderPostcode?: string;
  senderCountry?: string;
  senderTelephone?: string;
  senderFax?: string;
  senderEmail?: string;
  
  // C.4 Literature Reference
  literatureReference?: string;
  includedDocuments?: string;
  
  // C.5 Study Information
  studyRegistrationNumber?: string;
  studyRegistrationCountry?: string;
  studyName?: string;
  sponsorStudyNumber?: string;
  studyTypeReaction?: string;
  
  // D Patient Information
  patientInitial?: string;
  patientMedicalRecordNumber?: string;
  patientBirthdate?: string;
  patientAge?: string;
  patientAgeUnit?: string;
  gestationPeriod?: string;
  patientAgeGroup?: string;
  patientWeight?: string;
  patientHeight?: string;
  patientSex?: string;
  lastMenstrualDate?: string;
  
  // D.7 Medical History
  medicalHistoryText?: string;
  medicalHistoryMeddra?: string;
  medicalHistoryStartDate?: string;
  medicalHistoryEndDate?: string;
  concomitantTherapy?: string;
  
  // D.8 Past Drug History
  pastDrugName?: string;
  pastDrugMpid?: string;
  pastDrugPhpid?: string;
  pastDrugStartDate?: string;
  pastDrugEndDate?: string;
  pastDrugIndication?: string;
  pastDrugReaction?: string;
  
  // D.9 Death Information
  deathDate?: string;
  deathCause?: string;
  deathCauseMeddra?: string;
  autopsyDone?: string;
  autopsyCause?: string;
  
  // D.10 Parent Information
  parentId?: string;
  parentBirthdate?: string;
  parentAge?: string;
  parentMenstrualDate?: string;
  parentWeight?: string;
  parentHeight?: string;
  parentSex?: string;
  parentMedicalHistory?: string;
  
  // E Reaction Information
  primarySourceReaction?: string;
  reactionNativeLanguage?: string;
  reactionTranslation?: string;
  reactionMeddrapt?: string;
  reactionMeddrallt?: string;
  termHighlighted?: string;
  reactionStartDate?: string;
  reactionEndDate?: string;
  reactionDuration?: string;
  reactionOutcome?: string;
  medicalConfirmation?: string;
  reactionCountry?: string;
  
  // F Test Results
  testDate?: string;
  testName?: string;
  testNameMeddra?: string;
  testResult?: string;
  testResultCode?: string;
  testResultValue?: string;
  testResultUnit?: string;
  testResultText?: string;
  testNormalLow?: string;
  testNormalHigh?: string;
  testComments?: string;
  testMoreInfo?: string;
  
  // G Drug Information
  drugRole?: string;
  medicinalProduct?: string;
  drugMpid?: string;
  drugPhpid?: string;
  substanceIdentifier?: string;
  substanceStrength?: string;
  drugBatchNumb?: string;
  drugAuthorizationNumb?: string;
  drugAuthorizationCountry?: string;
  drugAuthorizationHolder?: string;
  drugDoseNumber?: string;
  drugDoseUnit?: string;
  drugDoseInterval?: string;
  drugDoseIntervalUnit?: string;
  drugStartDate?: string;
  drugEndDate?: string;
  drugDuration?: string;
  drugDosageText?: string;
  drugDosageForm?: string;
  drugAdministrationRoute?: string;
  drugParentRoute?: string;
  drugCumulativeDose?: string;
  drugGestationPeriod?: string;
  drugIndication?: string;
  drugIndicationMeddra?: string;
  actionDrug?: string;
  drugReactionAssessed?: string;
  drugRelatedness?: string;
  drugReactionInterval?: string;
  drugRecurrence?: string;
  drugAdditionalInfo?: string;
  drugAdditionalInfoText?: string;
  
  // H Narrative
  narrativeText?: string;
  reporterComments?: string;
  senderDiagnosis?: string;
  senderDiagnosisMeddra?: string;
  senderComments?: string;
  caseSummaryNative?: string;
  caseSummaryLanguage?: string;
}

export interface ReportResponse {
  reports: Report[];
  total: number;
  totalPages: number;
}