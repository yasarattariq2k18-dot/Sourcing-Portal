import React from 'react';
import { MaterialItem } from '../types/procurement';
import { 
  X, 
  Building2, 
  DollarSign, 
  ShieldCheck, 
  FileWarning, 
  Globe, 
  Layers, 
  TrendingDown,
  CheckCircle,
  Clock,
  Calendar,
  UserCheck
} from 'lucide-react';

interface MaterialModalProps {
  item: MaterialItem | null;
  onClose: () => void;
  currency: 'USD' | 'PKR';
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  item,
  onClose,
  currency
}) => {
  if (!item) return null;

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

  const isSingle = item.sourceType?.toLowerCase().includes('single') || item.activeMfgCount === 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded font-semibold">
                {item.materialCode}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                {item.type} · {item.category}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Class {item.classValue || 'C'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1.5 leading-snug">
              {item.materialName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 block">Annual Spend</span>
              <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                {formatMoney(item.annualBuyingValueUSD, item.annualBuyingValuePKR)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {item.percentageAnnualSpendUSD ? `${item.percentageAnnualSpendUSD.toFixed(2)}% of total` : 'Tracked'}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 block">Last Net Price</span>
              <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                ${item.netPriceUSD.toFixed(2)} <span className="text-xs text-slate-400 font-sans">/{item.uom}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Rs {item.lastNetPricePKR.toLocaleString()}
              </span>
            </div>

            <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
              <span className="text-[11px] font-medium text-emerald-800 block">Target Rate (-30%)</span>
              <span className="text-lg font-bold font-mono text-emerald-950 mt-0.5 block">
                ${item.targetPriceUSD.toFixed(2)} <span className="text-xs text-emerald-600 font-sans">/{item.uom}</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-mono">
                Target negotiation ceiling
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 block">Finished Goods Impact</span>
              <span className={`text-lg font-bold font-mono mt-0.5 block ${item.fgCount >= 20 ? 'text-rose-600' : 'text-slate-900'}`}>
                {item.fgCount} Formulations
              </span>
              <span className="text-[10px] text-slate-400">
                {isSingle ? 'High Single-Source Risk' : 'Dual-Sourced nominal'}
              </span>
            </div>
          </div>

          {/* Sourcing & Manufacturer Mapping */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              Approved Vendor List (AVL) Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                <span className="text-emerald-700 font-bold block flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Active Validated Manufacturers ({item.activeMfgCount})
                </span>
                <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                  {item.activeMfg || 'None listed'}
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  Origin: <strong className="text-slate-700">{item.activeMfgOrigin || 'Not Specified'}</strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                <span className="text-slate-500 font-bold block">
                  Inactive / Historical Manufacturers ({item.inactiveMfgCount})
                </span>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                  {item.inactiveMfg || 'No inactive alternate manufacturers on file'}
                </p>
                {item.inactiveMfgOrigin && (
                  <div className="text-[11px] text-slate-400 pt-1">
                    Origin: {item.inactiveMfgOrigin}
                  </div>
                )}
              </div>
            </div>

            {/* Commercial Execution Meta */}
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block">Last Contracted Supplier:</span>
                <span className="font-semibold text-slate-800">{item.lastSupplier || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Last PO Date:</span>
                <span className="font-semibold text-slate-800 font-mono">{item.lastPoDate || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Procurement Indentor:</span>
                <span className="font-semibold text-slate-800">{item.lastIndentor || '-'}</span>
              </div>
            </div>
          </div>

          {/* Alternate Candidates & Qualification Pipeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Qualification & Sourcing Development Pipeline
            </h3>

            {item.parsedSamples && item.parsedSamples.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.parsedSamples.map((sample, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{sample.vendor}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                        {sample.stage}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Origin: {sample.origin}
                    </div>
                    {sample.quotePrice && (
                      <div className="flex justify-between font-mono pt-1 text-[11px]">
                        <span className="text-slate-500">Offered Price:</span>
                        <span className="font-bold text-slate-900">${sample.quotePrice.toFixed(2)}</span>
                      </div>
                    )}
                    {sample.notes && (
                      <div className="text-[10px] text-slate-500 italic pt-0.5">
                        {sample.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No trial samples currently undergoing stability or testing for this material code.
              </p>
            )}

            {/* Quality Rejection Log */}
            {item.parsedRejections && item.parsedRejections.length > 0 && (
              <div className="mt-3 p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-rose-950">
                  <FileWarning className="w-4 h-4 text-rose-600" />
                  Quality Evaluation Failure Log
                </div>
                <div className="space-y-1.5">
                  {item.parsedRejections.map((rej, rIdx) => (
                    <div key={rIdx} className="bg-white/80 p-2 rounded border border-rose-100 text-[11px]">
                      <div className="font-semibold text-rose-900">
                        {rej.vendor} ({rej.country})
                      </div>
                      <div className="text-rose-700 mt-0.5">
                        Reason: {rej.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Competitor Customs Data (CD) Market Intelligence */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                Customs Market Price Benchmarks (Competitor Imports)
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Pakistan Customs Feed</span>
            </div>

            {item.parsedCdBelow && item.parsedCdBelow.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-emerald-800 block">
                  Suppliers Below Our Net Price (${item.netPriceUSD.toFixed(2)})
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                  {item.parsedCdBelow.map((deal, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {deal.customer}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Supplier: {deal.supplier} ({deal.country}) · Date: {deal.date}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-emerald-700 text-sm">
                          ${deal.pricePerUnit.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Qty: {deal.lastQty}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No active competitor import records below current net price in recent customs filings.
              </p>
            )}

            {/* Competitor records above net price */}
            {item.parsedCdAbove && item.parsedCdAbove.length > 0 && (
              <div className="space-y-2 mt-4">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  Higher Market Price References (Peer Pharma Companies)
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                  {item.parsedCdAbove.slice(0, 3).map((deal, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {deal.customer}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Supplier: {deal.supplier} ({deal.country}) · Date: {deal.date}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-slate-700">
                          ${deal.pricePerUnit.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Qty: {deal.lastQty}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Annual PO Volume: {item.annualBuyingQty ? item.annualBuyingQty.toLocaleString() : 'N/A'} {item.uom}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
