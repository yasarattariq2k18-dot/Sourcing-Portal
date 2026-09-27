import { DiscussionThread, AuditEvent } from '../types/procurement';

export const INITIAL_DISCUSSIONS: DiscussionThread[] = [
  {
    id: 'COM-001',
    materialCode: '111000297',
    materialName: 'BACITRACIN BP',
    author: 'Tariq Mehmood',
    role: 'Sourcing Director',
    text: 'Urgent focus: Xellia currently quoting $610/KG. NCPC sample at $400/KG is in initial QC. If cleared, annual cost savings exceed $81,000. @QualityTeam please expedite HPLC assay test.',
    priority: 'Critical',
    timestamp: '24-Aug-2026 10:15 AM',
    tags: ['CostReduction', 'SingleSourceRisk', 'ExpediteQC']
  },
  {
    id: 'COM-002',
    materialCode: '111000297',
    materialName: 'BACITRACIN BP',
    author: 'Dr. Samina Khan',
    role: 'QC Head',
    text: 'Working standard received from NCPC on Aug 20. Preliminary assay matches standard specs (98.9%). Awaiting 30-day stability pull on accelerated chamber.',
    priority: 'Routine',
    timestamp: '25-Aug-2026 02:40 PM',
    tags: ['QCUpdate', 'StabilityTesting']
  },
  {
    id: 'COM-003',
    materialCode: '111000305',
    materialName: 'CLOPIDOGREL BISULFATE USP',
    author: 'Yasar Attari',
    role: 'Strategic Procurement Manager',
    text: 'Dual-sourcing achieved between Cadchem and Synthimed. Menovo (China) sample under arrangement at $40.00/kg. Target rate $36.40 within reach on 2027 bulk volumes.',
    priority: 'Routine',
    timestamp: '02-Sep-2026 11:20 AM',
    tags: ['DualSourcing', 'PriceParity']
  },
  {
    id: 'COM-004',
    materialCode: '111000302',
    materialName: 'CROTAMITON BP',
    author: 'Rashid Ali',
    role: 'Sourcing Agent',
    text: 'Supplier Jiangsu Poly was disqualified as supplier did not provide DMF & site audit dossier. Retaining Syn-Tech Taiwan and Asence India for primary volume split.',
    priority: 'Urgent',
    timestamp: '28-Aug-2026 04:05 PM',
    tags: ['Compliance', 'Disqualification']
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'LOG-101',
    materialCode: '111000205',
    materialName: 'ASPIRIN BP',
    eventType: 'PO Issued',
    description: 'PO #78901 issued to Shandong Xinhua for 7,500 KG @ $3.30/KG CFR Karachi.',
    user: 'Yasar Attari',
    timestamp: '03-Sep-2026 09:30 AM',
    status: 'Completed'
  },
  {
    id: 'LOG-102',
    materialCode: '111000297',
    materialName: 'BACITRACIN BP',
    eventType: 'Sample Dispatched',
    description: 'NCPC trial lot (100g sample + working standard) logged into Central QA QC lab for monograph assay.',
    user: 'Dr. Samina Khan',
    timestamp: '24-Aug-2026 11:45 AM',
    status: 'Completed'
  },
  {
    id: 'LOG-103',
    materialCode: '111000408',
    materialName: 'VORICONAZOLE (USP)',
    eventType: 'QC Audit Scheduled',
    description: 'Remote GMP virtual plant audit scheduled with Zhejiang Huahai API Unit 4 for compliance reaffirmation.',
    user: 'Farhan Qureshi',
    timestamp: '22-Aug-2026 03:15 PM',
    status: 'Pending'
  },
  {
    id: 'LOG-104',
    materialCode: '111000336',
    materialName: 'EFLORNITHINE HCL MONOHYDRATE',
    eventType: 'Vendor Disqualified',
    description: 'Wuhan Xinru Chemical formally disqualified due to non-availability of DMF registration dossier.',
    user: 'Regulatory Affairs',
    timestamp: '15-Aug-2026 04:30 PM',
    status: 'Flagged'
  },
  {
    id: 'LOG-105',
    materialCode: '111000028',
    materialName: 'PROPYLENE GLYCOL BP',
    eventType: 'PFI Received',
    description: 'Commercial Proforma Invoice received from Dow Chemical Pacific for 17,200 KG bulk tanker dispatch.',
    user: 'Yasar Attari',
    timestamp: '06-Jul-2026 01:20 PM',
    status: 'Completed'
  }
];
