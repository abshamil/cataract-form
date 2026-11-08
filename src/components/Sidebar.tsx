import React, { useState } from 'react';
import {
  FilePlus2,
  Users,
  BarChart3,
  X,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { CataractRecord } from '../types/surgery';

export type NavTab = 'form' | 'patients' | 'report';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  records: CataractRecord[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectRecord: (record: CataractRecord) => void;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  records,
  searchQuery,
  onSearchChange,
  onSelectRecord,
  isOpenMobile,
  onToggleMobile,
}) => {
  const menuItems = [
    {
      id: 'form' as NavTab,
      label: 'New Operative Record',
      icon: FilePlus2,
      desc: 'Rapid OR documentation',
    },
    {
      id: 'patients' as NavTab,
      label: 'Patient MRN Directory',
      icon: Users,
      badge: `${records.length}`,
      desc: 'All cases by MRN',
    },
    {
      id: 'report' as NavTab,
      label: 'Monthly Audit Report',
      icon: BarChart3,
      desc: 'Complications & PDF export',
    },
  ];

  // Live matching records for sidebar search
  const cleanQuery = searchQuery.trim().toLowerCase();
  const searchMatches = cleanQuery
    ? records.filter((r) => r.mrn.toLowerCase().includes(cleanQuery))
    : [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onToggleMobile}
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-2xs"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20">
              OR
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-white leading-tight">
                CataractOR
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                St. Paul&apos;s Millennium Hospital
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Functional "Search Patient by MRN" in Sidebar */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/30">
          <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">
            Search Patient by MRN
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                onSearchChange(val);
                if (val.trim() && currentTab !== 'patients') {
                  onSelectTab('patients');
                }
              }}
              placeholder="Type patient MRN..."
              className="w-full pl-9 pr-7 py-2 rounded-xl bg-slate-800 text-white placeholder:text-slate-400 text-xs font-mono font-bold border border-slate-700 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Dropdown Matches in Sidebar */}
          {cleanQuery && (
            <div className="mt-2 bg-slate-800/90 rounded-xl border border-slate-700 overflow-hidden divide-y divide-slate-700/60 max-h-48 overflow-y-auto shadow-lg">
              {searchMatches.length > 0 ? (
                <>
                  {searchMatches.slice(0, 5).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        onSelectRecord(r);
                        if (isOpenMobile) onToggleMobile();
                      }}
                      className="w-full p-2.5 text-left hover:bg-slate-700/80 transition-colors flex items-center justify-between text-xs group"
                    >
                      <div>
                        <div className="font-mono font-bold text-blue-400 group-hover:text-blue-300">
                          {r.mrn}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Eye: <strong className="text-slate-200">{r.operatedEye}</strong> • {r.lensExtraction}
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold ${
                          r.hasComplication
                            ? 'bg-rose-900/60 text-rose-300 border border-rose-800/50'
                            : 'bg-emerald-900/60 text-emerald-300 border border-emerald-800/50'
                        }`}
                      >
                        {r.hasComplication ? 'Comp' : 'Clean'}
                      </span>
                    </button>
                  ))}
                  {searchMatches.length > 5 && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('patients');
                        if (isOpenMobile) onToggleMobile();
                      }}
                      className="w-full p-1.5 text-center text-[10px] text-blue-400 hover:underline bg-slate-850"
                    >
                      View all {searchMatches.length} in Directory
                    </button>
                  )}
                </>
              ) : (
                <div className="p-3 text-center text-[11px] text-slate-400">
                  No patient found with MRN &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Navigation Menu
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  if (isOpenMobile) onToggleMobile();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-xs truncate">{item.label}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-white text-blue-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer in Sidebar */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2 mb-1 text-slate-300 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dept. of Ophthalmology</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Intraoperative Audit & Monthly Complications Registry
          </p>
        </div>
      </aside>
    </>
  );
};
