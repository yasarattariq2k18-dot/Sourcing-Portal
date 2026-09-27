import React, { useState } from 'react';
import { MaterialItem } from '../types/procurement';
import { 
  TrendingDown, 
  Building2, 
  Search, 
  ArrowDownRight, 
  DollarSign, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface MarketIntelProps {
  items: MaterialItem[];
  currency: 'USD' | 'PKR';
  onSelectMaterial: (item: MaterialItem) => void;
}

export const MarketIntel: React.FC<MarketIntelProps> = ({
  items,
  currency,
  onSelectMaterial
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minDiscountPct, setMinDiscountPct] = useState<number>(0);

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

  // Find all items that have parsed CD below prices
  const itemsWithLowerPrices = items
    .filter(it => it.parsedCdBelow && it.parsedCdBelow.length > 0 && it.netPriceUSD > 0)
    .map(it => {
      const minPrice = Math.min(...it.parsedCdBelow.map(c => c.pricePerUnit));
      const maxDiscountPct = ((it.netPriceUSD - minPrice) / it.netPriceUSD) * 100;
      const annualizedSavingsUSD = (it.netPriceUSD - minPrice) * it.annualBuyingQty;
      return {
        item: it,
        minPrice,
        maxDiscountPct,
        annualizedSavingsUSD
      };
    })
    .filter(d => d.maxDiscountPct > minDiscountPct)
    .sort((a, b) => b.annualizedSavingsUSD - a.annualizedSavingsUSD);

  const totalArbitrageSavingsUSD = itemsWithLowerPrices.reduce((acc, d) => acc + (d.annualizedSavingsUSD > 0 ? d.annualizedSavingsUSD : 0), 0);

  const filteredDeals = itemsWithLowerPrices.filter(d => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.item.materialName.toLowerCase().includes(q) ||
      d.item.materialCode.toLowerCase().includes(q) ||
      d.item.parsedCdBelow.some(c => c.customer.toLowerCase().includes(q) || c.supplier.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Market Customs Data (CD) Price Intelligence</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direct market pricing transparency comparing our contracted rates against competitor pharmaceutical import declarations
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
            <TrendingDown className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[11px] font-medium text-emerald-800 block">Identified Arbitrage Potential</span>
              <span className="text-xl font-bold font-mono text-emerald-950">
                {formatMoney(totalArbitrageSavingsUSD)}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search material or competitor (e.g. Haleon, GSK, Searle)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Minimum Discount Threshold:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {[0, 10, 20, 30].map(val => (
                <button
                  key={val}
                  onClick={() => setMinDiscountPct(val)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    minDiscountPct === val
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {val === 0 ? 'All Gaps' : `>${val}%`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Materials with Market Arbitrage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDeals.map(({ item, minPrice, maxDiscountPct, annualizedSavingsUSD }) => (
          <div
            key={item.id}
            onClick={() => onSelectMaterial(item)}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Header Info */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">{item.materialCode}</span>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-1 mt-0.5">
                    {item.materialName}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    <span>{item.type}</span> · <span>{item.category}</span> · <span>Current Supplier: {item.lastSupplier || 'Direct'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    -{maxDiscountPct.toFixed(0)}%
                  </span>
                  {annualizedSavingsUSD > 0 && (
                    <span className="text-[11px] font-bold font-mono text-emerald-600 block mt-1">
                      Save {formatMoney(annualizedSavingsUSD)}/yr
                    </span>
                  )}
                </div>
              </div>

              {/* Price Comparison Box */}
              <div className="grid grid-cols-2 gap-3 mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-sans font-bold block">Our Net Price</span>
                  <span className="text-base font-bold text-slate-900">
                    ${item.netPriceUSD.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Annual Qty: {item.annualBuyingQty.toLocaleString()} {item.uom}
                  </span>
                </div>
                <div className="border-l border-slate-200 pl-3">
                  <span className="text-emerald-700 text-[10px] uppercase font-sans font-bold block">Market Benchmark Price</span>
                  <span className="text-base font-bold text-emerald-700">
                    ${minPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-600 block font-sans">
                    Arbitrage: ${(item.netPriceUSD - minPrice).toFixed(2)}/{item.uom}
                  </span>
                </div>
              </div>

              {/* Competitors Buying at Lower Price */}
              <div className="mt-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Market Import Records (Customs Declarations)
                </span>
                <div className="space-y-1.5">
                  {item.parsedCdBelow.slice(0, 3).map((deal, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded border border-slate-100 text-xs flex items-center justify-between bg-white"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-800 text-[11px] truncate">
                          {deal.customer}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          via {deal.supplier} ({deal.country}) · {deal.date}
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <div className="font-bold text-emerald-700 text-xs">
                          ${deal.pricePerUnit.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {deal.lastQty}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-medium">
              <span>View Full Market Feed & Negotiations</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
