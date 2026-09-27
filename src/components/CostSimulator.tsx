import React, { useState } from 'react';
import { MaterialItem } from '../types/procurement';
import { 
  Sliders, 
  TrendingDown, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  Scale
} from 'lucide-react';

interface CostSimulatorProps {
  items: MaterialItem[];
  currency: 'USD' | 'PKR';
  onSelectMaterial: (item: MaterialItem) => void;
}

export const CostSimulator: React.FC<CostSimulatorProps> = ({
  items,
  currency,
  onSelectMaterial
}) => {
  const [renegotiationPct, setRenegotiationPct] = useState<number>(15);
  const [targetScope, setTargetScope] = useState<'all' | 'classA' | 'apiOnly' | 'singleOnly'>('classA');
  const [useMarketBenchmark, setUseMarketBenchmark] = useState<boolean>(true);

  const PKR_RATE = 278.5;
  const formatMoney = (usd: number) => {
    if (currency === 'PKR') {
      const pkr = usd * PKR_RATE;
      if (pkr >= 10000000) return `Rs ${(pkr / 10000000).toFixed(2)} Cr`;
      if (pkr >= 100000) return `Rs ${(pkr / 100000).toFixed(2)} L`;
      return `Rs ${Math.round(pkr).toLocaleString()}`;
    }
    if (usd >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`;
    if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k`;
    return `$${Math.round(usd).toLocaleString()}`;
  };

  // Compute baseline spend
  const targetItems = items.filter(it => {
    if (targetScope === 'classA' && it.classValue !== 'A') return false;
    if (targetScope === 'apiOnly' && it.type !== 'API') return false;
    if (targetScope === 'singleOnly') {
      const isSingle = it.sourceType?.toLowerCase().includes('single') || it.activeMfgCount === 1;
      if (!isSingle) return false;
    }
    return true;
  });

  const targetSpendUSD = targetItems.reduce((acc, it) => acc + (it.annualBuyingValueUSD || 0), 0);

  // Compute Simulated Savings
  let simulatedSavingsUSD = 0;
  const simulatedBreakdown: { item: MaterialItem; currentSpend: number; projectedSpend: number; savings: number; method: string }[] = [];

  targetItems.forEach(it => {
    const currentSpend = it.annualBuyingValueUSD || 0;
    let savings = 0;
    let method = `Negotiation (-${renegotiationPct}%)`;

    if (useMarketBenchmark && it.parsedCdBelow && it.parsedCdBelow.length > 0) {
      const lowestCd = Math.min(...it.parsedCdBelow.map(c => c.pricePerUnit));
      if (lowestCd < it.netPriceUSD) {
        savings = (it.netPriceUSD - lowestCd) * it.annualBuyingQty;
        method = `Market CD Parity ($${lowestCd.toFixed(2)})`;
      } else {
        savings = currentSpend * (renegotiationPct / 100);
      }
    } else {
      savings = currentSpend * (renegotiationPct / 100);
    }

    if (savings > 0) {
      simulatedSavingsUSD += savings;
      simulatedBreakdown.push({
        item: it,
        currentSpend,
        projectedSpend: Math.max(0, currentSpend - savings),
        savings,
        method
      });
    }
  });

  simulatedBreakdown.sort((a, b) => b.savings - a.savings);

  return (
    <div className="space-y-6">
      {/* Simulation Controls Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Strategic Sourcing & Cost Optimization Simulator</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Model portfolio cost reductions, volume reallocation, and market customs parity scenarios
            </p>
          </div>

          {/* Projected Bottom-line Outcome Card */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
            <TrendingDown className="w-7 h-7 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide block">
                Simulated Annual SCM Savings
              </span>
              <span className="text-2xl font-bold font-mono text-indigo-950">
                {formatMoney(simulatedSavingsUSD)}
              </span>
              <span className="text-[11px] text-indigo-700 block font-mono">
                {targetSpendUSD > 0 ? `${((simulatedSavingsUSD / targetSpendUSD) * 100).toFixed(1)}% reduction on selected basket` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Sliders and Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-5 border-t border-slate-100">
          {/* Scope Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Target Material Basket
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setTargetScope('classA')}
                className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                  targetScope === 'classA' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Class A High Value
              </button>
              <button
                onClick={() => setTargetScope('apiOnly')}
                className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                  targetScope === 'apiOnly' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                APIs Only
              </button>
              <button
                onClick={() => setTargetScope('singleOnly')}
                className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                  targetScope === 'singleOnly' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Single Source Only
              </button>
              <button
                onClick={() => setTargetScope('all')}
                className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                  targetScope === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Entire Portfolio
              </button>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Active in basket: {targetItems.length} materials ({formatMoney(targetSpendUSD)} base spend)
            </span>
          </div>

          {/* Discount Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">Target Supplier Discount</label>
              <span className="text-sm font-bold font-mono text-indigo-600">{renegotiationPct}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={35}
              step={1}
              value={renegotiationPct}
              onChange={e => setRenegotiationPct(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>5% (Conservative)</span>
              <span>20% (Target 30% gap)</span>
              <span>35% (Aggressive)</span>
            </div>
          </div>

          {/* Toggle Market Benchmark */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Customs Intel Integration
            </label>
            <div 
              onClick={() => setUseMarketBenchmark(!useMarketBenchmark)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                useMarketBenchmark ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Apply CD Competitor Parity</span>
                <input
                  type="checkbox"
                  checked={useMarketBenchmark}
                  onChange={() => {}} // handled by parent div
                  className="rounded text-emerald-600 accent-emerald-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Prioritizes actual lower prices paid by local competitors (GSK, Abbott, Searle) where available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Table of Top Impact Items */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Projected Savings by Material</h3>
            <span className="text-xs text-slate-500">Ranked by dollar savings potential</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-3">Active Supplier</th>
                <th className="py-3 px-3 text-right">Current Spend</th>
                <th className="py-3 px-3 text-right">Projected Spend</th>
                <th className="py-3 px-3 text-right">Annual Savings</th>
                <th className="py-3 px-4">Optimization Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {simulatedBreakdown.slice(0, 15).map(({ item, currentSpend, projectedSpend, savings, method }) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectMaterial(item)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-600 line-clamp-1">
                      {item.materialName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {item.materialCode} · {item.type}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-slate-800 font-medium truncate max-w-[170px] block">
                      {item.lastSupplier || item.activeMfg || 'Direct'}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {item.activeMfgOrigin || 'Global'}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                    {formatMoney(currentSpend)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {formatMoney(projectedSpend)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                    +{formatMoney(savings)}
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {method}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
