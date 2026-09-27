import React from 'react';
import { MaterialItem } from '../types/procurement';
import { 
  AlertTriangle, 
  TrendingDown, 
  DollarSign, 
  Globe2, 
  ShieldCheck, 
  Layers, 
  ArrowUpRight, 
  Scale, 
  Factory,
  ChevronRight
} from 'lucide-react';

interface ExecutiveSummaryProps {
  items: MaterialItem[];
  currency: 'USD' | 'PKR';
  onSelectMaterial: (item: MaterialItem) => void;
  onNavigateTab: (tab: any) => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  items,
  currency,
  onSelectMaterial,
  onNavigateTab
}) => {
  // USD to PKR conversion rate anchor (~278)
  const PKR_RATE = 278.5;

  const formatMoney = (amountUSD: number, amountPKR?: number) => {
    if (currency === 'PKR') {
      const pkr = amountPKR || amountUSD * PKR_RATE;
      if (pkr >= 10000000) return `Rs ${(pkr / 10000000).toFixed(2)} Cr`;
      if (pkr >= 100000) return `Rs ${(pkr / 100000).toFixed(2)} Lakh`;
      return `Rs ${Math.round(pkr).toLocaleString()}`;
    }
    if (amountUSD >= 1000000) return `$${(amountUSD / 1000000).toFixed(2)}M`;
    if (amountUSD >= 1000) return `$${(amountUSD / 1000).toFixed(1)}k`;
    return `$${Math.round(amountUSD).toLocaleString()}`;
  };

  // Metrics
  const totalSpendUSD = items.reduce((acc, it) => acc + (it.annualBuyingValueUSD || 0), 0);
  const totalSpendPKR = items.reduce((acc, it) => acc + (it.annualBuyingValuePKR || (it.annualBuyingValueUSD * PKR_RATE)), 0);

  const singleSourceItems = items.filter(it => 
    it.sourceType?.toLowerCase().includes('single') || 
    it.sourceClassification?.toLowerCase().includes('single') ||
    it.activeMfgCount === 1
  );
  const singleSourceSpendUSD = singleSourceItems.reduce((acc, it) => acc + (it.annualBuyingValueUSD || 0), 0);
  const singleSourcePercentage = totalSpendUSD > 0 ? (singleSourceSpendUSD / totalSpendUSD) * 100 : 0;

  const multiSourceItems = items.filter(it => !singleSourceItems.includes(it));
  const multiSourceSpendUSD = multiSourceItems.reduce((acc, it) => acc + (it.annualBuyingValueUSD || 0), 0);

  // Market Arbitrage Opportunity: compare netPriceUSD with lowest CD supplier below
  let totalSavingsOpportunityUSD = 0;
  items.forEach(it => {
    if (it.parsedCdBelow && it.parsedCdBelow.length > 0 && it.annualBuyingQty > 0) {
      const lowestCdPrice = Math.min(...it.parsedCdBelow.map(c => c.pricePerUnit));
      if (lowestCdPrice < it.netPriceUSD) {
        const diff = (it.netPriceUSD - lowestCdPrice) * it.annualBuyingQty;
        if (diff > 0 && diff < 10000000) {
          totalSavingsOpportunityUSD += diff;
        }
      }
    }
  });

  // Country Origin Distribution
  const originMap: Record<string, { count: number; spendUSD: number }> = {};
  items.forEach(it => {
    let country = 'OTHER';
    const origin = (it.activeMfgOrigin || it.totalMfgOrigin || '').toUpperCase();
    if (origin.includes('CHINA')) country = 'CHINA';
    else if (origin.includes('INDIA')) country = 'INDIA';
    else if (origin.includes('PAKISTAN')) country = 'PAKISTAN (LOCAL)';
    else if (origin.includes('GERMANY') || origin.includes('FRANCE') || origin.includes('SPAIN') || origin.includes('ITALY') || origin.includes('UK') || origin.includes('BELGIUM')) country = 'EUROPE';
    else if (origin.includes('MALAYSIA') || origin.includes('TAIWAN') || origin.includes('KOREA') || origin.includes('SINGAPORE')) country = 'SE ASIA & PACIFIC';

    if (!originMap[country]) originMap[country] = { count: 0, spendUSD: 0 };
    originMap[country].count++;
    originMap[country].spendUSD += (it.annualBuyingValueUSD || 0);
  });

  const sortedOrigins = Object.entries(originMap).sort((a, b) => b[1].spendUSD - a[1].spendUSD);

  // High Finished Goods (FG) Exposure items with single sourcing (High Supply Chain Risk!)
  const criticalRiskItems = items
    .filter(it => (it.fgCount >= 10 || it.annualBuyingValueUSD > 100000) && singleSourceItems.includes(it))
    .sort((a, b) => (b.fgCount * (b.annualBuyingValueUSD || 1)) - (a.fgCount * (a.annualBuyingValueUSD || 1)))
    .slice(0, 6);

  // Top 5 spend items
  const topSpendItems = [...items].sort((a, b) => (b.annualBuyingValueUSD || 0) - (a.annualBuyingValueUSD || 0)).slice(0, 5);

  // Pipeline count
  const pipelineItemsCount = items.filter(it => it.underDevCount > 0 || (it.parsedSamples && it.parsedSamples.length > 0)).length;

  return (
    <div className="space-y-6">
      {/* Executive KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Annual Spend */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Annual SCM Portfolio Spend</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {formatMoney(totalSpendUSD, totalSpendPKR)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{items.length}</span> active materials cataloged
            <span aria-hidden="true">·</span>
            <span>12M PO run rate</span>
          </div>
        </div>

        {/* Card 2: Single Source Vulnerability */}
        <div className="bg-white border border-amber-200/80 rounded-xl p-5 shadow-xs bg-gradient-to-br from-white to-amber-50/20">
          <div className="flex items-center justify-between text-xs text-amber-800 font-medium">
            <span>Single Source Vulnerability</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-950 font-mono">
            {singleSourcePercentage.toFixed(1)}%
            <span className="text-sm font-normal text-slate-500 ml-2">
              ({formatMoney(singleSourceSpendUSD)})
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-900/80">
            <span>{singleSourceItems.length} SKUs depend on single manufacturer</span>
          </div>
        </div>

        {/* Card 3: Market Benchmark Arbitrage */}
        <div className="bg-white border border-emerald-200/80 rounded-xl p-5 shadow-xs bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
            <span>Cost Reduction Arbitrage</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-950 font-mono">
            {formatMoney(totalSavingsOpportunityUSD)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-900/80">
            <span>Identified vs Pakistan import customs data</span>
          </div>
        </div>

        {/* Card 4: Vendor Qualification Pipeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Development Pipeline</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {pipelineItemsCount} <span className="text-sm font-normal text-slate-500">Materials</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Stability testing & vendor audits underway</span>
          </div>
        </div>
      </div>

      {/* Sourcing Strategy & Geographic Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Geographic Origin Concentration (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Geopolitical Origin & Supply Concentration</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Spend exposure across primary supply corridors (China, India, Europe, Southeast Asia, Local)
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('risk-matrix')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5"
            >
              Deep Dive <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 mt-6">
            {sortedOrigins.map(([country, data]) => {
              const pct = totalSpendUSD > 0 ? (data.spendUSD / totalSpendUSD) * 100 : 0;
              return (
                <div key={country} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
                      {country}
                      <span className="text-slate-400 font-normal font-mono">({data.count} SKUs)</span>
                    </span>
                    <span className="text-slate-900 font-mono tabular-nums font-semibold">
                      {formatMoney(data.spendUSD)} <span className="text-slate-400 font-normal">({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        country === 'CHINA' 
                          ? 'bg-rose-500' 
                          : country === 'INDIA' 
                          ? 'bg-amber-500' 
                          : country.includes('EUROPE') 
                          ? 'bg-blue-600' 
                          : country.includes('LOCAL') 
                          ? 'bg-emerald-600'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">China & India Share</span>
              <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">
                {(((originMap['CHINA']?.spendUSD || 0) + (originMap['INDIA']?.spendUSD || 0)) / (totalSpendUSD || 1) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">European Excipients</span>
              <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">
                {((originMap['EUROPE']?.spendUSD || 0) / (totalSpendUSD || 1) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-slate-500 block">Local Packaging & Solvents</span>
              <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">
                {((originMap['PAKISTAN (LOCAL)']?.spendUSD || 0) / (totalSpendUSD || 1) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Top Spend Pareto Items (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Top Spend Drivers (Pareto)</h2>
              <span className="text-xs text-slate-500 font-mono">Class A</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Largest annual procurement value commitments commanding strategic priority
            </p>

            <div className="divide-y divide-slate-100">
              {topSpendItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => onSelectMaterial(item)}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400 font-mono">0{idx + 1}.</span>
                      <span className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600">
                        {item.materialName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span>{item.type}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className={item.sourceType?.includes('Single') ? 'text-amber-600 font-medium' : 'text-slate-600'}>
                        {item.sourceType}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 font-mono">
                      {formatMoney(item.annualBuyingValueUSD, item.annualBuyingValuePKR)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {item.percentageAnnualSpendUSD ? `${item.percentageAnnualSpendUSD.toFixed(1)}% spend` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Looking for full list?</span>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="font-medium text-indigo-600 hover:text-indigo-800"
            >
              Browse All Materials &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Critical Supply Chain Bottlenecks: High Finished Goods Impact & Single Sourced */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <h2 className="text-base font-semibold text-slate-900">Critical Single-Source Bottlenecks (High Finished Goods Impact)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Raw materials vital to 20+ pharmaceutical finished formulations that depend on a solitary validated manufacturer
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('avl-pipeline')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium self-start sm:self-center"
          >
            Review Qualification Actions &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {criticalRiskItems.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectMaterial(item)}
              className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-xs cursor-pointer transition-all bg-slate-50/30 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">{item.materialCode}</span>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-1 mt-0.5">
                    {item.materialName}
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono">
                  {item.fgCount} FGs
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sole Active Mfg:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[170px] text-right">
                    {item.activeMfg || item.lastManufacturer || 'Single Source'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Origin / Type:</span>
                  <span className="text-slate-700">{item.activeMfgOrigin || 'Global'} · {item.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Annual Spend:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatMoney(item.annualBuyingValueUSD, item.annualBuyingValuePKR)}
                  </span>
                </div>
              </div>

              {/* Status / Pipeline trigger */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  {item.underDevStage ? `Stage: ${item.underDevStage.split(',')[0]}` : 'No active backup'}
                </span>
                <span className="text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
                  Inspect <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
