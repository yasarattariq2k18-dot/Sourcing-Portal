import React, { useState } from 'react';
import { MaterialItem, ViewTab, SlicerState } from './types/procurement';
import { INITIAL_PROCUREMENT_DATA } from './data/procurementData';
import { parseCSV, mapRawRowToMaterialItem } from './utils/dataParser';
import { Header } from './components/Header';
import { DirectorAnalytics } from './components/DirectorAnalytics';
import { MultiRoleSlicers } from './components/MultiRoleSlicers';
import { InquiryVendorPortal } from './components/InquiryVendorPortal';
import { AiAssistant } from './components/AiAssistant';
import { CollaborativeHub } from './components/CollaborativeHub';
import { MaterialExplorer } from './components/MaterialExplorer';
import { CostSimulator } from './components/CostSimulator';
import { MaterialModal } from './components/MaterialModal';
import { ChatbotWidget } from './components/ChatbotWidget';

export default function App() {
  const [items, setItems] = useState<MaterialItem[]>(INITIAL_PROCUREMENT_DATA);
  const [activeTab, setActiveTab] = useState<ViewTab>('director-analytics');
  const [currency, setCurrency] = useState<'USD' | 'PKR'>('USD');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global slicer state for Section 2
  const [slicerState, setSlicerState] = useState<SlicerState>({
    role: 'director',
    category: 'ALL',
    sourcing: 'ALL',
    originRegion: 'ALL',
    pipelinePhase: 'ALL',
    searchQuery: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResetData = () => {
    setItems(INITIAL_PROCUREMENT_DATA);
    showToast('Reset to default ATCO master procurement dataset');
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
        for (let i = 1; i < rows.length; i++) {
          const item = mapRawRowToMaterialItem(rows[i], i);
          if (item) {
            parsedItems.push(item);
          }
        }

        if (parsedItems.length > 0) {
          setItems(parsedItems);
          showToast(`Loaded ${parsedItems.length} materials from ${file.name}`);
        } else {
          showToast('No valid material rows recognized from the uploaded CSV');
        }
      } catch {
        showToast('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          {toastMessage}
        </div>
      )}

      {/* Main Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        totalItems={items.length}
        onResetData={handleResetData}
        onFileUpload={handleFileUpload}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'director-analytics' && (
          <DirectorAnalytics
            items={items}
            currency={currency}
            onSelectMaterial={setSelectedMaterial}
            onOpenAiBriefing={() => setActiveTab('ai-assistant')}
          />
        )}

        {activeTab === 'slicers-reports' && (
          <MultiRoleSlicers
            items={items}
            slicerState={slicerState}
            setSlicerState={setSlicerState}
            currency={currency}
            onSelectMaterial={setSelectedMaterial}
          />
        )}

        {activeTab === 'inquiry-portal' && (
          <InquiryVendorPortal
            materials={items}
            currency={currency}
            onSelectMaterial={setSelectedMaterial}
          />
        )}

        {activeTab === 'ai-assistant' && (
          <AiAssistant
            materials={items}
            currency={currency}
            onSelectMaterial={setSelectedMaterial}
          />
        )}

        {activeTab === 'collaborative-hub' && (
          <CollaborativeHub
            materials={items}
            onSelectMaterial={setSelectedMaterial}
          />
        )}

        {activeTab === 'catalog' && (
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

      {/* Persistent Floating AI Chatbot Assistant Widget */}
      <ChatbotWidget
        materials={items}
        currency={currency}
      />

      {/* Material 360° Detail Modal */}
      <MaterialModal
        item={selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        currency={currency}
      />

      {/* Quiet Corporate Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-mono">
          <div>
            <span>ATCO Laboratories Limited</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Strategic Procurement & Supply Chain Directorate</span>
          </div>
          <div className="flex items-center gap-4 font-sans text-xs">
            <button
              onClick={() => setActiveTab('director-analytics')}
              className="hover:text-slate-900 transition-colors"
            >
              Director Analytics
            </button>
            <button
              onClick={() => setActiveTab('inquiry-portal')}
              className="hover:text-slate-900 transition-colors"
            >
              Vendor Portal
            </button>
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className="hover:text-slate-900 transition-colors"
            >
              AI Sourcing
            </button>
            <button
              onClick={() => setActiveTab('collaborative-hub')}
              className="hover:text-slate-900 transition-colors"
            >
              Knowledge Hub
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
