import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../services/reports.service';
import { Report } from '../../models/report.model';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.scss']
})
export class ReportDetailComponent implements OnInit {
  report: Report | null = null;
  isLoading = false;
  error: string | null = null;
  xmlContent: string | null = null;
  showXmlView = false;
  isLoadingXml = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
    const reportId = Number(this.route.snapshot.paramMap.get('id'));
    if (reportId) {
      this.loadReport(reportId);
    }
  }

  loadReport(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.reportsService.getReport(id).subscribe({
      next: (report) => {
        this.report = report;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load report';
        this.isLoading = false;
      }
    });
  }

  editReport(): void {
    if (this.report) {
      this.router.navigate(['/reports', this.report.id, 'edit']);
    }
  }

  deleteReport(): void {
    if (this.report && confirm('Are you sure you want to delete this report?')) {
      this.reportsService.deleteReport(this.report.id).subscribe({
        next: () => {
          this.router.navigate(['/reports']);
        },
        error: (err) => {
          this.error = 'Failed to delete report';
        }
      });
    }
  }

  downloadReport(): void {
    if (this.report) {
      this.reportsService.downloadReport(this.report.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.report!.title}.xml`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.error = 'Failed to download report';
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/reports']);
  }

  toggleView(): void {
    this.showXmlView = !this.showXmlView;
    
    // Load XML content if switching to XML view and not already loaded
    if (this.showXmlView && !this.xmlContent && this.report) {
      this.loadXmlContent();
    }
  }

  loadXmlContent(): void {
    if (!this.report) return;
    
    this.isLoadingXml = true;
    this.reportsService.downloadReport(this.report.id).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.xmlContent = reader.result as string;
          this.isLoadingXml = false;
        };
        reader.readAsText(blob);
      },
      error: (err) => {
        this.error = 'Failed to load XML content';
        this.isLoadingXml = false;
      }
    });
  }

  copyXmlToClipboard(): void {
    if (this.xmlContent) {
      navigator.clipboard.writeText(this.xmlContent).then(() => {
        // Could add a toast notification here
        console.log('XML copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy XML to clipboard:', err);
        // Fallback for older browsers
        this.fallbackCopyTextToClipboard(this.xmlContent!);
      });
    }
  }

  private fallbackCopyTextToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      console.log('Fallback: XML copied to clipboard');
    } catch (err) {
      console.error('Fallback: Unable to copy', err);
    }
    
    document.body.removeChild(textArea);
  }

  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'Not specified';
    }
    return String(value);
  }

  // E2B Code Label Functions
  getReportTypeLabel(value: string): string {
    switch (value) {
      case '1': return 'Spontaneous';
      case '2': return 'Report from study';
      case '3': return 'Other';
      case '4': return 'Not available to sender';
      default: return this.formatValue(value);
    }
  }

  getFirstSenderLabel(value: string): string {
    switch (value) {
      case '1': return 'Regulator';
      case '2': return 'Other';
      default: return this.formatValue(value);
    }
  }

  getQualificationLabel(value: string): string {
    switch (value) {
      case '1': return 'Physician';
      case '2': return 'Pharmacist';
      case '3': return 'Other health professional';
      case '4': return 'Lawyer';
      case '5': return 'Consumer or other non health professional';
      default: return this.formatValue(value);
    }
  }

  getSenderTypeLabel(value: string): string {
    switch (value) {
      case '1': return 'Pharmaceutical company';
      case '2': return 'Regulatory authority';
      case '3': return 'Health professional';
      case '4': return 'Regional pharmacovigilance centre';
      case '5': return 'WHO collaborating centre';
      case '6': return 'Other';
      default: return this.formatValue(value);
    }
  }

  getSexLabel(value: string): string {
    switch (value) {
      case '1': return 'Male';
      case '2': return 'Female';
      case '0': return 'Unknown';
      default: return this.formatValue(value);
    }
  }

  getAgeUnitLabel(value: string): string {
    switch (value) {
      case '801': return 'Year(s)';
      case '802': return 'Month(s)';
      case '803': return 'Week(s)';
      case '804': return 'Day(s)';
      case '805': return 'Hour(s)';
      default: return this.formatValue(value);
    }
  }

  formatAge(age: any, unit: string): string {
    if (!age) return 'Not specified';
    const unitLabel = this.getAgeUnitLabel(unit);
    return `${age} ${unitLabel}`;
  }

  getOutcomeLabel(value: string): string {
    switch (value) {
      case '1': return 'Recovered/Resolved';
      case '2': return 'Recovering/Resolving';
      case '3': return 'Not recovered/Not resolved';
      case '4': return 'Fatal';
      case '5': return 'Unknown';
      default: return this.formatValue(value);
    }
  }

  getAutopsyLabel(value: string): string {
    switch (value) {
      case '1': return 'Yes';
      case '2': return 'No';
      case '3': return 'Unknown';
      default: return this.formatValue(value);
    }
  }

  getDrugRoleLabel(value: string): string {
    switch (value) {
      case '1': return 'Suspect';
      case '2': return 'Concomitant';
      case '3': return 'Interacting';
      default: return this.formatValue(value);
    }
  }

  getActionDrugLabel(value: string): string {
    switch (value) {
      case '1': return 'Drug withdrawn';
      case '2': return 'Dose reduced';
      case '3': return 'Dose increased';
      case '4': return 'Dose not changed';
      case '5': return 'Unknown';
      case '6': return 'Not applicable';
      default: return this.formatValue(value);
    }
  }

  getDrugRelatednessLabel(value: string): string {
    switch (value) {
      case '1': return 'Certain';
      case '2': return 'Probable/Likely';
      case '3': return 'Possible';
      case '4': return 'Unlikely';
      case '5': return 'Conditional/Unclassified';
      case '6': return 'Unassessable/Unclassifiable';
      default: return this.formatValue(value);
    }
  }

  getRecurrenceLabel(value: string): string {
    switch (value) {
      case '1': return 'Yes';
      case '2': return 'No';
      case '3': return 'Unknown';
      default: return this.formatValue(value);
    }
  }

  getRouteLabel(value: string): string {
    const routes: { [key: string]: string } = {
      '001': 'Auricular (otic)',
      '002': 'Buccal',
      '003': 'Cutaneous',
      '004': 'Dental',
      '005': 'Endocervical',
      '006': 'Endosinusial',
      '007': 'Endotracheal',
      '008': 'Epidural',
      '009': 'Extra-amniotic',
      '010': 'Hemodialysis',
      '011': 'Intra corpus cavernosum',
      '012': 'Intra-amniotic',
      '013': 'Intra-arterial',
      '014': 'Intra-articular',
      '015': 'Intra-uterine',
      '016': 'Intracardiac',
      '017': 'Intracavernous',
      '018': 'Intracerebral',
      '019': 'Intracervical',
      '020': 'Intracisternal',
      '021': 'Intracorneal',
      '022': 'Intracoronary',
      '023': 'Intradermal',
      '024': 'Intradiscal (intraspinal)',
      '025': 'Intrahepatic',
      '026': 'Intralesional',
      '027': 'Intralymphatic',
      '028': 'Intramedullar (bone marrow)',
      '029': 'Intrameningeal',
      '030': 'Intraocular',
      '031': 'Intrapericardial',
      '032': 'Intraperitoneal',
      '033': 'Intrapleural',
      '034': 'Topical',
      '035': 'Intraspinal',
      '036': 'Intrasternal',
      '037': 'Intrathecal',
      '038': 'Intrathoracic',
      '039': 'Intratracheal',
      '040': 'Intratumor',
      '041': 'Intratympanic',
      '042': 'Intravascular',
      '043': 'Intraventricular',
      '044': 'Intravesical',
      '045': 'Iontophoresis',
      '046': 'Nasal',
      '047': 'Intravenous',
      '048': 'Occlusive dressing technique',
      '049': 'Ophthalmic',
      '050': 'Oropharyngeal',
      '051': 'Other',
      '052': 'Parenteral',
      '053': 'Periarticular',
      '054': 'Perineural',
      '055': 'Rectal',
      '056': 'Respiratory (inhalation)',
      '057': 'Retrobulbar',
      '058': 'Intramuscular',
      '059': 'Subarachnoid',
      '060': 'Subconjunctival',
      '061': 'Sublingual',
      '062': 'Submucosal',
      '063': 'Subcutaneous',
      '064': 'Transdermal',
      '065': 'Oral',
      '066': 'Transmucosal',
      '067': 'Transplacental',
      '068': 'Transtracheal',
      '069': 'Transtympanic',
      '070': 'Unspecified',
      '071': 'Urethral',
      '072': 'Vaginal'
    };
    return routes[value] || this.formatValue(value);
  }

  getYesNoLabel(value: string): string {
    switch (value) {
      case '1': return 'Yes';
      case '2': return 'No';
      default: return this.formatValue(value);
    }
  }

  // Formatting helper functions
  formatDuration(duration: any, unit: string): string {
    if (!duration) return 'Not specified';
    const unitLabel = this.getAgeUnitLabel(unit); // Same units as age
    return `${duration} ${unitLabel}`;
  }

  formatDose(dose: any, unit: string): string {
    if (!dose) return 'Not specified';
    return `${dose} ${unit || ''}`;
  }

  formatStrength(strength: any, unit: string): string {
    if (!strength) return 'Not specified';
    return `${strength} ${unit || ''}`;
  }

  formatInterval(interval: any, unit: string): string {
    if (!interval) return 'Not specified';
    let unitLabel = unit;
    switch (unit) {
      case 'h': unitLabel = 'hour(s)'; break;
      case 'd': unitLabel = 'day(s)'; break;
      case 'wk': unitLabel = 'week(s)'; break;
      case 'mo': unitLabel = 'month(s)'; break;
    }
    return `Every ${interval} ${unitLabel}`;
  }
}