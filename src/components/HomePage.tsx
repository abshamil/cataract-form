import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  BarChart3,
  FileText,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Eye,
  Printer,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { CataractRecord, MonthlyAuditStats } from '../types/surgery';
import { computeMonthlyAuditStats, filterRecordsByMRN, getRecentRecords, BENCHMARKS } from '../utils/auditLogic';
import { generateOperativeRecordPDF } from '../utils/pdfExport';

interface HomePageProps {
  records: CataractRecord[];
  onNewSurgery: () => void;
  onViewRecord: (record: CataractRecord) => void;
  onGoToMonthlyReport: () => void;
  onGoToPatientsDirectory: () => void;
  initialMRNQuery?: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  records,
  onNewSurgery,
  onViewRecord,
  onGoToMonthlyReport,
  onGoToPatientsDirectory,
  initialMRNQuery = '',
}) => {
  const [mrnQuery, setMrnQuery] = useState(initialMRNQuery);
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentMonthStats: MonthlyAuditStats = computeMonthlyAuditStats(records, currentMonthKey);

  // Filter by MRN
  const searchResults = mrnQuery.trim()
    ? filterRecordsByMRN(records, mrnQuery)
    : [];

  const recentRecords = getRecentRecords(records, 8);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Home Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Cataract Surgery OR Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            St. Paul&apos;s Hospital Millennium Medical College • Intraoperative Documentation & Clinical Governance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNewSurgery}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Document New Surgery
          </button>
          <button
            type="button"
            onClick={onGoToMonthlyReport}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Monthly Report
          </button>
        </div>
      </div>

      {/* Prominent Search by Patient MRN Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-600" />
          <span>Search Patient by MRN (Medical Record Number)</span>
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={mrnQuery}
            onChange={(e) => setMrnQuery(e.target.value)}
            placeholder="Enter full or partial MRN (e.g. SP-2026-8812, 8813, 8790)..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
          />
          {mrnQuery && (
            <button
              type="button"
              onClick={() => setMrnQuery('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 font-semibold px-2 py-0.5 rounded-md hover:bg-slate-100"
            >
              Clear
            </button>
          )}
        </div>

        {/* Live MRN Search Results (if user types) */}
        {mrnQuery.trim() && (
          <div className="mt-3 border border-blue-200 rounded-xl overflow-hidden bg-blue-50/20">
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs font-bold text-blue-900 flex justify-between items-center">
              <span>Matching MRN Records ({searchResults.length})</span>
              <button
                type="button"
                onClick={onGoToPatientsDirectory}
                className="text-[11px] text-blue-700 hover:underline flex items-center gap-1"
              >
                View all in Directory <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto bg-white">
                {searchResults.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-800 font-mono font-bold text-xs">
                        {r.mrn}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800">
                          {r.age} yrs • {r.sex} • Eye: <strong className="text-blue-700">{r.operatedEye}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {r.date} • {r.lensExtraction} • {r.surgeon}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {r.hasComplication ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3 text-rose-600" />
                          Complication
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Clean Case
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => generateOperativeRecordPDF(r)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          title="Download Operative PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewRecord(r)}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                        >
                          Open Record
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs bg-white">
                No patient found with MRN matching &ldquo;{mrnQuery}&rdquo;.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Monthly Governance KPI Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Current Month Clinical Performance ({currentMonthStats.monthLabel})</span>
          </div>
          <button
            type="button"
            onClick={onGoToMonthlyReport}
            className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
          >
            View Full Report <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Surgeries
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{currentMonthStats.totalCases}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {currentMonthStats.uncomplicatedCases} uncomplicated cases
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border shadow-2xs ${
              currentMonthStats.complicationRate <= BENCHMARKS.COMPLICATION_OVERALL_TARGET
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-rose-50/50 border-rose-200'
            }`}
          >
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Complication Rate
            </div>
            <div
              className={`text-2xl font-black mt-1 ${
                currentMonthStats.complicationRate <= BENCHMARKS.COMPLICATION_OVERALL_TARGET
                  ? 'text-emerald-700'
                  : 'text-rose-700'
              }`}
            >
              {currentMonthStats.complicationRate}%
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Target: &lt;{BENCHMARKS.COMPLICATION_OVERALL_TARGET}%
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border shadow-2xs ${
              currentMonthStats.pcTearRate <= BENCHMARKS.PCR_MAX_TARGET
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-rose-50/50 border-rose-200'
            }`}
          >
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              PC Rupture Rate
            </div>
            <div
              className={`text-2xl font-black mt-1 ${
                currentMonthStats.pcTearRate <= BENCHMARKS.PCR_MAX_TARGET
                  ? 'text-emerald-700'
                  : 'text-rose-700'
              }`}
            >
              {currentMonthStats.pcTearRate}%
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              {currentMonthStats.pcTearCount} case (Benchmark &lt;2.0%)
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Vitrectomies
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{currentMonthStats.vitrectomyCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Rate: {currentMonthStats.vitrectomyRate}% (Target &lt;1.8%)
            </div>
          </div>
        </div>
      </div>

      {/* Recent Patient MRN List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Recent Patient Cases by MRN</h3>
            <span className="text-xs text-slate-400 font-mono">({records.length} total)</span>
          </div>
          <button
            type="button"
            onClick={onGoToPatientsDirectory}
            className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
          >
            Browse All Patients <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-4">Patient MRN</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Age & Sex</th>
                <th className="py-2.5 px-3 text-center">Eye</th>
                <th className="py-2.5 px-4">Technique</th>
                <th className="py-2.5 px-4">Surgeon</th>
                <th className="py-2.5 px-4">Status & Complication</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.map((r) => {
                const hasComp = r.hasComplication || r.complications.length > 0;
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {r.mrn}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{r.date}</td>
                    <td className="py-3 px-3 text-slate-700">
                      {r.age} yrs • {r.sex.charAt(0)}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] ${
                          r.operatedEye === 'OD'
                            ? 'bg-blue-100 text-blue-800'
                            : r.operatedEye === 'OS'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {r.operatedEye}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.lensExtraction}</td>
                    <td className="py-3 px-4 text-slate-700">{r.surgeon}</td>
                    <td className="py-3 px-4">
                      {hasComp ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertOctagon className="w-3 h-3 text-rose-600" />
                            Complication
                          </span>
                          <div className="text-[11px] text-rose-700 font-semibold truncate max-w-xs">
                            {r.complications.map((c) => c.type).join(', ') || 'Adverse event noted'}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Uncomplicated
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => generateOperativeRecordPDF(r)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          title="Print Operative PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewRecord(r)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          View
                        </button>
                      </div>
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
