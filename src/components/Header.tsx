import React from 'react';
import { ViewTab } from '../types/procurement';
import { 
  ShieldAlert, 
  TrendingDown, 
  DollarSign, 
  Database, 
  Sliders, 
  RefreshCw, 
  Upload, 
  FileText,
  Lock,
  Sparkles,
  MessageSquare,
  BarChart2
} from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              ATCO
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                ATCO Sourcing AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">
                Director Analytics & Supplier Portal
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('director-analytics')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'director-analytics'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Director Analytics
            </button>
            <button
              onClick={() => setActiveTab('slicers-reports')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'slicers-reports'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Role Slicers & Reports
            </button>
            <button
              onClick={() => setActiveTab('inquiry-portal')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                activeTab === 'inquiry-portal'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>Inquiry & Vendor Portal</span>
            </button>
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                activeTab === 'ai-assistant'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>AI Intelligence</span>
            </button>
            <button
              onClick={() => setActiveTab('collaborative-hub')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'collaborative-hub'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Collaboration & Media
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Catalog ({totalItems})
            </button>
            <button
              onClick={() => setActiveTab('cost-simulator')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'cost-simulator'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Simulator
            </button>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2.5">
            {/* Currency toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                  currency === 'USD'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('PKR')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
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
              title="Upload custom ATCO dataset"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Upload</span>
            </button>

            <button
              onClick={onResetData}
              title="Reset to default dataset"
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-100 text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab('director-analytics')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'director-analytics' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Director Analytics
          </button>
          <button
            onClick={() => setActiveTab('slicers-reports')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'slicers-reports' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Slicers & Reports
          </button>
          <button
            onClick={() => setActiveTab('inquiry-portal')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'inquiry-portal' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Inquiry & Vendor Portal
          </button>
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'ai-assistant' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('collaborative-hub')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'collaborative-hub' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Collaboration & Videos
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'catalog' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveTab('cost-simulator')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'cost-simulator' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Cost Simulator
          </button>
        </div>
      </div>
    </header>
  );
};
