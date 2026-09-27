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

export type ViewTab = 'overview' | 'risk-matrix' | 'avl-pipeline' | 'market-intel' | 'explorer' | 'cost-simulator';

export interface FilterState {
  search: string;
  type: string; // 'ALL' | 'API' | 'EXP' | 'PM'
  sourceType: string; // 'ALL' | 'Single Source' | 'Fixed Source' | 'Multi Source'
  sourceOrigin: string; // 'ALL' | 'IMPORT' | 'LOCAL'
  classValue: string; // 'ALL' | 'A' | 'B' | 'C'
  category: string; // 'ALL' | ...
  originCountry: string; // 'ALL' | 'CHINA' | 'INDIA' | ...
  hasCompetitorDiscount: boolean;
  hasQualityRejection: boolean;
  hasUnderDev: boolean;
}
