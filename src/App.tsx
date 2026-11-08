import React, { useState, useEffect } from 'react';
import {
  Menu,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { CataractRecord } from './types/surgery';
import { INITIAL_SEED_RECORDS } from './data/seedData';
import { Sidebar, NavTab } from './components/Sidebar';
import { SurgeryForm } from './components/SurgeryForm';
import { MonthlyReportView } from './components/MonthlyReportView';
import { SurgeryLogView } from './components/SurgeryLogView';
import { generateOperativeRecordPDF } from './utils/pdfExport';

const STORAGE_KEY = 'cataractor_operative_records_v3';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('form');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [searchMRNQuery, setSearchMRNQuery] = useState('');

  // Records state loaded from localStorage or initial hospital seed dataset
  const [records, setRecords] = useState<CataractRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SEED_RECORDS;
  });

  // Current record being edited (null for new surgery)
  const [editingRecord, setEditingRecord] = useState<CataractRecord | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Save records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to localStorage', e);
    }
  }, [records]);

  // Save handler from SurgeryForm
  const handleSaveRecord = (record: CataractRecord, andPrint = false) => {
    const existingIndex = records.findIndex((r) => r.id === record.id);
    let updated: CataractRecord[];
    if (existingIndex >= 0) {
      updated = [...records];
      updated[existingIndex] = record;
      showToast(`Operative record for MRN ${record.mrn} updated successfully.`, 'success');
    } else {
      updated = [record, ...records];
      showToast(`New surgery documented: MRN ${record.mrn} (${record.operatedEye})`, 'success');
    }

    setRecords(updated);
    setEditingRecord(null);

    if (andPrint) {
      generateOperativeRecordPDF(record);
      showToast('Generating printable Operative Record PDF...', 'info');
    }

    // Switch to patient directory after saving
    setActiveTab('patients');
  };

  const handleEditRecord = (record: CataractRecord) => {
    setEditingRecord(record);
    setActiveTab('form');
  };

  const handleDeleteRecord = (id: string) => {
    const rec = records.find((r) => r.id === id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showToast(`Record MRN ${rec?.mrn || id} deleted.`, 'warn');
  };

  const handleDuplicateRecord = (record: CataractRecord) => {
    const duplicated: CataractRecord = {
      ...record,
      id: `rec-${Date.now()}`,
      mrn: `${record.mrn}-2`,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRecords([duplicated, ...records]);
    setEditingRecord(duplicated);
    setActiveTab('form');
    showToast(`Duplicated record loaded into form as MRN ${duplicated.mrn}.`, 'info');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all surgery records to initial hospital dataset?')) {
      setRecords(INITIAL_SEED_RECORDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_RECORDS));
      showToast('Reset to initial hospital dataset.', 'info');
    }
  };

  const handleSelectRecordFromSearch = (record: CataractRecord) => {
    setEditingRecord(record);
    setActiveTab('form');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-md p-3.5 rounded-xl shadow-xl border bg-white flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {toast.type === 'warn' && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
          <div className="text-xs font-semibold text-slate-800">{toast.message}</div>
        </div>
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'form') {
            setEditingRecord(null);
          }
          setActiveTab(tab);
        }}
        records={records}
        isOpenMobile={isOpenMobile}
        onToggleMobile={() => setIsOpenMobile(!isOpenMobile)}
      />

      {/* Main Content Viewport with Sidebar Offset */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Subtle mobile menu toggle button on small screens only (no title, no banner, no top new surgery button) */}
        <div className="lg:hidden p-3 bg-white border-b border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsOpenMobile(true)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-xs font-mono font-bold text-slate-500">
            {records.length} Cases Logged
          </div>
        </div>

        {/* Dynamic View Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          {activeTab === 'form' && (
            <div>
              {editingRecord && (
                <div className="max-w-4xl mx-auto mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>
                      Editing existing case: <strong>MRN {editingRecord.mrn}</strong> ({editingRecord.operatedEye} - {editingRecord.lensExtraction})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRecord(null);
                    }}
                    className="text-xs font-bold text-amber-800 hover:underline"
                  >
                    Clear to New Case
                  </button>
                </div>
              )}
              <SurgeryForm
                key={editingRecord?.id || 'new-record'}
                initialData={editingRecord}
                onSave={handleSaveRecord}
                onCancel={() => {
                  setEditingRecord(null);
                  setActiveTab('patients');
                }}
              />
            </div>
          )}

          {activeTab === 'patients' && (
            <SurgeryLogView
              records={records}
              initialSearchQuery={searchMRNQuery}
              onSearchChange={setSearchMRNQuery}
              onAddNew={() => {
                setEditingRecord(null);
                setActiveTab('form');
              }}
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
              onDuplicate={handleDuplicateRecord}
            />
          )}

          {activeTab === 'report' && (
            <MonthlyReportView
              records={records}
              onViewRecord={(record) => {
                setEditingRecord(record);
                setActiveTab('form');
              }}
            />
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <strong>CataractOR</strong> — Intraoperative Audit & Monthly Complications Register
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <button
                type="button"
                onClick={handleResetData}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                Reset Hospital Data
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
