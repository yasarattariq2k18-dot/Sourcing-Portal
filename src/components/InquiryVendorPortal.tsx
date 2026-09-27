import React, { useState } from 'react';
import { MaterialItem, SourcingInquiry, VendorQuote } from '../types/procurement';
import { INITIAL_INQUIRIES, INITIAL_VENDOR_QUOTES } from '../data/vendorPortalData';
import { 
  Send, 
  Lock, 
  ShieldCheck, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Key, 
  UserCheck, 
  ArrowRight,
  TrendingDown,
  Building
} from 'lucide-react';

interface InquiryVendorPortalProps {
  materials: MaterialItem[];
  currency: 'USD' | 'PKR';
  onSelectMaterial: (item: MaterialItem) => void;
}

export const InquiryVendorPortal: React.FC<InquiryVendorPortalProps> = ({
  materials,
  currency,
  onSelectMaterial
}) => {
  const [inquiries, setInquiries] = useState<SourcingInquiry[]>(INITIAL_INQUIRIES);
  const [quotes, setQuotes] = useState<VendorQuote[]>(INITIAL_VENDOR_QUOTES);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>('INQ-2026-001');

  // Mode: 'ATCO_INTERNAL' vs 'VENDOR_SECURE_PORTAL'
  const [portalMode, setPortalMode] = useState<'ATCO_INTERNAL' | 'VENDOR_SECURE_PORTAL'>('ATCO_INTERNAL');
  const [currentVendorId, setCurrentVendorId] = useState<string>('V-NCPC');

  // New quote form state for vendor portal
  const [quoteForm, setQuoteForm] = useState({
    fobPriceUSD: 0,
    cfrPriceUSD: 0,
    moq: 100,
    leadTimeWeeks: 4,
    shelfLifePercent: 85,
    originCountry: 'China',
    paymentTerms: 'CAD 60 Days',
    workingStandardProvided: true,
    coaAttached: true,
    dmfAvailable: true,
    notes: ''
  });
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Auto inquiry generator state
  const [autoGenNotice, setAutoGenNotice] = useState<string | null>(null);

  const selectedInquiry = inquiries.find(i => i.id === selectedInquiryId) || inquiries[0];

  // Quotes for this inquiry
  const inquiryQuotes = quotes.filter(q => q.inquiryId === selectedInquiry?.id);

  // For vendor portal mode: ONLY quotes for THIS vendor (complete data isolation!)
  const vendorIsolatedQuotes = inquiryQuotes.filter(q => q.vendorId === currentVendorId);

  // Scan single source materials to trigger automated inquiry
  const handleAutoTriggerInquiry = (material: MaterialItem) => {
    const newInquiry: SourcingInquiry = {
      id: `INQ-2026-${String(inquiries.length + 1).padStart(3, '0')}`,
      materialCode: material.materialCode,
      materialName: material.materialName,
      category: material.category,
      targetAnnualQty: material.annualBuyingQty || 1000,
      targetLotQty: material.lastOrderQty || 250,
      uom: material.uom || 'KG',
      preferredOrigins: ['China', 'India', 'Europe'],
      targetPriceUSD: material.targetPriceUSD || (material.netPriceUSD * 0.7),
      lastContractPriceUSD: material.netPriceUSD,
      specStandard: `${material.category} Standard Specification / Monograph`,
      status: 'Sent to Vendors',
      createdAt: new Date().toLocaleDateString('en-GB'),
      invitedVendors: [
        { id: 'V-NCPC', name: 'North China Pharmaceutical (NCPC)', token: `magic_ncpc_${Date.now()}` },
        { id: 'V-HUAHAI', name: 'Zhejiang Huahai Pharmaceuticals', token: `magic_huahai_${Date.now()}` },
        { id: 'V-AUMGEN', name: 'Aumgen Pharma LLP', token: `magic_aumgen_${Date.now()}` }
      ],
      quotesCount: 0
    };

    setInquiries([newInquiry, ...inquiries]);
    setSelectedInquiryId(newInquiry.id);
    setAutoGenNotice(`Automated Alternate Sourcing Inquiry generated for ${material.materialName} (Code: ${material.materialCode}) with technical specs attached.`);
    setTimeout(() => setAutoGenNotice(null), 5000);
  };

  const handleVendorSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    // Check shelf life requirement rule (>= 75% for API/EXP and >= 94% for pellets)
    const isPellet = selectedInquiry.materialName.toLowerCase().includes('pellet');
    const minRequired = isPellet ? 94 : 75;

    const vendorNames: Record<string, string> = {
      'V-NCPC': 'North China Pharmaceutical (NCPC)',
      'V-HAITIAN': 'Gansu Haitian Pharma',
      'V-XELLIA': 'Xellia Pharmaceuticals Ltd',
      'V-HUAHAI': 'Zhejiang Huahai Pharmaceuticals',
      'V-WUHANRS': 'Wuhan RS Pharmaceutical',
      'V-AUMGEN': 'Aumgen Pharma LLP',
      'V-SYNTECH': 'Syn-Tech Chem & Pharm Co.',
      'V-HANDAN': 'Handan Yongnian District Liye Chemical',
      'V-ASENCE': 'Asence Pharma Pvt Ltd'
    };

    const targetVariance = selectedInquiry.targetPriceUSD > 0
      ? ((quoteForm.cfrPriceUSD - selectedInquiry.targetPriceUSD) / selectedInquiry.targetPriceUSD) * 100
      : 0;

    let score = 90;
    if (quoteForm.shelfLifePercent < minRequired) score -= 25;
    if (!quoteForm.dmfAvailable) score -= 15;
    if (!quoteForm.workingStandardProvided) score -= 10;
    if (targetVariance <= 0) score += 10;

    const newQuote: VendorQuote = {
      id: `Q-${Date.now().toString().slice(-4)}`,
      inquiryId: selectedInquiry.id,
      vendorId: currentVendorId,
      vendorName: vendorNames[currentVendorId] || 'Supplier International',
      materialCode: selectedInquiry.materialCode,
      materialName: selectedInquiry.materialName,
      originCountry: quoteForm.originCountry,
      fobPriceUSD: Number(quoteForm.fobPriceUSD),
      cfrPriceUSD: Number(quoteForm.cfrPriceUSD),
      moq: Number(quoteForm.moq),
      leadTimeWeeks: Number(quoteForm.leadTimeWeeks),
      shelfLifePercent: Number(quoteForm.shelfLifePercent),
      workingStandardProvided: quoteForm.workingStandardProvided,
      coaAttached: quoteForm.coaAttached,
      dmfAvailable: quoteForm.dmfAvailable,
      paymentTerms: quoteForm.paymentTerms,
      submittedAt: new Date().toLocaleDateString('en-GB'),
      complianceScore: Math.max(score, 40),
      targetRateVariancePct: targetVariance,
      notes: quoteForm.notes
    };

    setQuotes([newQuote, ...quotes]);
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Perspective Switcher & Isolation Assurance */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs uppercase tracking-wider font-mono text-emerald-700 font-bold">
              Isolated Bidding & Inquiry System
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Automated Sourcing Inquiry Engine & Zero-Leakage Supplier Portal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bids submitted by international vendors are sealed and mathematically isolated from competing bidders.
          </p>
        </div>

        {/* Portal Perspective Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setPortalMode('ATCO_INTERNAL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              portalMode === 'ATCO_INTERNAL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ATCO Procurement View
          </button>
          <button
            onClick={() => setPortalMode('VENDOR_SECURE_PORTAL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              portalMode === 'VENDOR_SECURE_PORTAL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Isolated Vendor Login</span>
          </button>
        </div>
      </div>

      {autoGenNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{autoGenNotice}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW A: ATCO INTERNAL PROCUREMENT EVALUATION & INQUIRY VIEW */}
      {/* ========================================================= */}
      {portalMode === 'ATCO_INTERNAL' && (
        <div className="space-y-6">
          {/* Active Inquiries List & Auto-Trigger Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Inquiries Selector (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Alternate Sourcing Inquiries</h3>
                  <p className="text-[11px] text-slate-500">Active formal tenders sent to vetted manufacturers</p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {inquiries.length} Inquiries
                </span>
              </div>

              <div className="space-y-2.5">
                {inquiries.map(inq => (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiryId(inq.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedInquiryId === inq.id
                        ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">{inq.id} · {inq.materialCode}</span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">{inq.materialName}</h4>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                        inq.status === 'Quotes Received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inq.status}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Target: ${inq.targetPriceUSD}/kg</span>
                      <span className="font-semibold text-indigo-700">
                        {quotes.filter(q => q.inquiryId === inq.id).length} Sealed Quotes
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Auto-Trigger Suggestions */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Quick Trigger: High-Risk Single Sources
                </span>
                <div className="space-y-1.5">
                  {materials.filter(m => m.sourceType.includes('Single') && m.fgCount >= 10).slice(0, 3).map(mat => (
                    <div
                      key={mat.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-900 block truncate">{mat.materialName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{mat.fgCount} FGs · ${mat.netPriceUSD}/kg</span>
                      </div>
                      <button
                        onClick={() => handleAutoTriggerInquiry(mat)}
                        className="px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-md shrink-0 transition-colors"
                      >
                        + Create Inquiry
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Private Multi-Vendor Evaluation Matrix (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-mono text-slate-400 font-semibold">{selectedInquiry.id}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      Internal Quote Evaluation Matrix: {selectedInquiry.materialName}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Target Price: <strong className="font-mono text-slate-800">${selectedInquiry.targetPriceUSD}</strong> · Contracted: <span className="font-mono text-slate-500">${selectedInquiry.lastContractPriceUSD}</span>
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                    {selectedInquiry.specStandard}
                  </span>
                </div>

                {/* Side-by-side Consolidated Vendor Bids Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="p-2">Vendor Name</th>
                        <th className="p-2">Origin</th>
                        <th className="p-2 text-right">CFR Price</th>
                        <th className="p-2 text-right">Target Variance</th>
                        <th className="p-2 text-center">Shelf Life %</th>
                        <th className="p-2 text-center">Compliance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {inquiryQuotes.map(q => {
                        const isUnderTarget = q.targetRateVariancePct <= 0;
                        const isShelfLifeOk = q.shelfLifePercent >= 75;

                        return (
                          <tr key={q.id} className="hover:bg-slate-50">
                            <td className="p-2 font-sans font-medium text-slate-900">
                              {q.vendorName}
                              <span className="text-[10px] text-slate-400 block font-mono">{q.paymentTerms}</span>
                            </td>
                            <td className="p-2 font-sans text-slate-700">{q.originCountry}</td>
                            <td className="p-2 text-right font-bold text-slate-900">
                              ${q.cfrPriceUSD.toFixed(2)}
                            </td>
                            <td className="p-2 text-right font-semibold">
                              <span className={isUnderTarget ? 'text-emerald-700' : 'text-rose-700'}>
                                {q.targetRateVariancePct > 0 ? `+${q.targetRateVariancePct.toFixed(1)}%` : `${q.targetRateVariancePct.toFixed(1)}%`}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <span className={isShelfLifeOk ? 'text-slate-800' : 'text-rose-600 font-bold'}>
                                {q.shelfLifePercent}%
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                q.complianceScore >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {q.complianceScore}/100
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Commercial Recommendation */}
                {inquiryQuotes.length > 0 && (
                  <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                    <strong className="text-slate-900 block font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Procurement Sourcing Recommendation:
                    </strong>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      Vendor <strong>{inquiryQuotes[0].vendorName}</strong> offers the best commercial and regulatory balance at <strong>${inquiryQuotes[0].cfrPriceUSD}/kg</strong> (Compliance Score: {inquiryQuotes[0].complianceScore}/100, CoA & DMF attached). Switching provides estimated annual portfolio savings of ${( (selectedInquiry.lastContractPriceUSD - inquiryQuotes[0].cfrPriceUSD) * selectedInquiry.targetAnnualQty ).toLocaleString()} USD.
                    </p>
                  </div>
                )}
              </div>

              {/* Private Magic Links Panel */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Invited Vendor Access Tokens:</span>
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  {selectedInquiry.invitedVendors.map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setCurrentVendorId(v.id);
                        setPortalMode('VENDOR_SECURE_PORTAL');
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                      title={`Simulate logging in as ${v.name}`}
                    >
                      {v.name.split(' ')[0]} ↗
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW B: ISOLATED VENDOR BIDDING PORTAL (DATA ISOLATION!) */}
      {/* ========================================================= */}
      {portalMode === 'VENDOR_SECURE_PORTAL' && (
        <div className="bg-white border-2 border-emerald-500/80 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Security & Data Privacy Notice Banner */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">ATCO Secure Vendor Portal — Isolated Session</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold">
                    Authenticated: {currentVendorId}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Data Isolation Active: You can only view your own quotation and documents. Competitor bids are completely confidential.
                </p>
              </div>
            </div>

            {/* Switch vendor token simulation */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-800 font-medium">Switch Vendor Account:</span>
              <select
                value={currentVendorId}
                onChange={e => setCurrentVendorId(e.target.value)}
                className="bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium"
              >
                <option value="V-NCPC">North China Pharmaceutical (China)</option>
                <option value="V-HAITIAN">Gansu Haitian Pharma (China)</option>
                <option value="V-HUAHAI">Zhejiang Huahai (China)</option>
                <option value="V-AUMGEN">Aumgen Pharma (India)</option>
                <option value="V-SYNTECH">Syn-Tech Chem & Pharm (Taiwan)</option>
              </select>
            </div>
          </div>

          {/* Assigned Material Inquiry Specifications */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400">Assigned Inquiry: {selectedInquiry.id}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{selectedInquiry.materialName} ({selectedInquiry.materialCode})</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Specification Monograph: <strong>{selectedInquiry.specStandard}</strong> · Annual Estimated Volume: {selectedInquiry.targetAnnualQty.toLocaleString()} {selectedInquiry.uom}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-medium">
                Lot Batch Target: {selectedInquiry.targetLotQty} {selectedInquiry.uom}
              </span>
            </div>
          </div>

          {/* Previous Submissions by This Vendor (ISOLATED) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Your Current Active Quotation on File
            </h4>
            {vendorIsolatedQuotes.length > 0 ? (
              vendorIsolatedQuotes.map(q => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-900 text-sm">
                      Quoted CFR Karachi: ${q.cfrPriceUSD}/kg (FOB: ${q.fobPriceUSD}/kg)
                    </span>
                    <span className="text-slate-500">Submitted: {q.submittedAt}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 font-mono text-[11px] pt-1">
                    <div>MOQ: {q.moq} kg</div>
                    <div>Lead Time: {q.leadTimeWeeks} weeks</div>
                    <div>Shelf Life: {q.shelfLifePercent}%</div>
                    <div>Terms: {q.paymentTerms}</div>
                  </div>
                  <div className="text-[11px] text-slate-500 italic pt-1">
                    Notes: {q.notes || 'None provided'}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs text-center italic">
                No active quotation submitted yet for this inquiry. Use the form below to submit your commercial offer.
              </div>
            )}
          </div>

          {/* Structured Quote Submission Form */}
          <form onSubmit={handleVendorSubmitQuote} className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Submit / Revise Commercial Quotation
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">FOB Price USD/KG *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 420.00"
                  value={quoteForm.fobPriceUSD || ''}
                  onChange={e => setQuoteForm({ ...quoteForm, fobPriceUSD: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">CFR Karachi Price USD/KG *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 435.00"
                  value={quoteForm.cfrPriceUSD || ''}
                  onChange={e => setQuoteForm({ ...quoteForm, cfrPriceUSD: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Country of Origin *</label>
                <input
                  type="text"
                  required
                  value={quoteForm.originCountry}
                  onChange={e => setQuoteForm({ ...quoteForm, originCountry: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Minimum Order Qty (MOQ) *</label>
                <input
                  type="number"
                  value={quoteForm.moq}
                  onChange={e => setQuoteForm({ ...quoteForm, moq: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lead Time (Weeks) *</label>
                <input
                  type="number"
                  value={quoteForm.leadTimeWeeks}
                  onChange={e => setQuoteForm({ ...quoteForm, leadTimeWeeks: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Residual Shelf Life % *</label>
                  <span className="text-[10px] text-slate-400">Min 75% rule</span>
                </div>
                <input
                  type="number"
                  value={quoteForm.shelfLifePercent}
                  onChange={e => setQuoteForm({ ...quoteForm, shelfLifePercent: parseInt(e.target.value) || 0 })}
                  className={`w-full bg-white border rounded-lg px-3 py-2 text-slate-900 font-mono ${
                    quoteForm.shelfLifePercent < 75 ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                {quoteForm.shelfLifePercent < 75 && (
                  <span className="text-[10px] text-rose-600 block mt-0.5">
                    ATCO Policy Violation: Shelf life must be &ge;75% at Karachi Port arrival!
                  </span>
                )}
              </div>
            </div>

            {/* Regulatory Checks */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={quoteForm.workingStandardProvided}
                  onChange={e => setQuoteForm({ ...quoteForm, workingStandardProvided: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>Free Analytical Working Standard Included</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={quoteForm.dmfAvailable}
                  onChange={e => setQuoteForm({ ...quoteForm, dmfAvailable: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>Open DMF / CEP Dossier Available</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={quoteForm.coaAttached}
                  onChange={e => setQuoteForm({ ...quoteForm, coaAttached: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>Batch Certificate of Analysis (CoA) Attached</span>
              </label>
            </div>

            <div className="text-xs">
              <label className="font-semibold text-slate-700 block mb-1">Additional Notes / Capacity Commitments</label>
              <textarea
                rows={2}
                placeholder="Specify regulatory certificates, warehouse temperature controls, or payment remarks..."
                value={quoteForm.notes}
                onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 font-mono">
                Quote will be digitally signed and transmitted to ATCO SCM Directorate.
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Confidential Quotation</span>
              </button>
            </div>

            {submissionSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-900 text-xs rounded-lg font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Quotation successfully submitted and locked in ATCO Central Evaluation Matrix!</span>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
