import React from 'react';
import { ViewTab } from '../types/procurement';
import { ShieldAlert, TrendingDown, DollarSign, Database, Sliders, RefreshCw, Upload, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  currency: 'USD' | 'PKR';
  setCurrency: (c: 'USD' | 'PKR') => void;
  totalItems: number;
  onResetData: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  totalItems,
  onResetData,
  onFileUpload
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              PP
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                ProcurePulse
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">
                Supply Chain & Sourcing Intelligence
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'overview'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Executive Command
            </button>
            <button
              onClick={() => setActiveTab('risk-matrix')}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'risk-matrix'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Sourcing & Risk Matrix
            </button>
            <button
              onClick={() => setActiveTab('avl-pipeline')}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'avl-pipeline'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              AVL & Dev Pipeline
            </button>
            <button
              onClick={() => setActiveTab('market-intel')}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'market-intel'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Market Price Intel
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'explorer'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Material Catalog
            </button>
            <button
              onClick={() => setActiveTab('cost-simulator')}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'cost-simulator'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Savings Simulator
            </button>
          </nav>

          {/* Zone 3: Actions & Quick Controls */}
          <div className="flex items-center gap-3">
            {/* Currency toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  currency === 'USD'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('PKR')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  currency === 'PKR'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                PKR (Rs)
              </button>
            </div>

            {/* Hidden CSV input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={onFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload custom SCM/AVL CSV dataset"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>

            <button
              onClick={onResetData}
              title="Reset to default enterprise dataset"
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Sub Navigation bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-100 text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('risk-matrix')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'risk-matrix' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Risk Matrix
          </button>
          <button
            onClick={() => setActiveTab('avl-pipeline')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'avl-pipeline' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 bg-slate-100'
            }`}
          >
            AVL Pipeline
          </button>
          <button
            onClick={() => setActiveTab('market-intel')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'market-intel' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Market Intel
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'explorer' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Catalog ({totalItems})
          </button>
          <button
            onClick={() => setActiveTab('cost-simulator')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'cost-simulator' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Simulator
          </button>
        </div>
      </div>
    </header>
  );
};
