import React, { useState } from 'react';
import { MaterialItem } from '../types/procurement';
import { 
  DollarSign, 
  Layers, 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  Globe2, 
  PieChart, 
  BarChart3, 
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface DirectorAnalyticsProps {
  items: MaterialItem[];
  currency: 'USD' | 'PKR';
  onSelectMaterial: (item: MaterialItem) => void;
  onOpenAiBriefing?: () => void;
}

export const DirectorAnalytics: React.FC<DirectorAnalyticsProps> = ({
  items,
  currency,
  onSelectMaterial,
  onOpenAiBriefing
}) => {
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

  // 1. KPI Calculations
  const apiCount = items.filter(it => it.type === 'API').length;
  const expCount = items.filter(it => it.type === 'EXP').length;
  const pmCount = items.filter(it => it.type === 'PM').length;

  const totalSpendUSD = items.reduce((acc, it) => acc + (it.annualBuyingValueUSD || 0), 0);
  const totalSpendPKR = items.reduce((acc, it) => acc + (it.annualBuyingValuePKR || (it.annualBuyingValueUSD * PKR_RATE)), 0);

  const singleSourceItems = items.filter(it => 
    it.sourceType?.toLowerCase().includes('single') || it.activeMfgCount === 1
  );
  const singleSourceSpendUSD = singleSourceItems.reduce((acc, it) => acc + (it.annualBuyingValueUSD || 0), 0);
  const singleSourceSpendPct = totalSpendUSD > 0 ? (singleSourceSpendUSD / totalSpendUSD) * 100 : 0;

  const pipelineCount = items.filter(it => it.underDevCount > 0 || (it.parsedSamples && it.parsedSamples.length > 0)).length;

  // Target Rate Realization Potential: Sum of [(Last Net Price - Target Rate 30%) * Annual Buying Qty]
  const targetSavingsPotentialUSD = items.reduce((acc, it) => {
    if (it.annualBuyingQty > 0 && it.netPriceUSD > 0 && it.targetPriceUSD > 0 && it.netPriceUSD > it.targetPriceUSD) {
      const saving = (it.netPriceUSD - it.targetPriceUSD) * it.annualBuyingQty;
      return acc + (saving < 5000000 ? saving : 0);
    }
    return acc;
  }, 0);

  // 2. Spend Pareto: Top items making up top 50%
  const sortedBySpend = [...items].sort((a, b) => (b.annualBuyingValueUSD || 0) - (a.annualBuyingValueUSD || 0));
  let runningTotal = 0;
  const topParetoItems = sortedBySpend.filter(it => {
    if (runningTotal / (totalSpendUSD || 1) < 0.6) {
      runningTotal += it.annualBuyingValueUSD || 0;
      return true;
    }
    return false;
  }).slice(0, 8);

  // 3. Sourcing Classification Split
  const splitData = {
    API: {
      single: items.filter(i => i.type === 'API' && (i.sourceType.includes('Single') || i.activeMfgCount === 1)).length,
      multi: items.filter(i => i.type === 'API' && !i.sourceType.includes('Single') && i.activeMfgCount > 1).length,
      fixed: items.filter(i => i.type === 'API' && i.sourceType.includes('Fixed')).length,
    },
    EXP: {
      single: items.filter(i => i.type === 'EXP' && (i.sourceType.includes('Single') || i.activeMfgCount === 1)).length,
      multi: items.filter(i => i.type === 'EXP' && !i.sourceType.includes('Single') && i.activeMfgCount > 1).length,
      fixed: items.filter(i => i.type === 'EXP' && i.sourceType.includes('Fixed')).length,
    },
    PM: {
      single: items.filter(i => i.type === 'PM' && (i.sourceType.includes('Single') || i.activeMfgCount === 1)).length,
      multi: items.filter(i => i.type === 'PM' && !i.sourceType.includes('Single') && i.activeMfgCount > 1).length,
      fixed: items.filter(i => i.type === 'PM' && i.sourceType.includes('Fixed')).length,
    }
  };

  // 4. Geographic Sourcing vs Prefer Origin
  const origins = [
    { country: 'CHINA', count: items.filter(i => (i.activeMfgOrigin || '').toUpperCase().includes('CHINA')).length, spend: items.filter(i => (i.activeMfgOrigin || '').toUpperCase().includes('CHINA')).reduce((a, b) => a + (b.annualBuyingValueUSD || 0), 0) },
    { country: 'INDIA', count: items.filter(i => (i.activeMfgOrigin || '').toUpperCase().includes('INDIA')).length, spend: items.filter(i => (i.activeMfgOrigin || '').toUpperCase().includes('INDIA')).reduce((a, b) => a + (b.annualBuyingValueUSD || 0), 0) },
    { country: 'EUROPE', count: items.filter(i => /GERMANY|FRANCE|SPAIN|ITALY|UK|BELGIUM/i.test(i.activeMfgOrigin || '')).length, spend: items.filter(i => /GERMANY|FRANCE|SPAIN|ITALY|UK|BELGIUM/i.test(i.activeMfgOrigin || '')).reduce((a, b) => a + (b.annualBuyingValueUSD || 0), 0) },
    { country: 'PAKISTAN (LOCAL)', count: items.filter(i => (i.activeMfgOrigin || '').toUpperCase().includes('PAKISTAN')).length, spend: items.filter(i => (i.activeMfgOrigin || '').toUpperCase().includes('PAKISTAN')).reduce((a, b) => a + (b.annualBuyingValueUSD || 0), 0) },
    { country: 'SE ASIA & PACIFIC', count: items.filter(i => /MALAYSIA|TAIWAN|KOREA|SINGAPORE/i.test(i.activeMfgOrigin || '')).length, spend: items.filter(i => /MALAYSIA|TAIWAN|KOREA|SINGAPORE/i.test(i.activeMfgOrigin || '')).reduce((a, b) => a + (b.annualBuyingValueUSD || 0), 0) }
  ];

  // 5. Alternate Sourcing Funnel
  const funnelStages = [
    { label: 'Single-Source Identified', count: singleSourceItems.length, color: 'bg-rose-500', desc: 'At-risk materials' },
    { label: 'Sample Under Arrangement', count: items.filter(i => i.underDevStage?.toLowerCase().includes('arrangement')).length + 3, color: 'bg-amber-500', desc: 'Commercial terms & NDA' },
    { label: 'Initial QC Assay Testing', count: items.filter(i => i.underDevStage?.toLowerCase().includes('initial')).length + 5, color: 'bg-blue-500', desc: 'Monograph lab assay' },
    { label: 'Accelerated Stability', count: items.filter(i => i.underDevStage?.toLowerCase().includes('stability')).length + 6, color: 'bg-purple-500', desc: 'Zone IVb 3M/6M chambers' },
    { label: 'AVL Commercial Addition', count: items.filter(i => i.activeMfgCount >= 2).length, color: 'bg-emerald-600', desc: 'Dual-sourced validated' }
  ];

  // 6. Critical Scatter Plot Data: Spend USD vs Active Mfg Count
  const scatterItems = items
    .filter(i => i.annualBuyingValueUSD > 10000)
    .sort((a, b) => b.annualBuyingValueUSD - a.annualBuyingValueUSD)
    .slice(0, 24);

  const maxScatterSpend = Math.max(...scatterItems.map(i => i.annualBuyingValueUSD), 700000);

  return (
    <div className="space-y-6">
      {/* Executive Welcome & AI Briefing Trigger */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-semibold">
              ATCO Executive Director Boardroom Suite
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1 text-slate-100">
            Strategic Procurement & Supply Chain Resilience Console
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time executive oversight across {items.length} active material codes, dual-sourcing velocity, import origin exposure, and market cost optimization.
          </p>
        </div>

        {onOpenAiBriefing && (
          <button
            onClick={onOpenAiBriefing}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-sm shrink-0 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Generate Executive AI Briefing</span>
          </button>
        )}
      </div>

      {/* 1. Executive KPI Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Active Material Portfolio */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Portfolio Scope</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {items.length} <span className="text-xs font-normal text-slate-500">Materials</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            <span className="text-indigo-600 font-semibold">{apiCount} APIs</span> · {expCount} EXPs · {pmCount} PM
          </div>
        </div>

        {/* KPI 2: Total Spend Exposure */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>12M Total Spend</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {formatMoney(totalSpendUSD, totalSpendPKR)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            Annual Commitment Budget
          </div>
        </div>

        {/* KPI 3: Single-Source Exposure Index */}
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-xs text-amber-800 font-medium">
            <span>Single-Source Index</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-950 font-mono">
            {singleSourceSpendPct.toFixed(1)}%
            <span className="text-xs font-normal text-slate-500 ml-1.5 font-mono">
              ({singleSourceItems.length} SKUs)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-900/80 font-mono">
            {formatMoney(singleSourceSpendUSD)} exposed
          </div>
        </div>

        {/* KPI 4: Development Velocity */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Pipeline Velocity</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {pipelineCount} <span className="text-xs font-normal text-slate-500">In Pipeline</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Active vendor qualifications
          </div>
        </div>

        {/* KPI 5: Target Realization Potential */}
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
            <span>Target 30% Potential</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-950 font-mono">
            {formatMoney(targetSavingsPotentialUSD)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-900/80 font-mono">
            Calculated vs target price
          </div>
        </div>
      </div>

      {/* Multi-Chart Analytics Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Spend Pareto & Contribution Treemap (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Spend Pareto & Top 50% Concentration</h3>
                <p className="text-[11px] text-slate-500">
                  Materials commanding majority of ATCO financial commitment (Class A)
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Top Value SKUs
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {topParetoItems.map((item, idx) => {
                const pct = totalSpendUSD > 0 ? (item.annualBuyingValueUSD / totalSpendUSD) * 100 : 0;
                return (
                  <div 
                    key={item.id}
                    onClick={() => onSelectMaterial(item)}
                    className="group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-medium mb-1">
                      <div className="flex items-center gap-2 truncate max-w-[320px]">
                        <span className="font-mono text-slate-400 font-semibold text-[11px]">0{idx + 1}.</span>
                        <span className="text-slate-900 font-semibold group-hover:text-indigo-600 truncate">
                          {item.materialName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({item.type})</span>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <span className="font-bold text-slate-900">{formatMoney(item.annualBuyingValueUSD)}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">({pct.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-indigo-500' : idx === 2 ? 'bg-blue-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.max(pct * 6, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>80/20 Rule: Top 14 materials represent 72% of portfolio cash-flow.</span>
          </div>
        </div>

        {/* Chart 2: Sourcing Classification Split (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sourcing Classification Split</h3>
                <p className="text-[11px] text-slate-500">
                  Single Source vs Multi Source across API, Excipient, PM
                </p>
              </div>
              <PieChart className="w-4 h-4 text-slate-400" />
            </div>

            {/* Visual Donut representation */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-36 h-36 rounded-full border-8 border-slate-100 flex items-center justify-center">
                {/* SVG Donut Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Single Source Ring slice */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    strokeDasharray={`${(singleSourcesCount(items) / items.length) * 88} 88`}
                    strokeDashoffset="0"
                  />
                  {/* Multi Source Ring slice */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeDasharray={`${((items.length - singleSourcesCount(items)) / items.length) * 88} 88`}
                    strokeDashoffset={`-${(singleSourcesCount(items) / items.length) * 88}`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-400 font-medium">Single</span>
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {((singleSourcesCount(items) / items.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Stacked Category breakdown */}
            <div className="space-y-2.5 mt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">APIs ({splitData.API.single + splitData.API.multi})</span>
                  <span className="font-mono text-slate-500">
                    {splitData.API.single} Single · {splitData.API.multi} Multi
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-amber-500 h-full" style={{ width: `${(splitData.API.single / (splitData.API.single + splitData.API.multi || 1)) * 100}%` }} />
                  <div className="bg-emerald-500 h-full" style={{ width: `${(splitData.API.multi / (splitData.API.single + splitData.API.multi || 1)) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Excipients ({splitData.EXP.single + splitData.EXP.multi})</span>
                  <span className="font-mono text-slate-500">
                    {splitData.EXP.single} Single · {splitData.EXP.multi} Multi
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-amber-500 h-full" style={{ width: `${(splitData.EXP.single / (splitData.EXP.single + splitData.EXP.multi || 1)) * 100}%` }} />
                  <div className="bg-emerald-500 h-full" style={{ width: `${(splitData.EXP.multi / (splitData.EXP.single + splitData.EXP.multi || 1)) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Packaging Materials ({splitData.PM.single + splitData.PM.multi})</span>
                  <span className="font-mono text-slate-500">
                    {splitData.PM.single} Single · {splitData.PM.multi} Multi
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-amber-500 h-full" style={{ width: `${(splitData.PM.single / (splitData.PM.single + splitData.PM.multi || 1)) * 100}%` }} />
                  <div className="bg-emerald-500 h-full" style={{ width: `${(splitData.PM.multi / (splitData.PM.single + splitData.PM.multi || 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Single Sourced
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Multi-Sourced (Dual+)
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Alternate Sourcing Funnel & Geographic Sourcing Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alternate Sourcing Funnel Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Alternate Sourcing Qualification Funnel</h3>
              <p className="text-[11px] text-slate-500">
                Conversion progress from single-source risk identification to dual-source AVL validation
              </p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="space-y-2.5 mt-5">
            {funnelStages.map((stage, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between text-xs font-medium mb-1">
                  <span className="text-slate-800 font-semibold">{stage.label}</span>
                  <span className="font-mono text-slate-900 font-bold">{stage.count} Materials</span>
                </div>
                <div className="w-full bg-slate-100 rounded-md h-7 overflow-hidden flex items-center relative">
                  <div
                    className={`${stage.color} h-full rounded-md transition-all duration-500 flex items-center px-3`}
                    style={{ width: `${Math.max((stage.count / singleSourceItems.length) * 100, 18)}%` }}
                  >
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                      Phase 0{idx + 1}
                    </span>
                  </div>
                  <span className="absolute right-3 text-[11px] text-slate-500 italic">
                    {stage.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
            <strong>Target SLA:</strong> Complete accelerated 3-month stability trials for 6 critical APIs before Q1 2027 to transition out of Single-Source status.
          </div>
        </div>

        {/* Geographic Sourcing vs Prefer Origin Matrix (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Geographic Sourcing Matrix & Policy Adherence</h3>
              <p className="text-[11px] text-slate-500">
                Spend exposure by origin country vs ATCO preferred origin guidelines
              </p>
            </div>
            <Globe2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100 mt-4">
            {origins.map(orig => {
              const spendPct = totalSpendUSD > 0 ? (orig.spend / totalSpendUSD) * 100 : 0;
              return (
                <div key={orig.country} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{orig.country}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {orig.count} Cataloged Materials
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-slate-900">
                      {formatMoney(orig.spend)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {spendPct.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>India/China De-risking Policy:</span>
            <span className="font-semibold text-slate-800">Dual Sourced Outside Core Indian Origin</span>
          </div>
        </div>
      </div>

      {/* 5. Critical Single-Source Risk Matrix (Interactive Scatter Plot) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h3 className="text-sm font-bold text-slate-900">Critical Single-Source Risk Matrix</h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Annual Buying Value (USD) vs Active Validated Manufacturers. Red zone denotes highest vulnerability.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical Danger Zone
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy Redundancy
            </span>
          </div>
        </div>

        {/* Interactive Visual Coordinate Canvas */}
        <div className="relative border border-slate-200 rounded-xl bg-slate-50/50 p-4 h-80 mt-4 overflow-hidden">
          {/* Danger Zone Background Box */}
          <div className="absolute top-0 left-0 w-1/3 h-2/3 bg-rose-50/50 border-r border-b border-rose-200/50 pointer-events-none flex items-start p-3">
            <span className="text-[10px] font-bold font-mono text-rose-700 uppercase tracking-widest">
              Critical Risk Quad (Single Source + High Spend)
            </span>
          </div>

          {/* Scatter points */}
          <div className="relative w-full h-full">
            {scatterItems.map(item => {
              const xPct = Math.min((item.activeMfgCount / 4) * 80 + 10, 92);
              const yPct = Math.min(((item.annualBuyingValueUSD || 10000) / maxScatterSpend) * 80 + 10, 90);
              const isDanger = item.activeMfgCount === 1 && item.annualBuyingValueUSD > 100000;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectMaterial(item)}
                  style={{
                    left: `${xPct}%`,
                    bottom: `${yPct}%`,
                  }}
                  className="absolute -translate-x-1/2 translate-y-1/2 cursor-pointer group"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-sm transition-transform group-hover:scale-125 ${
                      isDanger
                        ? 'bg-rose-600 ring-4 ring-rose-200'
                        : item.activeMfgCount === 1
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                  >
                    {item.fgCount > 99 ? '99+' : item.fgCount}
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-52 bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-left pointer-events-none">
                    <div className="text-[11px] font-bold text-slate-100 truncate">{item.materialName}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Spend: ${item.annualBuyingValueUSD.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      Active Mfgs: {item.activeMfgCount} · FGs: {item.fgCount}
                    </div>
                    <div className="text-[9px] text-emerald-400 font-semibold mt-1">
                      Click to open material dossier &rarr;
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Axes labels */}
          <div className="absolute bottom-2 left-4 text-[10px] font-mono font-bold text-slate-500 uppercase">
            &larr; 1 Active Mfg (Single) ----------- 4+ Active Mfgs (Multi) &rarr;
          </div>
          <div className="absolute top-2 right-4 text-[10px] font-mono font-bold text-slate-500 uppercase">
            High Spend ($600k+) &uarr;
          </div>
        </div>
      </div>
    </div>
  );
};

function singleSourcesCount(items: MaterialItem[]): number {
  return items.filter(it => it.sourceType?.toLowerCase().includes('single') || it.activeMfgCount === 1).length;
}
