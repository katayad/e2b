import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class ReportsService {
  private readonly reportsDir = './reports';

  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {
    this.ensureReportsDirectory();
  }

  private ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private encryptContent(content: string, key: string): string {
    return CryptoJS.AES.encrypt(content, key).toString();
  }

  private decryptContent(encryptedContent: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedContent, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async create(
    title: string,
    e2bData: any,
    userId: number,
  ): Promise<Report> {
    const xmlContent = this.generateE2BXml(e2bData);
    const encryptionKey = this.generateEncryptionKey();
    const encryptedContent = this.encryptContent(xmlContent, encryptionKey);
    const filename = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.xml`;
    const filepath = path.join(this.reportsDir, filename);

    fs.writeFileSync(filepath, encryptedContent);

    const report = this.reportsRepository.create({
      title,
      xmlContent: '', // Store empty, actual content is in encrypted file
      encryptionKey,
      filename,
      metadata: e2bData,
      userId,
    });

    return this.reportsRepository.save(report);
  }

  async findAllByUser(userId: number, page: number = 1, limit: number = 10): Promise<{
    reports: Report[];
    total: number;
    totalPages: number;
  }> {
    const [reports, total] = await this.reportsRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      reports,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, userId: number): Promise<Report> {
    return this.reportsRepository.findOne({
      where: { id, userId },
    });
  }

  async getReportContent(id: number, userId: number): Promise<string> {
    const report = await this.findOne(id, userId);
    if (!report) {
      throw new Error('Report not found');
    }

    const filepath = path.join(this.reportsDir, report.filename);
    const encryptedContent = fs.readFileSync(filepath, 'utf8');
    return this.decryptContent(encryptedContent, report.encryptionKey);
  }

  async update(id: number, userId: number, e2bData: any): Promise<Report> {
    const report = await this.findOne(id, userId);
    if (!report) {
      throw new Error('Report not found');
    }

    const xmlContent = this.generateE2BXml(e2bData);
    const encryptedContent = this.encryptContent(xmlContent, report.encryptionKey);
    const filepath = path.join(this.reportsDir, report.filename);

    fs.writeFileSync(filepath, encryptedContent);

    report.metadata = e2bData;
    report.updatedAt = new Date();

    return this.reportsRepository.save(report);
  }

  async delete(id: number, userId: number): Promise<void> {
    const report = await this.findOne(id, userId);
    if (!report) {
      throw new Error('Report not found');
    }

    const filepath = path.join(this.reportsDir, report.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    await this.reportsRepository.delete(id);
  }

  private formatE2BDate(dateString: string): string {
    if (!dateString) return '';
    // Convert ISO date to E2B format CCYYMMDD
    const date = new Date(dateString);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private formatE2BDateTime(dateString: string): string {
    if (!dateString) return '';
    // Convert ISO datetime to E2B format CCYYMMDDHHMMSS
    const date = new Date(dateString);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private generateUniqueReportId(countryCode: string, companyName: string): string {
    // Generate E2B compliant unique ID: country-company-reportnumber
    const timestamp = Date.now();
    const cleanCompanyName = (companyName || 'E2BAPP').replace(/-/g, '_');
    return `${countryCode.toUpperCase()}-${cleanCompanyName}-${timestamp}`;
  }

  private escapeXml(text: any): string {
    if (!text && text !== 0) return '';
    // Convert to string if not already a string
    const str = typeof text === 'string' ? text : String(text);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private generateE2BXml(data: any): string {
    // Generate E2B(R3) compliant XML based on ICH specification
    const currentDateTime = this.formatE2BDateTime(new Date().toISOString());
    const currentDate = this.formatE2BDate(new Date().toISOString());
    
    // Generate required IDs if not provided
    const safetyReportId = data.senderSafetyReportId || 
      this.generateUniqueReportId(data.primarySourceCountry || 'US', 'E2BAPP');
    const worldwideUniqueId = data.worldwideUniqueId || safetyReportId;
    
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!-- E2B(R3) Individual Case Safety Report - Generated by E2B Application -->
<!-- Compliant with ICH E2B(R3) Implementation Guide -->
<ichicsr lang="en" xmlns="urn:hl7-org:v3" xmlns:mif="urn:hl7-org:v3/mif" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  
  <!-- N.1 ICH ICSR Transmission Identification (Batch Wrapper) -->
  <ichicsrmessageheader>
    <messagetype>ichicsr</messagetype>
    <messageformatversion>2.1</messageformatversion>
    <messageformatrelease>2.0</messageformatrelease>
    <!-- N.2.r.1 Message Identifier -->
    <messagenumb>${this.escapeXml(data.messageIdentifier || safetyReportId)}</messagenumb>
    <!-- N.2.r.2 Message Sender Identifier -->
    <messagesenderidentifier>${this.escapeXml(data.messageSenderIdentifier || data.batchSenderIdentifier || 'E2B-APP')}</messagesenderidentifier>
    <!-- N.2.r.3 Message Receiver Identifier -->
    <messagereceiveridentifier>${this.escapeXml(data.messageReceiverIdentifier || data.batchReceiverIdentifier || 'RECEIVER')}</messagereceiveridentifier>
    <messagedateformat>102</messagedateformat>
    <!-- N.2.r.4 Date of Message Creation (must equal C.1.2) -->
    <messagedate>${this.formatE2BDateTime(data.dateOfCreation) || this.formatE2BDateTime(data.messageCreationDate) || currentDateTime}</messagedate>
  </ichicsrmessageheader>
  
  <safetyreport>
    <!-- C.1.1 Sender's (case) Safety Report Unique Identifier -->
    <safetyreportid root="2.16.840.1.113883.3.989.2.1.3.1" extension="${this.escapeXml(safetyReportId)}"/>
    
    <!-- C.1.2 Date of Creation (required timestamp) -->
    <creationdate value="${this.formatE2BDateTime(data.dateOfCreation) || currentDateTime}"/>
    
    <!-- C.1.3 Type of Report (required) -->
    <reporttype code="${this.escapeXml(data.typeOfReport || '1')}" codeSystem="2.16.840.1.113883.3.989.2.1.1.2"/>
    
    <!-- C.1.4 Date Report Was First Received from Source (required) -->
    <firstreceivedate value="${this.formatE2BDate(data.dateReportFirstReceived) || currentDate}"/>
    
    <!-- C.1.5 Date of Most Recent Information for This Report (required) -->
    <mostrecentinfodate value="${this.formatE2BDate(data.dateReportMostRecent) || currentDate}"/>
    
    <!-- C.1.6.1 Are Additional Documents Available? -->
    <additionaldocument value="${this.escapeXml(data.additionalDocuments || 'false')}"/>
    ${data.documentsHeld ? `<documentsheld>${this.escapeXml(data.documentsHeld)}</documentsheld>` : ''}
    
    <!-- C.1.7 Does This Case Fulfil the Local Criteria for an Expedited Report? (required) -->
    <fulfillexpeditecriteria value="${this.escapeXml(data.fulfilLocalCriteria || 'true')}"/>
    
    <!-- C.1.8 Worldwide Unique Case Identification -->
    <worldwideuniquecaseidentification root="2.16.840.1.113883.3.989.2.1.3.2" extension="${this.escapeXml(worldwideUniqueId)}"/>
    <firstsender code="${this.escapeXml(data.firstSender || '2')}" codeSystem="2.16.840.1.113883.3.989.2.1.1.3"/>
    
    <!-- C.1.11 Report Nullification/Amendment -->
    ${data.nullificationAmendment ? `<nullificationamendment code="${this.escapeXml(data.nullificationAmendment)}" codeSystem="2.16.840.1.113883.3.989.2.1.1.5"/>` : ''}
    ${data.nullificationReason ? `<nullificationreason>${this.escapeXml(data.nullificationReason)}</nullificationreason>` : ''}
    
    <!-- Geographic Information -->
    <primarysourcecountry code="${this.escapeXml(data.primarySourceCountry || 'US')}" codeSystem="1.0.3166.1.2.2"/>
    ${data.occurCountry ? `<occurcountry code="${this.escapeXml(data.occurCountry)}" codeSystem="1.0.3166.1.2.2"/>` : ''}
    
    <!-- Determine if case is serious based on seriousness criteria -->
    <serious value="${(data.seriousnessDeath === '1' || data.seriousnessLifeThreatening === '1' || data.seriousnessHospitalization === '1' || data.seriousnessDisabling === '1' || data.seriousnessCongenitalAnomali === '1' || data.seriousnessOther === '1') ? 'true' : 'false'}"/>
    
    <!-- C.2.r Primary Source(s) of Information -->
    <primarysource>
      ${data.reporterTitle ? `<reportertitle>${this.escapeXml(data.reporterTitle)}</reportertitle>` : ''}
      ${data.reporterGiveName ? `<reportergivename>${this.escapeXml(data.reporterGiveName)}</reportergivename>` : ''}
      ${data.reporterFamilyName ? `<reporterfamilyname>${this.escapeXml(data.reporterFamilyName)}</reporterfamilyname>` : ''}
      ${data.reporterOrganization ? `<reporterorganization>${this.escapeXml(data.reporterOrganization)}</reporterorganization>` : ''}
      ${data.reporterStreet ? `<reporterstreet>${this.escapeXml(data.reporterStreet)}</reporterstreet>` : ''}
      ${data.reporterCity ? `<reportercity>${this.escapeXml(data.reporterCity)}</reportercity>` : ''}
      ${data.reporterState ? `<reporterstate>${this.escapeXml(data.reporterState)}</reporterstate>` : ''}
      ${data.reporterPostcode ? `<reporterpostcode>${this.escapeXml(data.reporterPostcode)}</reporterpostcode>` : ''}
      <!-- C.2.r.3 Reporter's Country Code (required) -->
      <reportercountry code="${this.escapeXml(data.reporterCountry || data.primarySourceCountry || 'US')}" codeSystem="1.0.3166.1.2.2"/>
      ${data.reporterTelephone ? `<reportertelephone>${this.escapeXml(data.reporterTelephone)}</reportertelephone>` : ''}
      ${data.reporterFax ? `<reporterfax>${this.escapeXml(data.reporterFax)}</reporterfax>` : ''}
      ${data.reporterEmail ? `<reporteremail>${this.escapeXml(data.reporterEmail)}</reporteremail>` : ''}
      <!-- C.2.r.4 Qualification -->
      <qualification code="${this.escapeXml(data.reporterQualification || '1')}" codeSystem="2.16.840.1.113883.3.989.2.1.1.6"/>
      <!-- C.2.r.5 Primary Source for Regulatory Purposes -->
      <primarysourceregulatory value="${this.escapeXml(data.primarySourceRegulatory || 'true')}"/>
    </primarysource>
    
    <!-- C.3 Information on Sender of Case Safety Report -->
    <sender>
      <!-- C.3.1 Sender Type -->
      <sendertype code="${this.escapeXml(data.senderType || '3')}" codeSystem="2.16.840.1.113883.3.989.2.1.1.7"/>
      <!-- C.3.2 Sender's Organisation -->
      ${data.senderOrganization ? `<senderorganization>${this.escapeXml(data.senderOrganization)}</senderorganization>` : ''}
      <!-- C.3.3 Person Responsible for Sending the Report -->
      ${data.personResponsible ? `<personresponsible>${this.escapeXml(data.personResponsible)}</personresponsible>` : ''}
      <!-- C.3.4 Sender's Address, Fax, Telephone and E-mail Address -->
      ${data.senderAddress ? `<senderaddress>${this.escapeXml(data.senderAddress)}</senderaddress>` : ''}
      ${data.senderCity ? `<sendercity>${this.escapeXml(data.senderCity)}</sendercity>` : ''}
      ${data.senderState ? `<senderstate>${this.escapeXml(data.senderState)}</senderstate>` : ''}
      ${data.senderPostcode ? `<senderpostcode>${this.escapeXml(data.senderPostcode)}</senderpostcode>` : ''}
      ${data.senderCountry ? `<sendercountry code="${this.escapeXml(data.senderCountry)}" codeSystem="1.0.3166.1.2.2"/>` : ''}
      ${data.senderTelephone ? `<sendertelephone>${this.escapeXml(data.senderTelephone)}</sendertelephone>` : ''}
      ${data.senderFax ? `<senderfax>${this.escapeXml(data.senderFax)}</senderfax>` : ''}
      ${data.senderEmail ? `<senderemail>${this.escapeXml(data.senderEmail)}</senderemail>` : ''}
    </sender>
    
    <!-- C.4.r Literature Reference(s) -->
    ${data.literatureReference ? `
    <literaturereference>
      <reference>${this.escapeXml(data.literatureReference)}</reference>
      <includeddocuments value="${this.escapeXml(data.includedDocuments || 'false')}"/>
    </literaturereference>` : ''}
    
    <!-- C.5 Study Identification -->
    ${data.studyRegistrationNumber || data.studyName || data.sponsorStudyNumber ? `
    <study>
      ${data.studyRegistrationNumber ? `<studyregistrationnumber root="2.16.840.1.113883.3.989.2.1.3.6" extension="${this.escapeXml(data.studyRegistrationNumber)}"/>` : ''}
      ${data.studyRegistrationCountry ? `<studyregistrationcountry code="${this.escapeXml(data.studyRegistrationCountry)}" codeSystem="1.0.3166.1.2.2"/>` : ''}
      ${data.studyName ? `<studyname>${this.escapeXml(data.studyName)}</studyname>` : ''}
      ${data.sponsorStudyNumber ? `<sponsorstudynumber root="2.16.840.1.113883.3.989.2.1.3.7" extension="${this.escapeXml(data.sponsorStudyNumber)}"/>` : ''}
      ${data.studyTypeReaction ? `<studytype>${this.escapeXml(data.studyTypeReaction)}</studytype>` : ''}
    </study>` : ''}
    
    <patient>
      <!-- D Patient Characteristics -->
      <!-- D.1 Patient (name or initials) - Required for minimum criteria -->
      ${data.patientInitial ? `<patientinitial>${this.escapeXml(data.patientInitial)}</patientinitial>` : ''}
      
      <!-- D.1.1 Patient Medical Record Number(s) -->
      ${data.patientMedicalRecordNumber ? `<patientmedicalrecordnumber root="2.16.840.1.113883.3.989.2.1.3.8" extension="${this.escapeXml(data.patientMedicalRecordNumber)}"/>` : ''}
      
      <!-- D.2 Age Information -->
      ${data.patientBirthdate ? `<patientbirthdate value="${this.formatE2BDate(data.patientBirthdate)}"/>` : ''}
      ${data.patientAge ? `<patientage value="${this.escapeXml(data.patientAge)}" unit="${this.escapeXml(data.patientAgeUnit || '801')}"/>` : ''}
      ${data.gestationPeriod ? `<gestationperiod value="${this.escapeXml(data.gestationPeriod)}" unit="${this.escapeXml(data.gestationPeriodUnit || '803')}"/>` : ''}
      ${data.patientAgeGroup ? `<patientagegroup>${this.escapeXml(data.patientAgeGroup)}</patientagegroup>` : ''}
      
      <!-- D.3 Body Weight (kg) -->
      ${data.patientWeight ? `<patientweight value="${this.escapeXml(data.patientWeight)}" unit="kg"/>` : ''}
      
      <!-- D.4 Height (cm) -->
      ${data.patientHeight ? `<patientheight value="${this.escapeXml(data.patientHeight)}" unit="cm"/>` : ''}
      
      <!-- D.5 Sex -->
      ${data.patientSex ? `<patientsex code="${this.escapeXml(data.patientSex)}" codeSystem="1.0.5218"/>` : ''}
      
      <!-- D.6 Last Menstrual Period Date -->
      ${data.lastMenstrualDate ? `<lastmenstrualdate value="${this.formatE2BDate(data.lastMenstrualDate)}"/>` : ''}
      
      <!-- D.7 Relevant Medical History and Concurrent Conditions -->
      ${data.medicalHistoryText ? `<medicalhistory>
        <medicalhistorytext>${this.escapeXml(data.medicalHistoryText)}</medicalhistorytext>
        ${data.medicalHistoryMeddra ? `<medicalhistorymeddra code="${this.escapeXml(data.medicalHistoryMeddra)}" codeSystem="2.16.840.1.113883.6.163"/>` : ''}
        ${data.medicalHistoryStartDate ? `<medicalhistorystartdate value="${this.formatE2BDate(data.medicalHistoryStartDate)}"/>` : ''}
        ${data.medicalHistoryEndDate ? `<medicalhistoryenddate value="${this.formatE2BDate(data.medicalHistoryEndDate)}"/>` : ''}
      </medicalhistory>` : ''}
      
      ${data.concomitantTherapy ? `<concomitanttherapy>${this.escapeXml(data.concomitantTherapy)}</concomitanttherapy>` : ''}
      
      <!-- D.8 Relevant Past Drug History -->
      ${data.pastDrugName ? `<pastdrughistory>
        <pastdrugname>${this.escapeXml(data.pastDrugName)}</pastdrugname>
        ${data.pastDrugMpid ? `<pastdrugmpid root="ISO11615 MPID" extension="${this.escapeXml(data.pastDrugMpid)}"/>` : ''}
        ${data.pastDrugPhpid ? `<pastdrugphpid root="ISO11616 PhPID" extension="${this.escapeXml(data.pastDrugPhpid)}"/>` : ''}
        ${data.pastDrugStartDate ? `<pastdrugstartdate value="${this.formatE2BDate(data.pastDrugStartDate)}"/>` : ''}
        ${data.pastDrugEndDate ? `<pastdrugenddate value="${this.formatE2BDate(data.pastDrugEndDate)}"/>` : ''}
        ${data.pastDrugIndication ? `<pastdrugindication>${this.escapeXml(data.pastDrugIndication)}</pastdrugindication>` : ''}
        ${data.pastDrugIndicationMeddra ? `<pastdrugindicationmeddra code="${this.escapeXml(data.pastDrugIndicationMeddra)}" codeSystem="2.16.840.1.113883.6.163"/>` : ''}
        ${data.pastDrugReaction ? `<pastdrugreaction>${this.escapeXml(data.pastDrugReaction)}</pastdrugreaction>` : ''}
        ${data.pastDrugReactionMeddra ? `<pastdrugreactionmeddra code="${this.escapeXml(data.pastDrugReactionMeddra)}" codeSystem="2.16.840.1.113883.6.163"/>` : ''}
      </pastdrughistory>` : ''}
      
      <!-- D.9 In Case of Death -->
      ${data.deathDate ? `<patientdeath>
        <deathdate value="${this.formatE2BDate(data.deathDate)}"/>
        ${data.deathCause ? `<deathcause>${this.escapeXml(data.deathCause)}</deathcause>` : ''}
        ${data.deathCauseMeddra ? `<deathcausemeddra code="${this.escapeXml(data.deathCauseMeddra)}" codeSystem="2.16.840.1.113883.6.163"/>` : ''}
        ${data.autopsyDone ? `<autopsydone code="${this.escapeXml(data.autopsyDone)}" codeSystem="2.16.840.1.113883.3.989.2.1.1.18"/>` : ''}
        ${data.autopsyCause ? `<autopsycause>${this.escapeXml(data.autopsyCause)}</autopsycause>` : ''}
      </patientdeath>` : ''}
      
      <!-- D.10 Parent Information (for parent-child/foetus reports) -->
      ${data.parentId || data.parentBirthdate || data.parentAge ? `<parent>
        ${data.parentId ? `<parentidentification>${this.escapeXml(data.parentId)}</parentidentification>` : ''}
        ${data.parentBirthdate ? `<parentbirthdate value="${this.formatE2BDate(data.parentBirthdate)}"/>` : ''}
        ${data.parentAge ? `<parentage value="${this.escapeXml(data.parentAge)}" unit="${this.escapeXml(data.parentAgeUnit || '801')}"/>` : ''}
        ${data.parentMenstrualDate ? `<parentmenstrualdate value="${this.formatE2BDate(data.parentMenstrualDate)}"/>` : ''}
        ${data.parentWeight ? `<parentweight value="${this.escapeXml(data.parentWeight)}" unit="kg"/>` : ''}
        ${data.parentHeight ? `<parentheight value="${this.escapeXml(data.parentHeight)}" unit="cm"/>` : ''}
        ${data.parentSex ? `<parentsex code="${this.escapeXml(data.parentSex)}" codeSystem="1.0.5218"/>` : ''}
        ${data.parentMedicalHistory ? `<parentmedicalhistory>${this.escapeXml(data.parentMedicalHistory)}</parentmedicalhistory>` : ''}
      </parent>` : ''}
      
      <!-- E.i REACTION(S)/EVENT(S) - Required: at least one adverse event -->
      <reaction>
        <!-- E.i.1 Reaction/Event as Reported by the Primary Source -->
        <primarysourcereaction>${this.escapeXml(data.primarySourceReaction || 'Adverse reaction')}</primarysourcereaction>
        
        ${data.reactionNativeLanguage ? `<!-- E.i.1.1a Reaction in Native Language -->
        <reactioninnativelanguage code="${this.escapeXml(data.caseSummaryLanguage || 'en')}" codeSystem="1.0.639.2">${this.escapeXml(data.reactionNativeLanguage)}</reactioninnativelanguage>` : ''}
        
        ${data.reactionTranslation ? `<!-- E.i.1.2 Reaction for Translation -->
        <reactionfortranslation>${this.escapeXml(data.reactionTranslation)}</reactionfortranslation>` : ''}
        
        <!-- E.i.2.1 Reaction/Event (MedDRA code) -->
        ${data.reactionMeddrapt ? `<reactionmeddrapt code="${this.escapeXml(data.reactionMeddrapt)}" codeSystem="2.16.840.1.113883.6.163"/>` : ''}
        ${data.reactionMeddrallt ? `<reactionmeddrallt code="${this.escapeXml(data.reactionMeddrallt)}" codeSystem="2.16.840.1.113883.6.163"/>` : ''}
        
        <!-- E.i.3.1 Term Highlighted by the Reporter -->
        ${data.termHighlighted ? `<termhighlighted code="${this.escapeXml(data.termHighlighted)}" codeSystem="2.16.840.1.113883.3.989.2.1.1.10"/>` : ''}
        
        <!-- E.i.3.2 Seriousness Criteria at Event Level -->
        <seriousnesscriteria>
          <seriousnessdeath code="${this.escapeXml(data.seriousnessDeath || '2')}"/>
          <seriousnesslifethreatening code="${this.escapeXml(data.seriousnessLifeThreatening || '2')}"/>
          <seriousnesshospitalization code="${this.escapeXml(data.seriousnessHospitalization || '2')}"/>
          <seriousnessdisabling code="${this.escapeXml(data.seriousnessDisabling || '2')}"/>
          <seriousnesscongenitalanomaly code="${this.escapeXml(data.seriousnessCongenitalAnomali || '2')}"/>
          <seriousnessother code="${this.escapeXml(data.seriousnessOther || '2')}"/>
        </seriousnesscriteria>
        
        <!-- E.i.4 Date of Start of Reaction/Event -->
        <reactionstartdate value="${this.formatE2BDate(data.reactionStartDate) || currentDate}"/>
        
        <!-- E.i.5 Date of End of Reaction/Event -->
        ${data.reactionEndDate ? `<reactionenddate value="${this.formatE2BDate(data.reactionEndDate)}"/>` : ''}
        
        <!-- E.i.6 Duration of Reaction/Event -->
        ${data.reactionDuration ? `<reactionduration value="${this.escapeXml(data.reactionDuration)}" unit="${this.escapeXml(data.reactionDurationUnit || '804')}"/>` : ''}
        
        <!-- E.i.7 Outcome of Reaction/Event at the Time of Last Observation -->
        <reactionoutcome code="${this.escapeXml(data.reactionOutcome || '5')}" codeSystem="2.16.840.1.113883.3.989.2.1.1.11"/>
        
        <!-- E.i.8 Medical Confirmation by Healthcare Professional -->
        ${data.medicalConfirmation ? `<medicalconfirmation value="${this.escapeXml(data.medicalConfirmation)}"/>` : ''}
        
        <!-- E.i.9 Identification of the Country Where the Reaction/Event Occurred -->
        ${data.reactionCountry ? `<reactioncountry code="${this.escapeXml(data.reactionCountry)}" codeSystem="1.0.3166.1.2.2"/>` : ''}
      </reaction>
      
      <!-- F.r Results of Tests and Procedures Relevant to the Investigation of the Patient -->
      ${data.testName ? `
      <test>
        <!-- F.r.1 Test Date -->
        <testdate value="${this.formatE2BDate(data.testDate) || currentDate}"/>
        
        <!-- F.r.2 Test Name -->
        <testname>${this.escapeXml(data.testName)}</testname>
        ${data.testNameMeddra ? `<testnamemeddra code="${this.escapeXml(data.testNameMeddra)}" codeSystem="2.16.840.1.113883.6.163"/>` : ''}
        
        <!-- F.r.3 Test Result -->
        ${data.testResult ? `<testresult>${this.escapeXml(data.testResult)}</testresult>` : ''}
        ${data.testResultCode ? `<testresultcode code="${this.escapeXml(data.testResultCode)}" codeSystem="2.16.840.1.113883.3.989.2.1.1.12"/>` : ''}
        ${data.testResultValue ? `<testresultvalue value="${this.escapeXml(data.testResultValue)}"/>` : ''}
        ${data.testResultUnit ? `<testresultunit code="${this.escapeXml(data.testResultUnit)}" codeSystem="2.16.840.1.113883.6.8"/>` : ''}
        ${data.testResultText ? `<testresulttext>${this.escapeXml(data.testResultText)}</testresulttext>` : ''}
        
        <!-- F.r.4 Normal Low Value -->
        ${data.testNormalLow ? `<testnormalrangelow value="${this.escapeXml(data.testNormalLow)}"/>` : ''}
        
        <!-- F.r.5 Normal High Value -->
        ${data.testNormalHigh ? `<testnormalrangehigh value="${this.escapeXml(data.testNormalHigh)}"/>` : ''}
        
        <!-- F.r.6 Comments (free text) -->
        ${data.testComments ? `<testcomment>${this.escapeXml(data.testComments)}</testcomment>` : ''}
        
        <!-- F.r.7 More Information Available -->
        ${data.testMoreInfo ? `<testmoreinfo value="${this.escapeXml(data.testMoreInfo)}"/>` : ''}
      </test>` : ''}
      
      <!-- G.k DRUG(S) INFORMATION - Required: at least one suspect drug -->
      <drug>
        <!-- G.k.1 Characterisation of Drug Role -->
        <drugcharacterization code="${this.escapeXml(data.drugRole || '1')}" codeSystem="2.16.840.1.113883.3.989.2.1.1.13"/>
        
        <!-- G.k.2 Drug Identification -->
        <!-- G.k.2.1.1b Medicinal Product Identifier (MPID) -->
        ${data.drugMpid ? `<drugmpid root="ISO11615 MPID" extension="${this.escapeXml(data.drugMpid)}"/>` : ''}
        
        <!-- G.k.2.1.2b Pharmaceutical Product Identifier (PhPID) -->
        ${data.drugPhpid ? `<drugphpid root="ISO11616 PhPID" extension="${this.escapeXml(data.drugPhpid)}"/>` : ''}
        
        <!-- G.k.2.2 Medicinal Product Name as Reported by the Primary Source -->
        <medicinalproduct>${this.escapeXml(data.medicinalProduct || 'Unknown Drug')}</medicinalproduct>
        
        <!-- G.k.2.3.r Substance/Specified Substance Identifier and Strength -->
        ${data.substanceIdentifier ? `<activesubstance>
          <substanceidentifier root="ISO11238 IDMP Substance" extension="${this.escapeXml(data.substanceIdentifier)}"/>
          ${data.substanceStrength ? `<substancestrength value="${this.escapeXml(data.substanceStrength)}" unit="${this.escapeXml(data.substanceStrengthUnit || 'mg')}"/>` : ''}
        </activesubstance>` : ''}
        
        <!-- G.k.3 Holder and Authorisation/Application Number of Drug -->
        ${data.drugAuthorizationNumb ? `<drugauthorization>
          <authorizationnumber root="2.16.840.1.113883.3.989.2.1.3.4" extension="${this.escapeXml(data.drugAuthorizationNumb)}"/>
          ${data.drugAuthorizationCountry ? `<authorizationcountry code="${this.escapeXml(data.drugAuthorizationCountry)}" codeSystem="1.0.3166.1.2.2"/>` : ''}
          ${data.drugAuthorizationHolder ? `<authorizationholder>${this.escapeXml(data.drugAuthorizationHolder)}</authorizationholder>` : ''}
        </drugauthorization>` : ''}
        
        <!-- G.k.4.r Dosage and Relevant Information -->
        <dosage>
          ${data.drugDoseNumber ? `<dose value="${this.escapeXml(data.drugDoseNumber)}" unit="${this.escapeXml(data.drugDoseUnit || 'mg')}"/>` : ''}
          ${data.drugDoseInterval ? `<dosageinterval value="${this.escapeXml(data.drugDoseInterval)}" unit="${this.escapeXml(data.drugDoseIntervalUnit || 'h')}"/>` : ''}
          
          <!-- G.k.4.r.4 Date and Time of Start of Drug -->
          <drugstartdate value="${this.formatE2BDate(data.drugStartDate) || currentDate}"/>
          
          <!-- G.k.4.r.5 Date and Time of Last Administration -->
          ${data.drugEndDate ? `<drugenddate value="${this.formatE2BDate(data.drugEndDate)}"/>` : ''}
          
          <!-- G.k.4.r.6 Duration of Drug Administration -->
          ${data.drugDuration ? `<drugduration value="${this.escapeXml(data.drugDuration)}" unit="${this.escapeXml(data.drugDurationUnit || 'd')}"/>` : ''}
          
          <!-- G.k.4.r.7 Batch/Lot Number -->
          ${data.drugBatchNumb ? `<batchnumber>${this.escapeXml(data.drugBatchNumb)}</batchnumber>` : ''}
          
          <!-- G.k.4.r.8 Dosage Text -->
          <dosagetext>${this.escapeXml(data.drugDosageText || 'Not specified')}</dosagetext>
          
          <!-- G.k.4.r.9 Pharmaceutical Dose Form -->
          ${data.drugDosageForm ? `<dosageform code="${this.escapeXml(data.drugDosageForm)}" codeSystem="ISO11239 IDMP Dosage Forms"/>` : ''}
          
          <!-- G.k.4.r.10 Route of Administration -->
          <administrationroute code="${this.escapeXml(data.drugAdministrationRoute || '065')}" codeSystem="2.16.840.1.113883.3.989.2.1.1.14"/>
          
          <!-- G.k.4.r.11 Parent Route of Administration -->
          ${data.drugParentRoute ? `<parentroute code="${this.escapeXml(data.drugParentRoute)}" codeSystem="2.16.840.1.113883.3.989.2.1.1.14"/>` : ''}
        </dosage>
        
        <!-- G.k.5 Cumulative Dose to First Reaction -->
        ${data.drugCumulativeDose ? `<cumulativedose value="${this.escapeXml(data.drugCumulativeDose)}" unit="${this.escapeXml(data.drugCumulativeDoseUnit || 'mg')}"/>` : ''}
        
        <!-- G.k.6 Gestation Period at Time of Exposure -->
        ${data.drugGestationPeriod ? `<gestationperiod value="${this.escapeXml(data.drugGestationPeriod)}" unit="${this.escapeXml(data.drugGestationPeriodUnit || 'wk')}"/>` : ''}
        
        <!-- G.k.7.r Indication for Use in Case -->
        ${data.drugIndication ? `<indication>
          <indicationtext>${this.escapeXml(data.drugIndication)}</indicationtext>
          ${data.drugIndicationMeddra ? `<indicationmeddra code="${this.escapeXml(data.drugIndicationMeddra)}" codeSystem="2.16.840.1.113883.6.163"/>` : ''}
        </indication>` : ''}
        
        <!-- G.k.8 Action(s) Taken with Drug -->
        <actiondrug code="${this.escapeXml(data.actionDrug || '5')}" codeSystem="2.16.840.1.113883.3.989.2.1.1.15"/>
        
        <!-- G.k.9.i Drug-reaction(s)/Event(s) Matrix -->
        <drugreactionmatrix>
          ${data.drugReactionAssessed ? `<reactionassessed>${this.escapeXml(data.drugReactionAssessed)}</reactionassessed>` : ''}
          ${data.drugRelatedness ? `<drugrelatedness code="${this.escapeXml(data.drugRelatedness)}" codeSystem="2.16.840.1.113883.3.989.2.1.1.17"/>` : ''}
          ${data.drugReactionInterval ? `<drugreactioninterval value="${this.escapeXml(data.drugReactionInterval)}" unit="${this.escapeXml(data.drugReactionIntervalUnit || 'h')}"/>` : ''}
          <drugrecurrence code="${this.escapeXml(data.drugRecurrence || '3')}" codeSystem="2.16.840.1.113883.3.989.2.1.1.16"/>
        </drugreactionmatrix>
        
        <!-- G.k.10.r Additional Information on Drug (coded) -->
        ${data.drugAdditionalInfo ? `<drugadditionalinfo code="${this.escapeXml(data.drugAdditionalInfo)}" codeSystem="2.16.840.1.113883.3.989.2.1.1.17"/>` : ''}
        
        <!-- G.k.11 Additional Information on Drug (free text) -->
        ${data.drugAdditionalInfoText ? `<drugadditionalinfotext>${this.escapeXml(data.drugAdditionalInfoText)}</drugadditionalinfotext>` : ''}
      </drug>
    </patient>
    
    <!-- H NARRATIVE CASE SUMMARY AND FURTHER INFORMATION -->
    <narrative>
      <!-- H.1 Case Narrative Including Clinical Course, Therapeutic Measures, Outcome and Additional Relevant Information -->
      ${data.narrativeText ? `<casenarrativeclinical>${this.escapeXml(data.narrativeText)}</casenarrativeclinical>` : ''}
      
      <!-- H.2 Reporter's Comments -->
      ${data.reporterComments ? `<reportercomments>${this.escapeXml(data.reporterComments)}</reportercomments>` : ''}
      
      <!-- H.3.r Sender's Diagnosis (MedDRA code) -->
      ${data.senderDiagnosis ? `<senderdiagnosis>
        <diagnosistext>${this.escapeXml(data.senderDiagnosis)}</diagnosistext>
        ${data.senderDiagnosisMeddra ? `<diagnosismeddra code="${this.escapeXml(data.senderDiagnosisMeddra)}" codeSystem="2.16.840.1.113883.6.163"/>` : ''}
      </senderdiagnosis>` : ''}
      
      <!-- H.4 Sender's Comments -->
      ${data.senderComments ? `<sendercomments>${this.escapeXml(data.senderComments)}</sendercomments>` : ''}
      
      <!-- H.5.r Case Summary and Reporter's Comments in Native Language -->
      ${data.caseSummaryNative ? `<casesummarynative>
        <casesummarytext>${this.escapeXml(data.caseSummaryNative)}</casesummarytext>
        <casesummarylanguage code="${this.escapeXml(data.caseSummaryLanguage || 'en')}" codeSystem="1.0.639.2"/>
      </casesummarynative>` : ''}
    </narrative>
  </safetyreport>
</ichicsr>`;

    return xmlContent;
  }
}