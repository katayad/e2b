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
    // Generate FDA-compliant E2B(R3) XML with exact element names expected by FDA validator
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
<messagenumb>${this.escapeXml(safetyReportId)}</messagenumb>
<messagesenderidentifier>E2B-APP</messagesenderidentifier>
<messagereceiveridentifier>FDA</messagereceiveridentifier>
<messagedateformat>204</messagedateformat>
<messagedate>${currentDateTime}</messagedate>
</ichicsrmessageheader>
<safetyreport>
<safetyreportid root="2.16.840.1.113883.3.989.2.1.3.1" extension="${this.escapeXml(safetyReportId)}"/>
<receiptdate value="${currentDate}"/>
<fulfillexpeditecriteria value="false"/>
<primarysourcecountry code="US" codeSystem="1.0.3166.1.2.2"/>
<serious value="false"/>
<primarysource>
<reportercountry code="US" codeSystem="1.0.3166.1.2.2"/>
<qualification code="1" codeSystem="2.16.840.1.113883.3.989.2.1.1.6"/>
</primarysource>
<sender>
<sendertype code="3" codeSystem="2.16.840.1.113883.3.989.2.1.1.7"/>
<senderorganization>E2B Application</senderorganization>
</sender>
<receiver>
<receivertype code="2" codeSystem="2.16.840.1.113883.3.989.2.1.1.7"/>
<receiverorganization>FDA</receiverorganization>
</receiver>
<patient>
<reaction>
<primarysourcereaction>Adverse reaction</primarysourcereaction>
<reactionstartdate value="${currentDate}"/>
<reactionoutcome code="5" codeSystem="2.16.840.1.113883.3.989.2.1.1.11"/>
</reaction>
<drug>
<drugcharacterization code="1" codeSystem="2.16.840.1.113883.3.989.2.1.1.13"/>
<medicinalproduct>Unknown Drug</medicinalproduct>
<drugstartdate value="${currentDate}"/>
<drugdosagetext>Not specified</drugdosagetext>
<drugadministrationroute code="065" codeSystem="2.16.840.1.113883.3.989.2.1.1.14"/>
<actiondrug code="5" codeSystem="2.16.840.1.113883.3.989.2.1.1.15"/>
<drugrecurrence>
<drugrecuraction code="3" codeSystem="2.16.840.1.113883.3.989.2.1.1.16"/>
</drugrecurrence>
</drug>
<summary>
<narrativeincludeclinical>No narrative provided</narrativeincludeclinical>
</summary>
</patient>
</safetyreport>
</ichicsr>`;

    return xmlContent;
  }
}