import React, { useState, useMemo } from 'react';
import { MaterialItem } from '../types/procurement';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface MaterialExplorerProps {
  items: MaterialItem[];
  currency: 'USD' | 'PKR';
  onSelectMaterial: (item: MaterialItem) => void;
}

export const MaterialExplorer: React.FC<MaterialExplorerProps> = ({
  items,
  currency,
  onSelectMaterial
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'spend' | 'name' | 'price' | 'fg'>('spend');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (search) {
        const q = search.toLowerCase();
        const match = 
          item.materialName.toLowerCase().includes(q) ||
          item.materialCode.toLowerCase().includes(q) ||
          item.activeMfg?.toLowerCase().includes(q) ||
          item.lastSupplier?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
      if (sourceFilter !== 'ALL') {
        const isSingle = item.sourceType?.toLowerCase().includes('single') || item.activeMfgCount === 1;
        if (sourceFilter === 'SINGLE' && !isSingle) return false;
        if (sourceFilter === 'MULTI' && isSingle) return false;
      }
      if (classFilter !== 'ALL' && item.classValue !== classFilter) return false;
      return true;
    }).sort((a, b) => {
      let diff = 0;
      if (sortBy === 'spend') diff = (b.annualBuyingValueUSD || 0) - (a.annualBuyingValueUSD || 0);
      else if (sortBy === 'name') diff = a.materialName.localeCompare(b.materialName);
      else if (sortBy === 'price') diff = (b.netPriceUSD || 0) - (a.netPriceUSD || 0);
      else if (sortBy === 'fg') diff = (b.fgCount || 0) - (a.fgCount || 0);
      return sortOrder === 'desc' ? diff : -diff;
    });
  }, [items, search, typeFilter, sourceFilter, classFilter, sortBy, sortOrder]);

  const handleExportCSV = () => {
    const headers = ['Material Code', 'Material Name', 'Type', 'Category', 'Active Mfg', 'Origin', 'Source Type', 'FG Count', 'Annual Qty', 'UOM', 'Net Price USD', 'Annual Spend USD'];
    const rows = filteredItems.map(it => [
      `"${it.materialCode}"`,
      `"${it.materialName}"`,
      it.type,
      `"${it.category}"`,
      `"${it.activeMfg}"`,
      `"${it.activeMfgOrigin}"`,
      `"${it.sourceType}"`,
      it.fgCount,
      it.annualBuyingQty,
      it.uom,
      it.netPriceUSD,
      it.annualBuyingValueUSD
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Procurement_Sourcing_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Control Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Material & Supplier Master Catalog</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live database of {items.length} items with active AVL status, pricing structures, and competitor intelligence
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export View to CSV</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code, name, supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Type selector */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Types</option>
              <option value="API">API Only</option>
              <option value="EXP">Excipient (EXP)</option>
              <option value="PM">Packing (PM)</option>
            </select>

            {/* Sourcing selector */}
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Sourcing</option>
              <option value="SINGLE">Single Source Only</option>
              <option value="MULTI">Multi Source Only</option>
            </select>

            {/* Class selector */}
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Classes (A/B/C)</option>
              <option value="A">Class A (&gt;2M spend)</option>
              <option value="B">Class B (1M-2M)</option>
              <option value="C">Class C (&lt;1M)</option>
            </select>

            {/* Sort selector */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'desc' ? 'High-to-Low' : 'Low-to-High'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enterprise Data Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Material Details</th>
                <th className="py-3 px-3">Type / Cat</th>
                <th className="py-3 px-3">Active Manufacturers</th>
                <th className="py-3 px-3 text-center">FG Reliance</th>
                <th className="py-3 px-3">Sourcing Model</th>
                <th className="py-3 px-3 text-right">Net Price</th>
                <th className="py-3 px-3 text-right">Annual Volume</th>
                <th className="py-3 px-4 text-right">Annual Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => {
                const isSingle = item.sourceType?.toLowerCase().includes('single') || item.activeMfgCount === 1;

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectMaterial(item)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 line-clamp-1">
                        {item.materialName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{item.materialCode}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.sourceOrigin}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800">{item.type}</span>
                      <span className="text-slate-400 block text-[10px] truncate max-w-[100px]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-800 font-medium truncate max-w-[180px] block">
                        {item.activeMfg || '-'}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {item.activeMfgOrigin || 'Global'} ({item.activeMfgCount} Active)
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono tabular-nums font-bold">
                      <span className={item.fgCount >= 20 ? 'text-rose-600' : 'text-slate-700'}>
                        {item.fgCount}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-[11px] font-medium ${isSingle ? 'text-amber-800' : 'text-emerald-800'}`}>
                        {item.sourceType}
                      </span>
                      {item.underDevCount > 0 && (
                        <span className="text-indigo-600 text-[10px] block font-mono">
                          +{item.underDevCount} in pipeline
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-slate-800">
                      ${item.netPriceUSD.toFixed(2)}
                      <span className="text-[10px] text-slate-400 block font-sans">
                        /{item.uom || 'KG'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {item.annualBuyingQty ? item.annualBuyingQty.toLocaleString() : '-'}
                      <span className="text-[10px] text-slate-400 ml-1 font-sans">{item.uom}</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      {formatMoney(item.annualBuyingValueUSD, item.annualBuyingValuePKR)}
                      {item.percentageAnnualSpendUSD > 0 && (
                        <span className="text-[10px] text-slate-400 font-normal block font-sans">
                          {item.percentageAnnualSpendUSD.toFixed(1)}% spend
                        </span>
                      )}
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
