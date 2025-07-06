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
    // Generate FDA-compliant E2B(R3) XML with all user-entered form data
    const currentDateTime = this.formatE2BDateTime(new Date().toISOString());
    const currentDate = this.formatE2BDate(new Date().toISOString());
    
    // Generate required IDs if not provided
    const safetyReportId = data.senderSafetyReportId || 
      this.generateUniqueReportId(data.primarySourceCountry || 'US', 'E2BAPP');
    
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ichicsr SYSTEM "http://eudravigilance.ema.europa.eu/dtd/icsr21xml.dtd">
<ichicsr lang="en">
<ichicsrmessageheader>
<messagetype>ichicsr</messagetype>
<messageformatversion>2.1</messageformatversion>
<messageformatrelease>2.0</messageformatrelease>
<messagenumb>${this.escapeXml(data.messageIdentifier || safetyReportId)}</messagenumb>
<messagesenderidentifier>${this.escapeXml(data.messageSenderIdentifier || 'E2B-APP')}</messagesenderidentifier>
<messagereceiveridentifier>${this.escapeXml(data.messageReceiverIdentifier || 'FDA')}</messagereceiveridentifier>
<messagedateformat>204</messagedateformat>
<messagedate>${data.messageDate ? this.formatE2BDateTime(data.messageDate) : currentDateTime}</messagedate>
</ichicsrmessageheader>
<safetyreport>
<safetyreportid>${this.escapeXml(safetyReportId)}</safetyreportid>
<receiptdate>${data.dateReportFirstReceived ? this.formatE2BDate(data.dateReportFirstReceived) : currentDate}</receiptdate>
<fulfillexpeditecriteria>${this.escapeXml(data.fulfilLocalCriteria || '1')}</fulfillexpeditecriteria>
<primarysourcecountry>${this.escapeXml(data.primarySourceCountry || 'US')}</primarysourcecountry>
<serious>${(data.seriousnessDeath === '1' || data.seriousnessLifeThreatening === '1' || data.seriousnessHospitalization === '1' || data.seriousnessDisabling === '1' || data.seriousnessCongenitalAnomali === '1' || data.seriousnessOther === '1') ? '1' : '2'}</serious>
${data.occurCountry ? `<occurcountry>${this.escapeXml(data.occurCountry)}</occurcountry>` : ''}
${data.transmissionDate ? `<transmissiondate>${this.formatE2BDate(data.transmissionDate)}</transmissiondate>` : ''}
${data.reportType ? `<reporttype>${this.escapeXml(data.reportType)}</reporttype>` : ''}
${data.firstSender ? `<authoritynumb>${this.escapeXml(data.firstSender)}</authoritynumb>` : ''}
${data.duplicate ? `<duplicate>${this.escapeXml(data.duplicate)}</duplicate>` : ''}
${data.linkedReportNumber ? `<linkedreport><linkreportnumb>${this.escapeXml(data.linkedReportNumber)}</linkreportnumb></linkedreport>` : ''}
<primarysource>
${data.reporterGiveName ? `<reportergivename>${this.escapeXml(data.reporterGiveName)}</reportergivename>` : ''}
${data.reporterMiddleName ? `<reportermiddlename>${this.escapeXml(data.reporterMiddleName)}</reportermiddlename>` : ''}
${data.reporterFamilyName ? `<reporterfamilyname>${this.escapeXml(data.reporterFamilyName)}</reporterfamilyname>` : ''}
${data.reporterOrganization ? `<reporterorganization>${this.escapeXml(data.reporterOrganization)}</reporterorganization>` : ''}
${data.reporterDepartment ? `<reporterdepartment>${this.escapeXml(data.reporterDepartment)}</reporterdepartment>` : ''}
${data.reporterStreet ? `<reporterstreet>${this.escapeXml(data.reporterStreet)}</reporterstreet>` : ''}
${data.reporterCity ? `<reportercity>${this.escapeXml(data.reporterCity)}</reportercity>` : ''}
${data.reporterState ? `<reporterstate>${this.escapeXml(data.reporterState)}</reporterstate>` : ''}
${data.reporterPostcode ? `<reporterpostcode>${this.escapeXml(data.reporterPostcode)}</reporterpostcode>` : ''}
<reportercountry>${this.escapeXml(data.reporterCountry || data.primarySourceCountry || 'US')}</reportercountry>
<qualification>${this.escapeXml(data.reporterQualification || '1')}</qualification>
${data.literatureReference ? `<literaturereference>${this.escapeXml(data.literatureReference)}</literaturereference>` : ''}
${data.studyName ? `<studyname>${this.escapeXml(data.studyName)}</studyname>` : ''}
${data.sponsorStudyNumber ? `<sponsorstudynumb>${this.escapeXml(data.sponsorStudyNumber)}</sponsorstudynumb>` : ''}
${data.observationDate ? `<observstudytype>${this.escapeXml(data.observationDate)}</observstudytype>` : ''}
</primarysource>
<sender>
<sendertype>${this.escapeXml(data.senderType || '3')}</sendertype>
<senderorganization>${this.escapeXml(data.senderOrganization || 'E2B Application')}</senderorganization>
${data.senderDepartment ? `<senderdepartment>${this.escapeXml(data.senderDepartment)}</senderdepartment>` : ''}
${data.senderTitle ? `<sendertitle>${this.escapeXml(data.senderTitle)}</sendertitle>` : ''}
${data.senderGiveName ? `<sendergivename>${this.escapeXml(data.senderGiveName)}</sendergivename>` : ''}
${data.senderMiddleName ? `<sendermiddlename>${this.escapeXml(data.senderMiddleName)}</sendermiddlename>` : ''}
${data.senderFamilyName ? `<senderfamilyname>${this.escapeXml(data.senderFamilyName)}</senderfamilyname>` : ''}
${data.senderStreetAddress ? `<senderstreetaddress>${this.escapeXml(data.senderStreetAddress)}</senderstreetaddress>` : ''}
${data.senderCity ? `<sendercity>${this.escapeXml(data.senderCity)}</sendercity>` : ''}
${data.senderState ? `<senderstate>${this.escapeXml(data.senderState)}</senderstate>` : ''}
${data.senderPostcode ? `<senderpostcode>${this.escapeXml(data.senderPostcode)}</senderpostcode>` : ''}
${data.senderCountry ? `<sendercountry>${this.escapeXml(data.senderCountry)}</sendercountry>` : ''}
${data.senderTel ? `<sendertel>${this.escapeXml(data.senderTel)}</sendertel>` : ''}
${data.senderTelExtension ? `<sendertelextension>${this.escapeXml(data.senderTelExtension)}</sendertelextension>` : ''}
${data.senderTelCountryCode ? `<sendertelcountrycode>${this.escapeXml(data.senderTelCountryCode)}</sendertelcountrycode>` : ''}
${data.senderFax ? `<senderfax>${this.escapeXml(data.senderFax)}</senderfax>` : ''}
${data.senderFaxExtension ? `<senderfaxextension>${this.escapeXml(data.senderFaxExtension)}</senderfaxextension>` : ''}
${data.senderFaxCountryCode ? `<senderfaxcountrycode>${this.escapeXml(data.senderFaxCountryCode)}</senderfaxcountrycode>` : ''}
${data.senderEmailAddress ? `<senderemailaddress>${this.escapeXml(data.senderEmailAddress)}</senderemailaddress>` : ''}
</sender>
<receiver>
<receivertype>${this.escapeXml(data.receiverType || '2')}</receivertype>
<receiverorganization>${this.escapeXml(data.receiverOrganization || 'FDA')}</receiverorganization>
${data.receiverDepartment ? `<receiverdepartment>${this.escapeXml(data.receiverDepartment)}</receiverdepartment>` : ''}
${data.receiverTitle ? `<receivertitle>${this.escapeXml(data.receiverTitle)}</receivertitle>` : ''}
${data.receiverGiveName ? `<receivergivename>${this.escapeXml(data.receiverGiveName)}</receivergivename>` : ''}
${data.receiverMiddleName ? `<receivermiddlename>${this.escapeXml(data.receiverMiddleName)}</receivermiddlename>` : ''}
${data.receiverFamilyName ? `<receiverfamilyname>${this.escapeXml(data.receiverFamilyName)}</receiverfamilyname>` : ''}
${data.receiverStreetAddress ? `<receiverstreetaddress>${this.escapeXml(data.receiverStreetAddress)}</receiverstreetaddress>` : ''}
${data.receiverCity ? `<receivercity>${this.escapeXml(data.receiverCity)}</receivercity>` : ''}
${data.receiverState ? `<receiverstate>${this.escapeXml(data.receiverState)}</receiverstate>` : ''}
${data.receiverPostcode ? `<receiverpostcode>${this.escapeXml(data.receiverPostcode)}</receiverpostcode>` : ''}
${data.receiverCountry ? `<receivercountry>${this.escapeXml(data.receiverCountry)}</receivercountry>` : ''}
${data.receiverTel ? `<receivertel>${this.escapeXml(data.receiverTel)}</receivertel>` : ''}
${data.receiverTelExtension ? `<receivertelextension>${this.escapeXml(data.receiverTelExtension)}</receivertelextension>` : ''}
${data.receiverTelCountryCode ? `<receivertelcountrycode>${this.escapeXml(data.receiverTelCountryCode)}</receivertelcountrycode>` : ''}
${data.receiverFax ? `<receiverfax>${this.escapeXml(data.receiverFax)}</receiverfax>` : ''}
${data.receiverFaxExtension ? `<receiverfaxextension>${this.escapeXml(data.receiverFaxExtension)}</receiverfaxextension>` : ''}
${data.receiverFaxCountryCode ? `<receiverfaxcountrycode>${this.escapeXml(data.receiverFaxCountryCode)}</receiverfaxcountrycode>` : ''}
${data.receiverEmailAddress ? `<receiveremailaddress>${this.escapeXml(data.receiverEmailAddress)}</receiveremailaddress>` : ''}
</receiver>
<patient>
${data.patientInitial ? `<patientinitial>${this.escapeXml(data.patientInitial)}</patientinitial>` : ''}
${data.patientGpMedicalRecordNumber ? `<patientgpmedicalrecordnumb>${this.escapeXml(data.patientGpMedicalRecordNumber)}</patientgpmedicalrecordnumb>` : ''}
${data.patientSpecialistRecordNumber ? `<patientspecialistrecordnumb>${this.escapeXml(data.patientSpecialistRecordNumber)}</patientspecialistrecordnumb>` : ''}
${data.patientHospitalRecordNumber ? `<patienthospitalrecordnumb>${this.escapeXml(data.patientHospitalRecordNumber)}</patienthospitalrecordnumb>` : ''}
${data.patientInvestigationNumber ? `<patientinvestigationnumb>${this.escapeXml(data.patientInvestigationNumber)}</patientinvestigationnumb>` : ''}
${data.patientBirthdate ? `<patientbirthdate>${this.formatE2BDate(data.patientBirthdate)}</patientbirthdate>` : ''}
${data.patientAge ? `<patientage>${this.escapeXml(data.patientAge)}</patientage>` : ''}
${data.patientAgeUnit ? `<patientagedateformat>${this.escapeXml(data.patientAgeUnit)}</patientagedateformat>` : ''}
${data.gestationPeriod ? `<gestationperiod>${this.escapeXml(data.gestationPeriod)}</gestationperiod>` : ''}
${data.gestationPeriodUnit ? `<gestationperiodunit>${this.escapeXml(data.gestationPeriodUnit)}</gestationperiodunit>` : ''}
${data.patientAgeGroup ? `<patientagegroup>${this.escapeXml(data.patientAgeGroup)}</patientagegroup>` : ''}
${data.patientWeight ? `<patientweight>${this.escapeXml(data.patientWeight)}</patientweight>` : ''}
${data.patientHeight ? `<patientheight>${this.escapeXml(data.patientHeight)}</patientheight>` : ''}
${data.patientSex ? `<patientsex>${this.escapeXml(data.patientSex)}</patientsex>` : ''}
${data.lastMenstrualDate ? `<lastmenstrualdate>${this.formatE2BDate(data.lastMenstrualDate)}</lastmenstrualdate>` : ''}
${data.medicalHistoryText ? `<medicalhistorytext>${this.escapeXml(data.medicalHistoryText)}</medicalhistorytext>` : ''}
${data.concomitantTreatmentText ? `<concomitanttreatmenttext>${this.escapeXml(data.concomitantTreatmentText)}</concomitanttreatmenttext>` : ''}
${data.pastDrugHistory ? `<patientpastdrughistory>${this.escapeXml(data.pastDrugHistory)}</patientpastdrughistory>` : ''}
${data.patientDeathDate ? `<patientdeathdate>${this.formatE2BDate(data.patientDeathDate)}</patientdeathdate>` : ''}
${data.causeOfDeath ? `<patientdeathdateformat>${this.escapeXml(data.causeOfDeath)}</patientdeathdateformat>` : ''}
${data.autopsyDone ? `<patientautopsyyesno>${this.escapeXml(data.autopsyDone)}</patientautopsyyesno>` : ''}
${data.autopsyDate ? `<patientautopsydate>${this.formatE2BDate(data.autopsyDate)}</patientautopsydate>` : ''}
<reaction>
<primarysourcereaction>${this.escapeXml(data.primarySourceReaction || 'Adverse reaction')}</primarysourcereaction>
${data.reactionMeddraversion ? `<reactionmeddraversion>${this.escapeXml(data.reactionMeddraversion)}</reactionmeddraversion>` : ''}
${data.reactionMeddrapt ? `<reactionmeddrapt>${this.escapeXml(data.reactionMeddrapt)}</reactionmeddrapt>` : ''}
${data.reactionMeddrallt ? `<reactionmeddrallt>${this.escapeXml(data.reactionMeddrallt)}</reactionmeddrallt>` : ''}
${data.termHighlighted ? `<termhighlighted>${this.escapeXml(data.termHighlighted)}</termhighlighted>` : ''}
<reactionstartdate>${data.reactionStartDate ? this.formatE2BDate(data.reactionStartDate) : currentDate}</reactionstartdate>
${data.reactionStartDateFormat ? `<reactionstartdateformat>${this.escapeXml(data.reactionStartDateFormat)}</reactionstartdateformat>` : ''}
${data.reactionEndDate ? `<reactionenddate>${this.formatE2BDate(data.reactionEndDate)}</reactionenddate>` : ''}
${data.reactionEndDateFormat ? `<reactionenddateformat>${this.escapeXml(data.reactionEndDateFormat)}</reactionenddateformat>` : ''}
${data.reactionDuration ? `<reactionduration>${this.escapeXml(data.reactionDuration)}</reactionduration>` : ''}
${data.reactionDurationUnit ? `<reactiondurationunit>${this.escapeXml(data.reactionDurationUnit)}</reactiondurationunit>` : ''}
${data.reactionFirstTime ? `<reactionfirsttime>${this.escapeXml(data.reactionFirstTime)}</reactionfirsttime>` : ''}
${data.reactionFirstTimeUnit ? `<reactionfirsttimeunit>${this.escapeXml(data.reactionFirstTimeUnit)}</reactionfirsttimeunit>` : ''}
${data.reactionLastTime ? `<reactionlasttime>${this.escapeXml(data.reactionLastTime)}</reactionlasttime>` : ''}
${data.reactionLastTimeUnit ? `<reactionlasttimeunit>${this.escapeXml(data.reactionLastTimeUnit)}</reactionlasttimeunit>` : ''}
<reactionoutcome>${this.escapeXml(data.reactionOutcome || '5')}</reactionoutcome>
</reaction>
${data.testName ? `<test><testdate>${data.testDate ? this.formatE2BDate(data.testDate) : currentDate}</testdate><testname>${this.escapeXml(data.testName)}</testname>${data.testResult ? `<testresult>${this.escapeXml(data.testResult)}</testresult>` : ''}</test>` : ''}
<drug>
<drugcharacterization>${this.escapeXml(data.drugRole || '1')}</drugcharacterization>
<medicinalproduct>${this.escapeXml(data.medicinalProduct || 'Unknown Drug')}</medicinalproduct>
${data.obtainDrugCountry ? `<obtaindrugcountry>${this.escapeXml(data.obtainDrugCountry)}</obtaindrugcountry>` : ''}
${data.drugBatchNumb ? `<drugbatchnumb>${this.escapeXml(data.drugBatchNumb)}</drugbatchnumb>` : ''}
${data.drugBatchExpiry ? `<drugbatchexpirydate>${this.formatE2BDate(data.drugBatchExpiry)}</drugbatchexpirydate>` : ''}
${data.drugDosageText ? `<drugdosagetext>${this.escapeXml(data.drugDosageText)}</drugdosagetext>` : '<drugdosagetext>Not specified</drugdosagetext>'}
${data.drugDosageForm ? `<drugdosageform>${this.escapeXml(data.drugDosageForm)}</drugdosageform>` : ''}
<drugadministrationroute>${this.escapeXml(data.drugAdministrationRoute || '065')}</drugadministrationroute>
${data.drugParAdministration ? `<drugparadministration>${this.escapeXml(data.drugParAdministration)}</drugparadministration>` : ''}
${data.reactionGestationPeriod ? `<reactiongestationperiod>${this.escapeXml(data.reactionGestationPeriod)}</reactiongestationperiod>` : ''}
${data.reactionGestationPeriodUnit ? `<reactiongestationperiodunit>${this.escapeXml(data.reactionGestationPeriodUnit)}</reactiongestationperiodunit>` : ''}
<drugstartdate>${data.drugStartDate ? this.formatE2BDate(data.drugStartDate) : currentDate}</drugstartdate>
${data.drugStartDateFormat ? `<drugstartdateformat>${this.escapeXml(data.drugStartDateFormat)}</drugstartdateformat>` : ''}
${data.drugLastPeriod ? `<druglastperiod>${this.formatE2BDate(data.drugLastPeriod)}</druglastperiod>` : ''}
${data.drugLastPeriodFormat ? `<druglastperioddateformat>${this.escapeXml(data.drugLastPeriodFormat)}</druglastperioddateformat>` : ''}
${data.drugEndDate ? `<drugenddate>${this.formatE2BDate(data.drugEndDate)}</drugenddate>` : ''}
${data.drugEndDateFormat ? `<drugenddateformat>${this.escapeXml(data.drugEndDateFormat)}</drugenddateformat>` : ''}
${data.drugTreatmentDuration ? `<drugtreatmentduration>${this.escapeXml(data.drugTreatmentDuration)}</drugtreatmentduration>` : ''}
${data.drugTreatmentDurationUnit ? `<drugtreatmentdurationunit>${this.escapeXml(data.drugTreatmentDurationUnit)}</drugtreatmentdurationunit>` : ''}
<actiondrug>${this.escapeXml(data.actionDrug || '5')}</actiondrug>
<drugrecurrence>
<drugrecuraction>${this.escapeXml(data.drugRecurrence || '2')}</drugrecuraction>
</drugrecurrence>
</drug>
<summary>
<narrativeincludeclinical>${this.escapeXml(data.narrativeText || 'No narrative provided')}</narrativeincludeclinical>
${data.reporterComments ? `<reportercomment>${this.escapeXml(data.reporterComments)}</reportercomment>` : ''}
${data.senderComments ? `<sendercomment>${this.escapeXml(data.senderComments)}</sendercomment>` : ''}
</summary>
</patient>
</safetyreport>
</ichicsr>`;

    return xmlContent;
  }
}