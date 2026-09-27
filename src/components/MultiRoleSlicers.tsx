import React, { useState } from 'react';
import { MaterialItem, SlicerState, UserRole } from '../types/procurement';
import { 
  Filter, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle, 
  Clock, 
  FileSpreadsheet, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';

interface MultiRoleSlicersProps {
  items: MaterialItem[];
  slicerState: SlicerState;
  setSlicerState: React.Dispatch<React.SetStateAction<SlicerState>>;
  currency: 'USD' | 'PKR';
  onSelectMaterial: (item: MaterialItem) => void;
}

export const MultiRoleSlicers: React.FC<MultiRoleSlicersProps> = ({
  items,
  slicerState,
  setSlicerState,
  currency,
  onSelectMaterial
}) => {
  const [reportModalType, setReportModalType] = useState<'director' | 'manager' | 'qc' | null>(null);

  const PKR_RATE = 278.5;
  const formatMoney = (usd: number, pkr?: number) => {
    if (currency === 'PKR') {
      const val = pkr || usd * PKR_RATE;
      if (val >= 10000000) return `Rs ${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `Rs ${(val / 100000).toFixed(2)} L`;
      return `Rs ${Math.round(val).toLocaleString()}`;
    }
    if (usd >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`;
    if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k`;
    return `$${Math.round(usd).toLocaleString()}`;
  };

  // Filter items according to global slicer state
  const filtered = items.filter(it => {
    if (slicerState.category !== 'ALL' && it.type !== slicerState.category) return false;
    if (slicerState.sourcing !== 'ALL') {
      const isSingle = it.sourceType?.toLowerCase().includes('single') || it.activeMfgCount === 1;
      if (slicerState.sourcing === 'Single Source' && !isSingle) return false;
      if (slicerState.sourcing === 'Multi Source' && isSingle) return false;
      if (slicerState.sourcing === 'Fixed Source' && !it.sourceType.includes('Fixed')) return false;
    }
    if (slicerState.originRegion !== 'ALL') {
      const origin = (it.activeMfgOrigin || '').toUpperCase();
      if (slicerState.originRegion === 'IMPORT' && it.sourceOrigin !== 'IMPORT') return false;
      if (slicerState.originRegion === 'LOCAL' && it.sourceOrigin !== 'LOCAL') return false;
      if (slicerState.originRegion === 'CHINA' && !origin.includes('CHINA')) return false;
      if (slicerState.originRegion === 'INDIA' && !origin.includes('INDIA')) return false;
      if (slicerState.originRegion === 'EUROPE' && !/GERMANY|FRANCE|SPAIN|ITALY|UK|BELGIUM/i.test(origin)) return false;
      if (slicerState.originRegion === 'SE_ASIA' && !/MALAYSIA|TAIWAN|KOREA|SINGAPORE/i.test(origin)) return false;
    }
    if (slicerState.pipelinePhase !== 'ALL') {
      if (slicerState.pipelinePhase === 'Commercial' && it.avlStatus !== 'Active') return false;
      if (slicerState.pipelinePhase === 'Under Development' && (!it.underDevStage || it.underDevCount === 0)) return false;
      if (slicerState.pipelinePhase === 'Under Stability' && !it.underDevStage?.toLowerCase().includes('stability')) return false;
      if (slicerState.pipelinePhase === 'Critical High-Risk' && !(it.activeMfgCount === 1 && it.fgCount >= 15)) return false;
    }
    if (slicerState.searchQuery) {
      const q = slicerState.searchQuery.toLowerCase();
      if (!it.materialName.toLowerCase().includes(q) && !it.materialCode.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Download Handlers for custom reports
  const downloadReportCSV = (reportTitle: string, reportHeaders: string[], rowsData: any[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [reportHeaders.join(','), ...rowsData.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDirectorReport = () => {
    const headers = ['Code', 'Material Name', 'Type', 'Source Type', 'Active Mfgs', 'Net Price USD', 'Target Price USD', 'Target Variance %', 'Annual Spend USD', 'Annual Spend PKR'];
    const rows = filtered.map(it => [
      `"${it.materialCode}"`,
      `"${it.materialName}"`,
      it.type,
      `"${it.sourceType}"`,
      it.activeMfgCount,
      it.netPriceUSD,
      it.targetPriceUSD,
      it.netPriceUSD > 0 ? (((it.netPriceUSD - it.targetPriceUSD) / it.netPriceUSD) * 100).toFixed(1) : 0,
      it.annualBuyingValueUSD,
      it.annualBuyingValuePKR
    ]);
    downloadReportCSV('ATCO_Directors_Executive_Summary_Report', headers, rows);
  };

  const handleExportManagerReport = () => {
    const headers = ['Code', 'Material Name', 'Last Supplier', 'Last Indentor', 'Last PO Date', 'Annual Qty', 'Last Order Qty', 'UOM', 'Under Dev Stage', 'Candidate Samples'];
    const rows = filtered.map(it => [
      `"${it.materialCode}"`,
      `"${it.materialName}"`,
      `"${it.lastSupplier}"`,
      `"${it.lastIndentor}"`,
      `"${it.lastPoDate}"`,
      it.annualBuyingQty,
      it.lastOrderQty,
      it.uom,
      `"${it.underDevStage || 'None'}"`,
      `"${it.parsedSamples.map(s => s.vendor).join('; ')}"`
    ]);
    downloadReportCSV('ATCO_Managers_Operational_Tracker', headers, rows);
  };

  const handleExportQcReport = () => {
    const headers = ['Code', 'Material Name', 'QC Validated Mfg', 'QC Mfg Origin', 'Shelf Life Min Req %', 'Rejection Log Count', 'Rejection Notes', 'Working Standard Status'];
    const rows = filtered.map(it => [
      `"${it.materialCode}"`,
      `"${it.materialName}"`,
      `"${it.qcMfgName || it.activeMfg}"`,
      `"${it.qcMfgOrigin || it.activeMfgOrigin}"`,
      it.category?.toLowerCase().includes('pellet') ? '>=94%' : '>=75%',
      it.parsedRejections.length,
      `"${it.rejectedDetails?.replace(/"/g, '""') || 'Clean Record'}"`,
      'Required with 3 batches'
    ]);
    downloadReportCSV('ATCO_QC_Regulatory_Audit_Report', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Slicer Navigation & Role Selection Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-mono text-slate-400 font-bold block">
              Multi-Role Procurement Slicer Suite
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
              Role-Based Filter & Instant Ad-Hoc Report Generator
            </h2>
          </div>

          {/* Role Slicer Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['director', 'manager', 'qc', 'agent'] as UserRole[]).map(role => (
              <button
                key={role}
                onClick={() => setSlicerState(prev => ({ ...prev, role }))}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                  slicerState.role === role
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {role === 'director' ? 'Director / C-Suite' : role === 'manager' ? 'Procurement Mgr' : role === 'qc' ? 'QC & Audit' : 'Sourcing Agent'}
              </button>
            ))}
          </div>
        </div>

        {/* Global Slicers Dropdown Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Category Slicer */}
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Category</label>
            <select
              value={slicerState.category}
              onChange={e => setSlicerState(prev => ({ ...prev, category: e.target.value as any }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="API">Active Pharma Ingredients (API)</option>
              <option value="EXP">Excipients (EXP)</option>
              <option value="PM">Primary Packaging (PM)</option>
            </select>
          </div>

          {/* Sourcing Classification */}
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Sourcing Model</label>
            <select
              value={slicerState.sourcing}
              onChange={e => setSlicerState(prev => ({ ...prev, sourcing: e.target.value as any }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-medium"
            >
              <option value="ALL">All Models</option>
              <option value="Single Source">Single Source (High Exposure)</option>
              <option value="Multi Source">Multi-Source (Dual+)</option>
              <option value="Fixed Source">Fixed Source</option>
            </select>
          </div>

          {/* Origin / Region */}
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Origin / Region</label>
            <select
              value={slicerState.originRegion}
              onChange={e => setSlicerState(prev => ({ ...prev, originRegion: e.target.value as any }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-medium"
            >
              <option value="ALL">Global All</option>
              <option value="IMPORT">All Imports</option>
              <option value="LOCAL">Local Pakistan</option>
              <option value="CHINA">China Supply Line</option>
              <option value="INDIA">India Supply Line</option>
              <option value="EUROPE">European Union</option>
              <option value="SE_ASIA">SE Asia (Malaysia/Singapore)</option>
            </select>
          </div>

          {/* Pipeline Phase */}
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Pipeline Phase</label>
            <select
              value={slicerState.pipelinePhase}
              onChange={e => setSlicerState(prev => ({ ...prev, pipelinePhase: e.target.value as any }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-medium"
            >
              <option value="ALL">All Phases</option>
              <option value="Commercial">Active Commercial AVL</option>
              <option value="Under Development">Under Development / Testing</option>
              <option value="Under Stability">Accelerated Stability</option>
              <option value="Critical High-Risk">Critical High-Risk Only</option>
            </select>
          </div>
        </div>

        {/* 1-Click Exporters Banner */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-mono">
            Active Filter Result: <strong className="text-slate-900">{filtered.length}</strong> Materials Matching Filter
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setReportModalType('director')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Director's Summary</span>
            </button>
            <button
              onClick={() => setReportModalType('manager')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span>Manager's Tracker</span>
            </button>
            <button
              onClick={() => setReportModalType('qc')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
              <span>QC & Audit Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role-Specific Contextual View Area */}
      {slicerState.role === 'director' && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-950 flex items-start justify-between gap-4">
          <div>
            <strong className="block font-semibold">Executive Director Perspective Active:</strong>
            <span>Showing high-level financial commitments, single-source board vulnerabilities, and 30% target rate gaps.</span>
          </div>
          <button
            onClick={handleExportDirectorReport}
            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Export Director CSV
          </button>
        </div>
      )}

      {slicerState.role === 'qc' && (
        <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 text-xs text-rose-950 flex items-start justify-between gap-4">
          <div>
            <strong className="block font-semibold">Quality Control & Regulatory Audit Perspective Active:</strong>
            <span>Auditing shelf-life standards (&ge;75% for APIs and &ge;94% for pellets), working standards, and vendor rejection logs.</span>
          </div>
          <button
            onClick={handleExportQcReport}
            className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Export QC Audit CSV
          </button>
        </div>
      )}

      {/* Filtered Materials Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Code & Description</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Active Mfg Origin</th>
                <th className="py-3 px-3 text-center">FGs</th>
                <th className="py-3 px-3">Sourcing Type</th>
                <th className="py-3 px-3 text-right">Net Price</th>
                <th className="py-3 px-3 text-right">Target Rate</th>
                <th className="py-3 px-4 text-right">Annual Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr
                  key={item.id}
                  onClick={() => onSelectMaterial(item)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-600 line-clamp-1">
                      {item.materialName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {item.materialCode} · {item.sourceOrigin}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-700">{item.type}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800 block truncate max-w-[150px]">
                      {item.activeMfgOrigin || 'Global'}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">
                      {item.activeMfg || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold">
                    <span className={item.fgCount >= 20 ? 'text-rose-600' : 'text-slate-700'}>
                      {item.fgCount}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={item.sourceType.includes('Single') ? 'text-amber-800 font-medium' : 'text-slate-700'}>
                      {item.sourceType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                    ${item.netPriceUSD.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                    ${item.targetPriceUSD.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                    {formatMoney(item.annualBuyingValueUSD, item.annualBuyingValuePKR)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ad-Hoc Report Preview Modal */}
      {reportModalType && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setReportModalType(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden p-6 space-y-4 max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs uppercase font-mono text-slate-400 font-bold">
                  Official ATCO Procurement Document
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {reportModalType === 'director' ? "Director's Executive Summary Report" : reportModalType === 'manager' ? "Manager's Operational Tracker" : "QC & Regulatory Audit Compliance Report"}
                </h3>
              </div>
              <button
                onClick={() => setReportModalType(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto text-xs space-y-3 p-1">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
                <div>Document Generated: {new Date().toLocaleDateString()} | Author: ATCO SCM Directorate</div>
                <div>Scope: {filtered.length} Materials evaluated under active filter criteria</div>
                <div>Status: Verified and Compliant with ATCO SCM Operating Policy</div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2">Code</th>
                      <th className="p-2">Material</th>
                      <th className="p-2">Key Metric</th>
                      <th className="p-2 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filtered.slice(0, 10).map(it => (
                      <tr key={it.id}>
                        <td className="p-2 text-slate-500">{it.materialCode}</td>
                        <td className="p-2 font-sans font-medium text-slate-900">{it.materialName}</td>
                        <td className="p-2 text-slate-600 font-sans">
                          {reportModalType === 'director' ? `Target Gap: $${(it.netPriceUSD - it.targetPriceUSD).toFixed(2)}` : reportModalType === 'manager' ? `Last PO: ${it.lastPoDate || 'N/A'}` : `Rejections: ${it.parsedRejections.length}`}
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          {formatMoney(it.annualBuyingValueUSD)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
              </button>

              <button
                onClick={() => {
                  if (reportModalType === 'director') handleExportDirectorReport();
                  else if (reportModalType === 'manager') handleExportManagerReport();
                  else handleExportQcReport();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                <Download className="w-3.5 h-3.5" /> Download Full CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
