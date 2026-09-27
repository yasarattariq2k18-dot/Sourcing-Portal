import React, { useState } from 'react';
import { MaterialItem } from '../types/procurement';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  FileWarning, 
  ExternalLink 
} from 'lucide-react';

interface RiskMatrixProps {
  items: MaterialItem[];
  currency: 'USD' | 'PKR';
  onSelectMaterial: (item: MaterialItem) => void;
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({
  items,
  currency,
  onSelectMaterial
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'single' | 'high-fg' | 'india-dep' | 'rejections'>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');

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

  // Classifications
  const singleSources = items.filter(it => 
    it.sourceType?.toLowerCase().includes('single') || it.activeMfgCount === 1
  );
  const multiSources = items.filter(it => !singleSources.includes(it));

  const indianOriginItems = items.filter(it => 
    (it.activeMfgOrigin || '').toUpperCase().includes('INDIA') || 
    (it.materialClassification || '').toUpperCase().includes('INDIAN')
  );

  const rejectionsItems = items.filter(it => it.parsedRejections.length > 0 || (it.rejectedDetails && it.rejectedDetails.length > 5));

  // Filtered list
  const filteredItems = items.filter(it => {
    if (activeFilter === 'single' && !singleSources.includes(it)) return false;
    if (activeFilter === 'high-fg' && it.fgCount < 15) return false;
    if (activeFilter === 'india-dep' && !indianOriginItems.includes(it)) return false;
    if (activeFilter === 'rejections' && it.parsedRejections.length === 0 && (!it.rejectedDetails || it.rejectedDetails.length <= 5)) return false;
    if (selectedOrigin !== 'all') {
      const orig = (it.activeMfgOrigin || '').toUpperCase();
      if (!orig.includes(selectedOrigin)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sourcing Risk Dashboard Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Sourcing Vulnerability & Geopolitical Risk</h2>
            <p className="text-xs text-slate-500 mt-1">
              Analysis of single-source exposures, finished goods reliance, India/China dependency, and vendor QC rejection logs
            </p>
          </div>
          {/* Risk Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
              Single-Source SKUs: <strong className="font-mono">{singleSources.length}</strong>
            </span>
            <span className="text-xs font-medium px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg">
              Known Quality Rejections: <strong className="font-mono">{rejectionsItems.length}</strong>
            </span>
            <span className="text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg">
              India Sourced: <strong className="font-mono">{indianOriginItems.length}</strong>
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setActiveFilter('single')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeFilter === 'single'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Single Sourced ({singleSources.length})
            </button>
            <button
              onClick={() => setActiveFilter('high-fg')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeFilter === 'high-fg'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High FG Impact (&ge;15)
            </button>
            <button
              onClick={() => setActiveFilter('india-dep')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeFilter === 'india-dep'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              India Dependency
            </button>
            <button
              onClick={() => setActiveFilter('rejections')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeFilter === 'rejections'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vendor Rejections
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Filter Origin:</span>
            <select
              value={selectedOrigin}
              onChange={e => setSelectedOrigin(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">All Origins</option>
              <option value="CHINA">China</option>
              <option value="INDIA">India</option>
              <option value="GERMANY">Germany</option>
              <option value="PAKISTAN">Pakistan</option>
              <option value="MALAYSIA">Malaysia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sourcing Strategy Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Single vs Multi Source Split</h3>
            <span className="text-xs font-mono text-slate-400">AVL Balance</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {singleSources.length} <span className="text-xs text-slate-500 font-normal">Single</span>
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              {multiSources.length} <span className="text-xs text-slate-500 font-normal">Multi</span>
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
            <div
              className="bg-amber-500 h-full"
              style={{ width: `${(singleSources.length / items.length) * 100}%` }}
              title="Single Source"
            />
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(multiSources.length / items.length) * 100}%` }}
              title="Multi Source"
            />
          </div>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            {((singleSources.length / items.length) * 100).toFixed(0)}% of items currently have single active manufacturer. Dual-sourcing projects in progress.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">India Concentration</h3>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {indianOriginItems.length} <span className="text-xs text-slate-500 font-normal">SKUs</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({((indianOriginItems.length / items.length) * 100).toFixed(1)}%)
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            Cross-border regulatory exposure monitored. Active initiatives shifting critical APIs (e.g. Voriconazole, Clopidogrel, Montelukast) to dual China/Europe sources.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">QC & Audit Gatekeeping</h3>
            <FileWarning className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 font-mono">
              {rejectionsItems.length}
            </span>
            <span className="text-xs text-slate-500 font-normal">Vendors Failed Quality Audits</span>
          </div>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            Supplier samples failed on assay stability, dissolution variations, lack of DMF, or audit non-conformance. Kept in vendor audit log.
          </p>
        </div>
      </div>

      {/* Main Risk Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sourcing Risk Assessment Register</h3>
            <span className="text-xs text-slate-500">Showing {filteredItems.length} materials matching criteria</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Code & Material</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Active Mfg Origin</th>
                <th className="py-3 px-3 text-center">Active AVL</th>
                <th className="py-3 px-3 text-center">FG Exposure</th>
                <th className="py-3 px-3">Sourcing Type</th>
                <th className="py-3 px-3 text-right">Annual Spend</th>
                <th className="py-3 px-4 text-center">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => {
                const isSingle = item.sourceType?.toLowerCase().includes('single') || item.activeMfgCount === 1;
                const isHighFG = item.fgCount >= 20;
                const hasRejection = item.parsedRejections.length > 0 || (item.rejectedDetails && item.rejectedDetails.length > 5);

                let riskLevel = 'LOW';
                if (isSingle && isHighFG) riskLevel = 'CRITICAL';
                else if (isSingle || isHighFG || hasRejection) riskLevel = 'MEDIUM';

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectMaterial(item)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 line-clamp-1">{item.materialName}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{item.materialCode}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-700">{item.type}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-800 font-medium">{item.activeMfgOrigin || 'Global'}</span>
                      <span className="text-slate-400 block text-[11px] truncate max-w-[150px]">
                        {item.activeMfg || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums font-semibold">
                      {item.activeMfgCount} Active
                      {item.inactiveMfgCount > 0 && (
                        <span className="text-slate-400 font-normal block text-[10px]">
                          +{item.inactiveMfgCount} Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums font-bold">
                      <span className={item.fgCount >= 20 ? 'text-rose-600' : 'text-slate-700'}>
                        {item.fgCount}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={isSingle ? 'text-amber-800 font-medium' : 'text-slate-700'}>
                        {item.sourceType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                      {formatMoney(item.annualBuyingValueUSD, item.annualBuyingValuePKR)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide ${
                          riskLevel === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : riskLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {riskLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
