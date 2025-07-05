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
  
  // Reporter Information
  reporterTitle?: string;
  reporterGiveName?: string;
  reporterFamilyName?: string;
  reporterOrganization?: string;
  reporterStreet?: string;
  reporterCity?: string;
  reporterState?: string;
  reporterPostcode?: string;
  reporterCountry?: string;
  
  // Patient Information
  patientInitial?: string;
  patientBirthdate?: string;
  patientAge?: string;
  patientSex?: string;
  patientWeight?: string;
  patientHeight?: string;
  
  // Reaction Information
  primarySourceReaction?: string;
  reactionMeddrapt?: string;
  reactionMeddrallt?: string;
  reactionStartDate?: string;
  reactionEndDate?: string;
  reactionDuration?: string;
  reactionOutcome?: string;
  
  // Drug Information
  medicinalProduct?: string;
  drugBatchNumb?: string;
  drugAuthorizationNumb?: string;
  drugDosageText?: string;
  drugDosageForm?: string;
  drugAdministrationRoute?: string;
  drugIndication?: string;
  drugStartDate?: string;
  drugEndDate?: string;
  actionDrug?: string;
  drugRecurrence?: string;
}

export interface ReportResponse {
  reports: Report[];
  total: number;
  totalPages: number;
}