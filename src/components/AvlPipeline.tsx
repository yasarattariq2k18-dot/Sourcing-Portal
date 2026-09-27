import React, { useState } from 'react';
import { MaterialItem } from '../types/procurement';
import { 
  FlaskConical, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  Search,
  Filter,
  FileCheck
} from 'lucide-react';

interface AvlPipelineProps {
  items: MaterialItem[];
  currency: 'USD' | 'PKR';
  onSelectMaterial: (item: MaterialItem) => void;
}

export const AvlPipeline: React.FC<AvlPipelineProps> = ({
  items,
  currency,
  onSelectMaterial
}) => {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');

  // Filter items that have pipeline activity
  const itemsWithPipeline = items.filter(it => 
    (it.parsedSamples && it.parsedSamples.length > 0) ||
    it.underDevCount > 0 ||
    it.underDevStage ||
    it.parsedRejections.length > 0
  );

  // Categorize by primary pipeline stage
  const underArrangement = items.filter(it => 
    it.underDevStage?.toLowerCase().includes('arrangement') ||
    it.parsedSamples?.some(s => s.stage === 'Under Arrangement')
  );

  const initialTesting = items.filter(it => 
    it.underDevStage?.toLowerCase().includes('initial') ||
    it.parsedSamples?.some(s => s.stage === 'Initial Testing')
  );

  const underStability = items.filter(it => 
    it.underDevStage?.toLowerCase().includes('stability') ||
    it.parsedSamples?.some(s => s.stage === 'Under Stability')
  );

  const pdPriority = items.filter(it => 
    it.underDevStage?.toLowerCase().includes('priority') ||
    it.parsedSamples?.some(s => s.stage === 'PD Priority')
  );

  const rejectedEvaluations = items.filter(it => 
    it.parsedRejections.length > 0 || 
    it.underDevStage?.toLowerCase().includes('reject')
  );

  const filteredItems = itemsWithPipeline.filter(it => {
    if (search) {
      const q = search.toLowerCase();
      if (!it.materialName.toLowerCase().includes(q) && !it.materialCode.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (stageFilter === 'arrangement' && !underArrangement.includes(it)) return false;
    if (stageFilter === 'initial' && !initialTesting.includes(it)) return false;
    if (stageFilter === 'stability' && !underStability.includes(it)) return false;
    if (stageFilter === 'pd' && !pdPriority.includes(it)) return false;
    if (stageFilter === 'rejected' && !rejectedEvaluations.includes(it)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Stage Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Approved Vendor List (AVL) & Development Pipeline</h2>
            <p className="text-xs text-slate-500 mt-1">
              Real-time monitoring of alternate vendor qualifications, stability studies, initial QC trials, and quality audit rejections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg">
              Active Trials: <strong className="font-mono">{itemsWithPipeline.length}</strong>
            </span>
          </div>
        </div>

        {/* Pipeline Stage Funnel Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          <div 
            onClick={() => setStageFilter(stageFilter === 'arrangement' ? 'all' : 'arrangement')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              stageFilter === 'arrangement' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-medium text-slate-500">1. Under Arrangement</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">{underArrangement.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Commercial & NDA stage</div>
          </div>

          <div 
            onClick={() => setStageFilter(stageFilter === 'initial' ? 'all' : 'initial')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              stageFilter === 'initial' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-medium text-slate-500">2. Initial QC Testing</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">{initialTesting.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Chemical assay & specs</div>
          </div>

          <div 
            onClick={() => setStageFilter(stageFilter === 'stability' ? 'all' : 'stability')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              stageFilter === 'stability' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-medium text-slate-500">3. Under Stability</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">{underStability.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">3M/6M accelerated test</div>
          </div>

          <div 
            onClick={() => setStageFilter(stageFilter === 'pd' ? 'all' : 'pd')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              stageFilter === 'pd' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-medium text-slate-500">4. PD Priority</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">{pdPriority.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Pilot batch clearance</div>
          </div>

          <div 
            onClick={() => setStageFilter(stageFilter === 'rejected' ? 'all' : 'rejected')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              stageFilter === 'rejected' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-medium text-rose-700">QC Rejections Log</div>
            <div className="text-xl font-bold font-mono text-rose-900 mt-1">{rejectedEvaluations.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Failed audit or assay</div>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate trial or material..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>
          {stageFilter !== 'all' && (
            <button
              onClick={() => setStageFilter('all')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>

      {/* Grid of Materials in Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => onSelectMaterial(item)}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">{item.materialCode}</span>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-1 mt-0.5">
                    {item.materialName}
                  </h3>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {item.category}
                </span>
              </div>

              {/* Current Active Baseline */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Current Active Mfg:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[170px] text-right">
                    {item.activeMfg || item.lastManufacturer || 'Validated'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 font-mono">
                  <span>Current Net Price:</span>
                  <span className="font-bold text-slate-900">
                    ${item.netPriceUSD} {item.uom ? `/${item.uom}` : ''}
                  </span>
                </div>
              </div>

              {/* Pipeline Candidate Samples */}
              <div className="mt-3 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Alternate Qualification Candidates
                </span>
                {item.parsedSamples && item.parsedSamples.length > 0 ? (
                  item.parsedSamples.slice(0, 3).map((sample, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded border border-slate-100 text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-800 truncate max-w-[180px]">{sample.vendor}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          sample.stage === 'Under Stability' 
                            ? 'bg-purple-100 text-purple-800' 
                            : sample.stage === 'Initial Testing'
                            ? 'bg-blue-100 text-blue-800'
                            : sample.stage === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {sample.stage}
                        </span>
                      </div>
                      {sample.quotePrice && (
                        <div className="flex justify-between text-slate-500 font-mono text-[10px]">
                          <span>Quote: ${sample.quotePrice}</span>
                          {sample.quotePrice < item.netPriceUSD ? (
                            <span className="text-emerald-600 font-semibold">
                              -${(item.netPriceUSD - sample.quotePrice).toFixed(2)} savings
                            </span>
                          ) : (
                            <span className="text-slate-400">Baseline parity</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-slate-400 italic py-1">
                    No active trial candidate on file
                  </div>
                )}

                {/* Quality Rejection Warnings if any */}
                {item.parsedRejections && item.parsedRejections.length > 0 && (
                  <div className="mt-2 p-2 rounded bg-rose-50/50 border border-rose-100 text-[11px] text-rose-800 space-y-1">
                    <div className="flex items-center gap-1 font-bold text-rose-900">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      QC Rejection History ({item.parsedRejections.length})
                    </div>
                    {item.parsedRejections.slice(0, 2).map((rej, rIdx) => (
                      <div key={rIdx} className="text-[10px] text-rose-700 leading-tight">
                        <strong>{rej.vendor}:</strong> {rej.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-medium">
              <span>View Dossier & Quotes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
