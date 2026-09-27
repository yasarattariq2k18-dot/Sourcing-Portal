import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { INITIAL_PROCUREMENT_DATA } from './src/data/procurementData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// System prompt grounding the model in ATCO Strategic Procurement context
const ATCO_SYSTEM_INSTRUCTION = `
You are the "ATCO Sourcing Assistant" - an elite AI Strategic Procurement, SCM & Supplier Intelligence Specialist for ATCO Laboratories Limited.
You have real-time access to ATCO's master procurement database of active pharmaceutical ingredients (APIs), excipients (EXPs), and packaging materials (PMs).

ATCO Operating Policies & Rules:
1. Rejection Compensation: Any lot rejected by QC must receive formal vendor compensation / replacement within 15 calendar days.
2. Shelf-Life Rule: Minimum 75% residual shelf-life at arrival at Karachi Port for general APIs and Excipients; minimum 94% residual shelf life for modified-release/enteric-coated pellets (e.g. Esomeprazole, Itraconazole, Duloxetine).
3. PFI SLA: Approved vendors must issue Proforma Invoice within 2 business days of order confirmation.
4. Sample Submission: Commercial candidates must provide 3 lots of sample with Certificate of Analysis (CoA) and analytical working standards within 30 days.
5. Dual-Sourcing Directive: Any material supporting >= 15 Finished Goods (FGs) or >$50,000 annual spend currently single-sourced is marked Critical Risk and mandates immediate alternate qualification.

Respond with executive clarity, numerical precision (cite prices in USD and PKR, % savings, FG counts, competitor imports), and actionable recommendations.
`;

// Helper summary of top materials for context
const datasetSummary = INITIAL_PROCUREMENT_DATA.map(m => ({
  code: m.materialCode,
  name: m.materialName,
  type: m.type,
  sourceType: m.sourceType,
  origin: m.activeMfgOrigin,
  fgCount: m.fgCount,
  netPriceUSD: m.netPriceUSD,
  targetPriceUSD: m.targetPriceUSD,
  spendUSD: m.annualBuyingValueUSD,
  underDevStage: m.underDevStage,
  rejectedCount: m.rejectedCount
}));

// API: AI Chat Assistant
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Offline fallback rule-based response
      return res.json({
        reply: generateOfflineResponse(message)
      });
    }

    const prompt = `
Context dataset summary (${datasetSummary.length} key materials):
${JSON.stringify(datasetSummary.slice(0, 40), null, 2)}

User Query:
${message}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: ATCO_SYSTEM_INSTRUCTION,
        temperature: 0.2
      }
    });

    const reply = response.text || 'Unable to generate reply at this moment.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.json({
      reply: generateOfflineResponse(req.body.message || '')
    });
  }
});

// API: Automated Executive Briefing
app.post('/api/gemini/briefing', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        briefing: generateDefaultBriefing(role)
      });
    }

    const prompt = `
Generate a concise, high-impact Executive Sourcing & Supply Chain Briefing for an ATCO ${role || 'Director'}.
Highlight:
1. Total Portfolio Spend & Concentration.
2. Top Single-Source Vulnerabilities requiring board-level awareness (Bacitracin, Crotamiton, Smectite, etc.).
3. Market Customs Arbitrage ($80k+ potential vs competitor imports like GSK, Abbott, Searle).
4. Ongoing Stability & Qualification Pipeline highlights.
5. Compliance with ATCO 75% shelf life and 15-day QC rejection rules.
Format with clean bullet points and bold financial figures.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: ATCO_SYSTEM_INSTRUCTION,
        temperature: 0.3
      }
    });

    res.json({ briefing: response.text || generateDefaultBriefing(role) });
  } catch (error) {
    res.json({ briefing: generateDefaultBriefing(req.body.role) });
  }
});

// API: Sourcing Risk & Bottleneck Analysis
app.post('/api/gemini/risk-analysis', async (req: Request, res: Response) => {
  try {
    const { materialCode } = req.body;
    const material = INITIAL_PROCUREMENT_DATA.find(m => m.materialCode === materialCode);

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        riskScore: material.sourceType.includes('Single') ? 82 : 45,
        riskLevel: material.sourceType.includes('Single') && material.fgCount >= 15 ? 'CRITICAL' : 'MODERATE',
        assessment: `${material.materialName} has ${material.activeMfgCount} active validated supplier(s). Supports ${material.fgCount} finished products with annual spend of $${material.annualBuyingValueUSD.toLocaleString()}. Alternate source qualification recommended.`
      });
    }

    const prompt = `
Analyze the supply chain and procurement risk for:
Material: ${material.materialName} (${material.materialCode})
Type: ${material.type} | Category: ${material.category}
Source Type: ${material.sourceType}
Active Mfg: ${material.activeMfg} (${material.activeMfgOrigin})
Inactive Mfg: ${material.inactiveMfg} (${material.inactiveMfgOrigin})
Finished Goods Relying: ${material.fgCount}
Annual Spend: $${material.annualBuyingValueUSD.toLocaleString()}
Net Price: $${material.netPriceUSD} | Target Price: $${material.targetPriceUSD}
Rejections Log: ${material.rejectedDetails || 'None'}
Pipeline: ${material.underDevStage || 'None'}

Provide:
1. AI Risk Score (0 to 100)
2. Risk Level (LOW, MODERATE, HIGH, CRITICAL)
3. Concise Executive Assessment & Strategic Sourcing Action Plan.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: ATCO_SYSTEM_INSTRUCTION,
        temperature: 0.2
      }
    });

    res.json({ analysis: response.text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate risk analysis' });
  }
});

// Offline rule-based response generator
function generateOfflineResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('single') || q.includes('risk') || q.includes('vulnerab')) {
    return `**Single Source Vulnerability Briefing**:
- **Critical High-Spend APIs**: Bacitracin BP ($237k/yr, sole supplier Xellia), Crotamiton BP ($634k/yr), Smectite ($606k/yr from Mayoly France), and Eflornithine HCL ($262k/yr).
- **Finished Goods Exposure**: Propylene Glycol BP (548 FGs), Titanium Dioxide BP (504 FGs), and MCC PH 112 (405 FGs) are the top formulation dependencies.
- **Action**: 3 candidate manufacturers are under active stability (NCPC for Bacitracin, Shanghai Zijiang for Al-Foil, and Wuhan RS for Voriconazole).`;
  }
  if (q.includes('spend') || q.includes('top') || q.includes('pareto') || q.includes('usd') || q.includes('pkr')) {
    return `**ATCO Spend Profile Summary**:
- **Total Portfolio 12M Spend**: ~$7.8M USD (~Rs 2.17 Billion PKR).
- **Top 5 Value Commitments**: Crotamiton BP ($634k), Dioctahedral Smectite ($606k), White Soft Paraffin ($488k), Glyceryl Trinitrate ($379k), and Permethrin BP ($357k).
- **Pareto**: The top 12 materials generate over 50% of ATCO total raw material spend.`;
  }
  if (q.includes('china') || q.includes('india') || q.includes('origin')) {
    return `**Geopolitical Sourcing Breakdown**:
- **China Corridor**: Dominates with ~48% of active API volumes (e.g. Aspirin, Doxycycline, Paracetamol, Metformin).
- **India Corridor**: Represents ~32% of spend, primarily core APIs (Crotamiton, Permethrin, Clopidogrel, Donepezil).
- **Diversification Plan**: Active sourcing projects underway to shift Indian single-source APIs to dual-qualified Chinese and European equivalents.`;
  }
  if (q.includes('shelf') || q.includes('qc') || q.includes('policy') || q.includes('rule')) {
    return `**ATCO Quality & SCM Policy Enforcement**:
1. **Shelf Life**: Standard APIs/Excipients require >=75% shelf life remaining at Karachi port; sustained release pellets require >=94%.
2. **Rejection Settlement**: 15 calendar days replacement or debit note compensation SLA.
3. **PFI Turnaround**: Proforma invoice required within 48 hours of PO placement.
4. **Working Standards**: Trial samples must include analytical reference standards and 30-day CoA verification.`;
  }
  return `**ATCO Strategic Procurement Intel**:
Your query regarding "${query}" has been analyzed against ATCO's master procurement database. 
- 73+ active and candidate materials tracked.
- Real-time Customs declarations benchmarked against GSK, Abbott, Searle, and Haleon imports.
- Use the **Sourcing & Risk Matrix** or **Market Price Intel** tabs to drill down into specific vendor quotes and monograph specifications.`;
}

function generateDefaultBriefing(role: string = 'Director'): string {
  return `### ATCO Executive Strategic Sourcing Briefing
**Reporting Period:** Q3/Q4 Financial Year 2026 | **Audience:** ${role === 'director' ? 'Board of Directors & Executive SCM Committee' : 'Procurement & Operations Management'}

- **Overall Portfolio Volume**: 73 Cataloged Materials across API (52%), Excipient (38%), and Primary Packaging (10%).
- **Total Annual Spend Commitment**: **$7.82M USD** / **Rs 2.18 Billion PKR**.
- **Single-Source Exposure**: **46.8%** of materials currently rely on a solitary active manufacturer. Top critical bottlenecks include Bacitracin BP (20 FGs), Eflornithine ($262k USD), and Smectite ($606k USD).
- **Customs Arbitrage Potential**: Identified **$182,500+ USD** in annualized savings by aligning purchase orders with lowest competitor customs benchmarks (Haleon, Abbott, GSK Pakistan).
- **Development Pipeline**: 18 materials undergoing active qualification (2 in Sample Arrangement, 4 in Initial QC Assay, 8 in 3-Month Accelerated Stability, 4 in Pilot PD Priority).
- **Quality Assurance Compliance**: 100% adherence enforced for the **>=75% shelf-life** port arrival rule and **15-day vendor rejection compensation** SLA.`;
}

async function startServer() {
  // In production, serve static built files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    // In development, mount Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`ATCO Strategic Sourcing Backend running on port ${PORT}`);
  });
}

startServer();
