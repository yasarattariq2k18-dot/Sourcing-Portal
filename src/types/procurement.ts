export interface CompetitorIntel {
  supplier: string;
  country: string;
  customer: string;
  lastQty: string;
  pricePerUnit: number;
  date: string;
  raw: string;
}

export interface RejectionInfo {
  vendor: string;
  country: string;
  agent: string;
  sampleDetails: string;
  reason: string;
}

export interface SamplePipelineItem {
  stage: 'Under Arrangement' | 'Initial Testing' | 'Under Stability' | 'PD Priority' | 'Rejected';
  vendor: string;
  origin: string;
  quotePrice?: number;
  quoteCurrency?: string;
  notes?: string;
}

export interface MaterialItem {
  id: string;
  materialCode: string;
  materialName: string;
  activeMfg: string;
  activeMfgOrigin: string;
  inactiveMfg: string;
  inactiveMfgOrigin: string;
  activeMfgCount: number;
  inactiveMfgCount: number;
  company: 'LAB' | 'AHL' | string;
  totalMfgCount: number;
  totalMfgOrigin: string;
  qcMfgName: string;
  qcMfgOrigin: string;
  type: 'API' | 'EXP' | 'PM';
  sourceOrigin: 'IMPORT' | 'LOCAL';
  materialClassification: string;
  originCategory: string;
  sourceClassification: string;
  sourceType: 'Single Source' | 'Fixed Source' | 'Multi Source' | string;
  category: string;
  fgCount: number;
  originGrade: 'A' | 'B' | 'C' | 'F' | string;
  annualBuyingQty: number;
  lastOrderQty: number;
  uom: string;
  lastNetPrice: number;
  currency: string;
  annualBuyingValuePKR: number;
  lastNetPricePKR: number;
  lastSupplier: string;
  lastManufacturer: string;
  targetRate30: number;
  sampleUnderArrangement: string;
  sampleInitialTesting: string;
  sampleStability: string;
  classValue: 'A' | 'B' | 'C' | string;
  rejectedDetails: string;
  singleMultiActiveAVL: string;
  annualBuyingValueUSD: number;
  percentageAnnualSpendUSD: number;
  underDevStage: string;
  underDevCount: number;
  netPriceUSD: number;
  targetPriceUSD: number;
  rejectedCount: number;
  avlStatus: string;
  lastRegionCategory: string;
  lastIndentor: string;
  lastPoDate: string;
  shiftedFromIndia: string;
  dualSourcedDetails: string;
  cdSuppliersBelowRaw: string;
  cdSuppliersAboveRaw: string;
  parsedCdBelow: CompetitorIntel[];
  parsedCdAbove: CompetitorIntel[];
  parsedRejections: RejectionInfo[];
  parsedSamples: SamplePipelineItem[];
}

export type ViewTab = 
  | 'director-analytics' 
  | 'slicers-reports' 
  | 'inquiry-portal' 
  | 'ai-assistant' 
  | 'collaborative-hub' 
  | 'catalog'
  | 'cost-simulator';

export type UserRole = 'director' | 'manager' | 'qc' | 'agent';

export interface SlicerState {
  role: UserRole;
  category: 'ALL' | 'API' | 'EXP' | 'PM';
  sourcing: 'ALL' | 'Single Source' | 'Multi Source' | 'Fixed Source';
  originRegion: 'ALL' | 'IMPORT' | 'LOCAL' | 'CHINA' | 'INDIA' | 'EUROPE' | 'SE_ASIA';
  pipelinePhase: 'ALL' | 'Commercial' | 'Under Development' | 'Under Stability' | 'Critical High-Risk';
  searchQuery: string;
}

export interface VendorQuote {
  id: string;
  inquiryId: string;
  vendorId: string;
  vendorName: string;
  materialCode: string;
  materialName: string;
  originCountry: string;
  fobPriceUSD: number;
  cfrPriceUSD: number;
  moq: number;
  leadTimeWeeks: number;
  shelfLifePercent: number; // e.g. 85% (must be >= 75% for API/EXP and >= 94% for pellets)
  workingStandardProvided: boolean;
  coaAttached: boolean;
  dmfAvailable: boolean;
  paymentTerms: string;
  submittedAt: string;
  complianceScore: number;
  targetRateVariancePct: number;
  notes?: string;
}

export interface SourcingInquiry {
  id: string;
  materialCode: string;
  materialName: string;
  category: string;
  targetAnnualQty: number;
  targetLotQty: number;
  uom: string;
  preferredOrigins: string[];
  targetPriceUSD: number;
  lastContractPriceUSD: number;
  specStandard: string; // e.g. BP / USP / In-House
  status: 'Draft' | 'Sent to Vendors' | 'Quotes Received' | 'Under Evaluation' | 'Awarded';
  createdAt: string;
  invitedVendors: { id: string; name: string; token: string }[];
  quotesCount: number;
}

export interface DiscussionThread {
  id: string;
  materialCode: string;
  materialName: string;
  author: string;
  role: string;
  text: string;
  priority: 'Routine' | 'Urgent' | 'Critical';
  timestamp: string;
  tags?: string[];
}

export interface AuditEvent {
  id: string;
  materialCode: string;
  materialName: string;
  eventType: 'PFI Received' | 'Sample Dispatched' | 'QC Audit Scheduled' | 'QC Query Resolved' | 'PO Issued' | 'Vendor Disqualified';
  description: string;
  user: string;
  timestamp: string;
  status: 'Completed' | 'Pending' | 'Flagged';
}

export interface TrainingVideo {
  id: string;
  title: string;
  category: 'User Training' | 'Vendor Onboarding' | 'Plant Audit Video Tours' | 'Quality & Regulatory Guidelines';
  duration: string;
  url: string;
  description: string;
  instructor: string;
  badge?: string;
}
