// E2B(R3) Code Lists and Constants based on ICH Implementation Guide

export const E2B_CODES = {
  // N.1.1 Type of Messages in Batch
  MESSAGE_TYPE: {
    ICHICSR: '1'
  },

  // C.1.3 Type of Report
  REPORT_TYPE: {
    SPONTANEOUS: '1',
    STUDY: '2', 
    OTHER: '3',
    NOT_AVAILABLE: '4'
  },

  // C.1.8.2 First Sender of This Case
  FIRST_SENDER: {
    REGULATOR: '1',
    OTHER: '2'
  },

  // C.2.r.4 Qualification
  QUALIFICATION: {
    PHYSICIAN: '1',
    PHARMACIST: '2',
    OTHER_HEALTH_PROFESSIONAL: '3',
    LAWYER: '4',
    CONSUMER_NON_HEALTH: '5'
  },

  // C.3.1 Sender Type
  SENDER_TYPE: {
    PHARMACEUTICAL_COMPANY: '1',
    REGULATORY_AUTHORITY: '2',
    HEALTH_PROFESSIONAL: '3',
    REGIONAL_PHARMACOVIGILANCE: '4',
    WHO_COLLABORATING: '5',
    OTHER: '6'
  },

  // D.2.2b Age Unit (ICH constrained UCUM codes)
  AGE_UNIT: {
    YEAR: '801',
    MONTH: '802',
    WEEK: '803',
    DAY: '804',
    HOUR: '805'
  },

  // D.5 Sex (ISO 5218)
  SEX: {
    UNKNOWN: '0',
    MALE: '1',
    FEMALE: '2'
  },

  // E.i.3.1 Term Highlighted by Reporter
  TERM_HIGHLIGHTED: {
    NO: '2',
    YES: '1'
  },

  // E.i.7 Outcome of Reaction/Event
  REACTION_OUTCOME: {
    RECOVERED: '1',
    RECOVERING: '2',
    NOT_RECOVERED: '3',
    FATAL: '4',
    UNKNOWN: '5'
  },

  // G.k.1 Characterisation of Drug Role
  DRUG_ROLE: {
    SUSPECT: '1',
    CONCOMITANT: '2',
    INTERACTING: '3'
  },

  // G.k.8 Action Taken with Drug
  ACTION_DRUG: {
    WITHDRAWN: '1',
    DOSE_REDUCED: '2',
    DOSE_INCREASED: '3',
    DOSE_NOT_CHANGED: '4',
    UNKNOWN: '5',
    NOT_APPLICABLE: '6'
  },

  // G.k.9.i.2 Assessment of Relatedness
  DRUG_RELATEDNESS: {
    CERTAIN: '1',
    PROBABLE_LIKELY: '2',
    POSSIBLE: '3',
    UNLIKELY: '4',
    CONDITIONAL_UNCLASSIFIED: '5',
    UNASSESSABLE: '6'
  },

  // G.k.9.i.4 Did Reaction Recur on Re-administration
  DRUG_RECURRENCE: {
    YES: '1',
    NO: '2',
    UNKNOWN: '3'
  },

  // Seriousness Criteria
  SERIOUSNESS: {
    NO: '2',
    YES: '1'
  },

  // Boolean values
  BOOLEAN: {
    FALSE: 'false',
    TRUE: 'true'
  },

  // Route of Administration (E2B codes)
  ROUTE_ADMIN: {
    AURICULAR: '001',
    BUCCAL: '002',
    CUTANEOUS: '003',
    DENTAL: '004',
    ENDOCERVICAL: '005',
    ENDOSINUSIAL: '006',
    ENDOTRACHEAL: '007',
    EPIDURAL: '008',
    EXTRA_AMNIOTIC: '009',
    HEMODIALYSIS: '010',
    INTRA_CORPUS_CAVERNOSUM: '011',
    INTRA_AMNIOTIC: '012',
    INTRA_ARTERIAL: '013',
    INTRA_ARTICULAR: '014',
    INTRA_UTERINE: '015',
    INTRACARDIAC: '016',
    INTRACAVERNOUS: '017',
    INTRACEREBRAL: '018',
    INTRACERVICAL: '019',
    INTRACISTERNAL: '020',
    INTRACORNEAL: '021',
    INTRACORONARY: '022',
    INTRADERMAL: '023',
    INTRADISCAL: '024',
    INTRAHEPATIC: '025',
    INTRALESIONAL: '026',
    INTRALYMPHATIC: '027',
    INTRAMEDULLAR: '028',
    INTRAMENINGEAL: '029',
    INTRAOCULAR: '030',
    INTRAPERICARDIAL: '031',
    INTRAPERITONEAL: '032',
    INTRAPLEURAL: '033',
    TOPICAL: '034',
    INTRASPINAL: '035',
    INTRASTERNAL: '036',
    INTRATHECAL: '037',
    INTRATHORACIC: '038',
    INTRATRACHEAL: '039',
    INTRATUMOR: '040',
    INTRATYMPANIC: '041',
    INTRAVASCULAR: '042',
    INTRAVENTRICULAR: '043',
    INTRAVESICAL: '044',
    IONTOPHORESIS: '045',
    NASAL: '046',
    INTRAVENOUS: '047',
    OCCLUSIVE_DRESSING: '048',
    OPHTHALMIC: '049',
    OROPHARYNGEAL: '050',
    OTHER: '051',
    PARENTERAL: '052',
    PERIARTICULAR: '053',
    PERINEURAL: '054',
    RECTAL: '055',
    RESPIRATORY: '056',
    RETROBULBAR: '057',
    INTRAMUSCULAR: '058',
    SUBARACHNOID: '059',
    SUBCONJUNCTIVAL: '060',
    SUBLINGUAL: '061',
    SUBMUCOSAL: '062',
    SUBCUTANEOUS: '063',
    TRANSDERMAL: '064',
    ORAL: '065',
    TRANSMUCOSAL: '066',
    TRANSPLACENTAL: '067',
    TRANSTRACHEAL: '068',
    TRANSTYMPANIC: '069',
    UNSPECIFIED: '070',
    URETHRAL: '071',
    VAGINAL: '072'
  }
};

// E2B OIDs (Object Identifiers)
export const E2B_OIDS = {
  // ICH ICSR message Codes
  TYPE_OF_MESSAGES: '2.16.840.1.113883.3.989.2.1.1.1',
  TYPE_OF_REPORT: '2.16.840.1.113883.3.989.2.1.1.2',
  FIRST_SENDER: '2.16.840.1.113883.3.989.2.1.1.3',
  QUALIFICATION: '2.16.840.1.113883.3.989.2.1.1.6',
  SENDER_TYPE: '2.16.840.1.113883.3.989.2.1.1.7',
  TERM_HIGHLIGHTED: '2.16.840.1.113883.3.989.2.1.1.10',
  REACTION_OUTCOME: '2.16.840.1.113883.3.989.2.1.1.11',
  DRUG_ROLE: '2.16.840.1.113883.3.989.2.1.1.13',
  ACTION_DRUG: '2.16.840.1.113883.3.989.2.1.1.15',
  DRUG_RECURRENCE: '2.16.840.1.113883.3.989.2.1.1.16',
  DRUG_RELATEDNESS: '2.16.840.1.113883.3.989.2.1.1.17',

  // UCUM codes (constrained by ICH)
  AGE_UNIT: '2.16.840.1.113883.3.989.2.1.1.26',
  DURATION_UNIT: '2.16.840.1.113883.3.989.2.1.1.26',
  DOSE_UNIT: '2.16.840.1.113883.3.989.2.1.1.25',

  // Namespace OIDs
  BATCH_NUMBER: '2.16.840.1.113883.3.989.2.1.3.22',
  BATCH_SENDER_ID: '2.16.840.1.113883.3.989.2.1.3.13',
  BATCH_RECEIVER_ID: '2.16.840.1.113883.3.989.2.1.3.14',
  MESSAGE_SENDER_ID: '2.16.840.1.113883.3.989.2.1.3.11',
  MESSAGE_RECEIVER_ID: '2.16.840.1.113883.3.989.2.1.3.12',
  SAFETY_REPORT_ID: '2.16.840.1.113883.3.989.2.1.3.1',
  WORLDWIDE_UNIQUE_ID: '2.16.840.1.113883.3.989.2.1.3.2',

  // International Standards
  ISO_3166_COUNTRY: '1.0.3166.1.2.2',
  ISO_5218_SEX: '1.0.5218',
  ISO_639_LANGUAGE: '1.0.639.2',
  MEDDRA: '2.16.840.1.113883.6.163',
  UCUM: '2.16.840.1.113883.6.8'
};

// Helper functions for E2B compliance
export class E2BUtils {
  
  // Format date according to E2B specification: CCYYMMDDHHMMSS
  static formatE2BDateTime(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // Format date for minimum precision fields (CCYYMMDD)
  static formatE2BDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}${month}${day}`;
  }

  // Generate unique report identifier (C.1.1 format)
  static generateReportId(countryCode: string, companyName: string, reportNumber: string): string {
    // Format: country-company-reportnumber (avoid dashes in company name)
    const cleanCompanyName = companyName.replace(/-/g, '_');
    return `${countryCode.toUpperCase()}-${cleanCompanyName}-${reportNumber}`;
  }

  // Validate required minimum information
  static validateMinimumCriteria(data: any): string[] {
    const errors: string[] = [];
    
    // At least one identifiable patient
    if (!data.patientInitial && !data.patientAge && !data.patientSex) {
      errors.push('At least one patient identifier required (initials, age, or sex)');
    }
    
    // At least one identifiable reporter
    if (!data.reporterGiveName && !data.reporterFamilyName && !data.reporterOrganization) {
      errors.push('At least one reporter identifier required (name or organization)');
    }
    
    // At least one adverse event
    if (!data.primarySourceReaction) {
      errors.push('At least one adverse event/reaction required');
    }
    
    // At least one suspect drug
    if (!data.medicinalProduct) {
      errors.push('At least one suspect drug required');
    }
    
    return errors;
  }

  // Validate E2B required fields
  static validateRequiredFields(data: any): string[] {
    const errors: string[] = [];
    
    // Administrative required fields
    if (!data.senderSafetyReportId) errors.push('Sender Safety Report ID (C.1.1) is required');
    if (!data.dateOfCreation) errors.push('Date of Creation (C.1.2) is required');
    if (!data.typeOfReport) errors.push('Type of Report (C.1.3) is required');
    if (!data.dateReportFirstReceived) errors.push('Date Report First Received (C.1.4) is required');
    if (!data.dateReportMostRecent) errors.push('Date of Most Recent Information (C.1.5) is required');
    if (!data.fulfilLocalCriteria) errors.push('Fulfil Local Criteria (C.1.7) is required');
    if (!data.worldwideUniqueId) errors.push('Worldwide Unique Case ID (C.1.8.1) is required');
    if (!data.firstSender) errors.push('First Sender (C.1.8.2) is required');
    if (!data.reporterCountry) errors.push('Reporter Country Code (C.2.r.3) is required');
    
    return errors;
  }
}