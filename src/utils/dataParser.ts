import { CompetitorIntel, MaterialItem, RejectionInfo, SamplePipelineItem } from '../types/procurement';

// Robust CSV row parser that handles quotes, multiline fields, commas
export function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function parseCompetitorIntel(text: string): CompetitorIntel[] {
  if (!text || text.trim() === '-' || text.trim() === '') return [];
  const entries: CompetitorIntel[] = [];
  
  // Format example:
  // • WUHU HUAHAI BIOLOGY ENGINEERING CO., LTD — China — Customer: BROTHERS ENTERPRISE (PRIVATE) LIMITED — Last Qty: 3,000 KG @ 3.60/KG (as of 09-Apr-2026)
  const lines = text.split(/\n|•/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    try {
      const parts = line.split('—').map(p => p.trim());
      if (parts.length >= 2) {
        const supplier = parts[0].replace(/^[•\s-]+/, '').trim();
        const country = parts[1] || 'Global';
        
        let customer = 'Market Participant';
        let lastQty = '';
        let pricePerUnit = 0;
        let date = '';

        const rest = parts.slice(2).join(' — ');
        const custMatch = rest.match(/Customer:\s*([^—@]+)/i);
        if (custMatch) {
          customer = custMatch[1].trim();
        }

        const qtyMatch = rest.match(/Last Qty:\s*([0-9.,]+(?:\s*[a-zA-Z²]+)?)/i);
        if (qtyMatch) {
          lastQty = qtyMatch[1].trim();
        }

        const priceMatch = rest.match(/@\s*([0-9.,]+)/i);
        if (priceMatch) {
          pricePerUnit = parseFloat(priceMatch[1].replace(/,/g, '')) || 0;
        }

        const dateMatch = rest.match(/\(as of\s*([^)]+)\)/i);
        if (dateMatch) {
          date = dateMatch[1].trim();
        }

        entries.push({
          supplier,
          country,
          customer,
          lastQty,
          pricePerUnit,
          date,
          raw: line
        });
      }
    } catch {
      // skip unparseable
    }
  }

  return entries;
}

export function parseRejections(text: string): RejectionInfo[] {
  if (!text || text.trim() === '' || text.trim() === '-') return [];
  const rejections: RejectionInfo[] = [];
  const lines = text.split(/\n|•/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 2) {
      rejections.push({
        vendor: parts[0] || 'Unknown Vendor',
        country: parts[1] || 'Global',
        agent: parts[2] || '-',
        sampleDetails: parts[3] || '-',
        reason: parts[4] || parts[parts.length - 1] || 'Quality Assessment Non-Compliance'
      });
    }
  }

  return rejections;
}

export function parseDevelopmentSamples(text: string): SamplePipelineItem[] {
  if (!text || text.trim() === '') return [];
  const items: SamplePipelineItem[] = [];
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    let stage: SamplePipelineItem['stage'] = 'Under Stability';
    if (line.includes('INITIAL TESTING') || line.includes('AT INITIAL')) stage = 'Initial Testing';
    else if (line.includes('PD Priority') || line.includes('For PD')) stage = 'PD Priority';
    else if (line.includes('ARRANGEMENT') || line.includes('UNDER ARR')) stage = 'Under Arrangement';
    else if (line.includes('REJECTED')) stage = 'Rejected';

    // extract price if available ($X or - X)
    let price: number | undefined;
    const priceMatch = line.match(/\$?([0-9]+(?:\.[0-9]+)?)/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1]);
    }

    const cleanName = line.replace(/•|\(AT STABILITY\)|\(AT INITIAL TESTING\)|\(For PD Priority\)|\(UNDER ARRANGEMENT\)|\(REJECTED\)/g, '').trim();

    items.push({
      stage,
      vendor: cleanName,
      origin: line.includes('India') ? 'India' : line.includes('China') ? 'China' : line.includes('Europe') || line.includes('Germany') ? 'Europe' : 'Other',
      quotePrice: price,
      notes: line
    });
  }

  return items;
}

export function mapRawRowToMaterialItem(row: string[], index: number): MaterialItem | null {
  if (!row || row.length < 5 || !row[0]) return null;

  const getCol = (idx: number, fallback = '') => (row[idx] ? row[idx].trim() : fallback);
  const getNum = (idx: number, fallback = 0) => {
    const val = getCol(idx);
    if (!val) return fallback;
    const clean = val.replace(/,/g, '').replace(/[^\d.-]/g, '');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? fallback : parsed;
  };

  const materialCode = getCol(0);
  const materialName = getCol(1);
  if (!materialCode || materialCode.toLowerCase().includes('material code')) return null;

  const cdSuppliersBelowRaw = getCol(110);
  const cdSuppliersAboveRaw = getCol(111);
  const rejectedRaw = getCol(64);
  const underDevRaw = getCol(88);

  const parsedCdBelow = parseCompetitorIntel(cdSuppliersBelowRaw);
  const parsedCdAbove = parseCompetitorIntel(cdSuppliersAboveRaw);
  const parsedRejections = parseRejections(rejectedRaw);
  const parsedSamples = parseDevelopmentSamples(underDevRaw);

  const annualBuyingQty = getNum(54);
  const netPriceUSD = getNum(80) || getNum(57);
  const annualBuyingValueUSD = getNum(71) || (annualBuyingQty * netPriceUSD);
  const annualBuyingValuePKR = getNum(59) || getNum(96);
  const lastNetPricePKR = getNum(60);

  return {
    id: `${materialCode}-${index}`,
    materialCode,
    materialName,
    activeMfg: getCol(2),
    activeMfgOrigin: getCol(3),
    inactiveMfg: getCol(4),
    inactiveMfgOrigin: getCol(5),
    activeMfgCount: getNum(6, 1),
    inactiveMfgCount: getNum(7, 0),
    company: getCol(10, 'LAB'),
    totalMfgCount: getNum(12, 1),
    totalMfgOrigin: getCol(13),
    qcMfgName: getCol(14),
    qcMfgOrigin: getCol(15),
    type: (getCol(46) || 'API').toUpperCase() as 'API' | 'EXP' | 'PM',
    sourceOrigin: (getCol(47) || 'IMPORT').toUpperCase() as 'IMPORT' | 'LOCAL',
    materialClassification: getCol(48),
    originCategory: getCol(49),
    sourceClassification: getCol(50),
    sourceType: getCol(51) || 'Single Source',
    category: getCol(52) || 'General',
    fgCount: getNum(53, 1),
    originGrade: getCol(54) || 'B',
    annualBuyingQty,
    lastOrderQty: getNum(55),
    uom: getCol(56, 'KG'),
    lastNetPrice: getNum(57),
    currency: getCol(58, 'USD'),
    annualBuyingValuePKR,
    lastNetPricePKR,
    lastSupplier: getCol(61),
    lastManufacturer: getCol(62),
    targetRate30: getNum(63),
    sampleUnderArrangement: getCol(64),
    sampleInitialTesting: getCol(67),
    sampleStability: getCol(70),
    classValue: getCol(73) || 'C',
    rejectedDetails: rejectedRaw,
    singleMultiActiveAVL: getCol(79),
    annualBuyingValueUSD,
    percentageAnnualSpendUSD: getNum(72),
    underDevStage: getCol(76),
    underDevCount: getNum(77, 0),
    netPriceUSD,
    targetPriceUSD: getNum(81),
    rejectedCount: getNum(82, parsedRejections.length),
    avlStatus: getCol(85),
    lastRegionCategory: getCol(79),
    lastIndentor: getCol(102),
    lastPoDate: getCol(103),
    shiftedFromIndia: getCol(104),
    dualSourcedDetails: getCol(105),
    cdSuppliersBelowRaw,
    cdSuppliersAboveRaw,
    parsedCdBelow,
    parsedCdAbove,
    parsedRejections,
    parsedSamples
  };
}
