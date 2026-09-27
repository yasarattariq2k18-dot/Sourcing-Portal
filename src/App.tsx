import React, { useState } from 'react';
import { MaterialItem, ViewTab } from './types/procurement';
import { INITIAL_PROCUREMENT_DATA } from './data/procurementData';
import { parseCSV, mapRawRowToMaterialItem } from './utils/dataParser';
import { Header } from './components/Header';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { RiskMatrix } from './components/RiskMatrix';
import { AvlPipeline } from './components/AvlPipeline';
import { MarketIntel } from './components/MarketIntel';
import { MaterialExplorer } from './components/MaterialExplorer';
import { CostSimulator } from './components/CostSimulator';
import { MaterialModal } from './components/MaterialModal';

export default function App() {
  const [items, setItems] = useState<MaterialItem[]>(INITIAL_PROCUREMENT_DATA);
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [currency, setCurrency] = useState<'USD' | 'PKR'>('USD');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResetData = () => {
    setItems(INITIAL_PROCUREMENT_DATA);
    showToast('Reset to default enterprise sourcing dataset');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) return;

        const rows = parseCSV(text);
        if (rows.length < 2) {
          showToast('Invalid CSV file: Insufficient rows found');
          return;
        }

        const parsedItems: MaterialItem[] = [];
        // Skip header row
        for (let i = 1; i < rows.length; i++) {
          const item = mapRawRowToMaterialItem(rows[i], i);
          if (item) {
            parsedItems.push(item);
          }
        }

        if (parsedItems.length > 0) {
          setItems(parsedItems);
          showToast(`Successfully imported ${parsedItems.length} materials from ${file.name}`);
        } else {
          showToast('No valid material rows recognized from the uploaded CSV structure');
        }
      } catch (err) {
        showToast('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          {toastMessage}
        </div>
      )}

      {/* Primary Sticky Header conforming to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        totalItems={items.length}
        onResetData={handleResetData}
        onFileUpload={handleFileUpload}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <ExecutiveSummary
            items={items}
            currency={currency}
            onSelectMaterial={setSelectedMaterial}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'risk-matrix' && (
          <RiskMatrix
            items={items}
            currency={currency}
            onSelectMaterial={setSelectedMaterial}
          />
        )}

        {activeTab === 'avl-pipeline' && (
          <AvlPipeline
            items={items}
            currency={currency}
            onSelectMaterial={setSelectedMaterial}
          />
        )}

        {activeTab === 'market-intel' && (
          <MarketIntel
            items={items}
            currency={currency}
            onSelectMaterial={setSelectedMaterial}
          />
        )}

        {activeTab === 'explorer' && (
          <MaterialExplorer
            items={items}
            currency={currency}
            onSelectMaterial={setSelectedMaterial}
          />
        )}

        {activeTab === 'cost-simulator' && (
          <CostSimulator
            items={items}
            currency={currency}
            onSelectMaterial={setSelectedMaterial}
          />
        )}
      </main>

      {/* Material 360 Detail Modal */}
      <MaterialModal
        item={selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        currency={currency}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span>ProcurePulse Intelligence Platform</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Real-time SCM & Strategic Sourcing Analytics</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className="hover:text-slate-900 transition-colors"
            >
              Command Center
            </button>
            <button
              onClick={() => setActiveTab('market-intel')}
              className="hover:text-slate-900 transition-colors"
            >
              Customs Benchmarks
            </button>
            <button
              onClick={() => setActiveTab('cost-simulator')}
              className="hover:text-slate-900 transition-colors"
            >
              Savings Simulator
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
