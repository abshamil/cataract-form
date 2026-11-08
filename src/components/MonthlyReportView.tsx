import React, { useState } from 'react';
import {
  FileText,
  Download,
  AlertOctagon,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Award,
  Layers,
  Users,
  Eye,
  Calendar,
  Filter,
  Printer,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { CataractRecord, MonthlyAuditStats } from '../types/surgery';
import { computeMonthlyAuditStats, getUniqueMonths, formatMonthLabel, BENCHMARKS } from '../utils/auditLogic';
import { generateMonthlyReportPDF, exportRecordsToCSV, generateOperativeRecordPDF } from '../utils/pdfExport';

interface MonthlyReportViewProps {
  records: CataractRecord[];
  onViewRecord?: (record: CataractRecord) => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  records,
  onViewRecord,
}) => {
  const uniqueMonths = getUniqueMonths(records);
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    uniqueMonths.includes(currentMonthKey) ? currentMonthKey : (uniqueMonths[0] || 'ALL')
  );

  const stats: MonthlyAuditStats = computeMonthlyAuditStats(records, selectedMonth);

  const filteredRecords = selectedMonth === 'ALL'
    ? records
    : records.filter((r) => r.date.startsWith(selectedMonth));

  const complicatedRecords = filteredRecords.filter(
    (r) => r.hasComplication || r.complications.length > 0 || r.vitrectomy !== 'None' || r.conversionNeeded
  );

  const handleDownloadPDF = () => {
    generateMonthlyReportPDF(stats, filteredRecords);
  };

  const handleExportCSV = () => {
    exportRecordsToCSV(filteredRecords);
  };

  const isPcrCompliant = stats.pcTearRate <= BENCHMARKS.PCR_MAX_TARGET;
  const isOverallCompliant = stats.complicationRate <= BENCHMARKS.COMPLICATION_OVERALL_TARGET;
  const isVitrectomyCompliant = stats.vitrectomyRate <= BENCHMARKS.VITRECTOMY_MAX_TARGET;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Banner & Audit Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Award className="w-4 h-4" />
            <span>Clinical Governance & Surgical Quality Audit</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Monthly Intraoperative Complications Report
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            St. Paul&apos;s Hospital Millennium Medical College • Department of Ophthalmology
          </p>
        </div>

        {/* Month Selector & Download Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Available Months (Cumulative)</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            Download Monthly Report (PDF)
          </button>
        </div>
      </div>

      {/* KPI Audit Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Surgeries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Surgeries
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats.totalCases}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {stats.uncomplicatedCases} uncomplicated ({stats.totalCases > 0 ? ((stats.uncomplicatedCases / stats.totalCases) * 100).toFixed(0) : 0}%)
          </div>
          <div className="absolute top-4 right-4 text-slate-200">
            <Eye className="w-8 h-8 opacity-40" />
          </div>
        </div>

        {/* Overall Complication Rate */}
        <div
          className={`p-5 rounded-2xl border shadow-xs relative overflow-hidden ${
            isOverallCompliant
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-rose-50/50 border-rose-200'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Complication Rate
          </div>
          <div
            className={`text-3xl font-black mb-1 ${
              isOverallCompliant ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {stats.complicationRate}%
          </div>
          <div className="text-xs flex items-center gap-1 font-semibold">
            {isOverallCompliant ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Below target (&lt;4.5%)
              </span>
            ) : (
              <span className="text-rose-700 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5" /> Exceeds audit target
              </span>
            )}
          </div>
        </div>

        {/* Posterior Capsule Rupture Rate (PCR) */}
        <div
          className={`p-5 rounded-2xl border shadow-xs relative overflow-hidden ${
            isPcrCompliant
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-rose-50/50 border-rose-200'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            PC Rupture Rate
          </div>
          <div
            className={`text-3xl font-black mb-1 ${
              isPcrCompliant ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {stats.pcTearRate}%
          </div>
          <div className="text-xs flex items-center gap-1 font-medium">
            <span className={isPcrCompliant ? 'text-emerald-800' : 'text-rose-800'}>
              {stats.pcTearCount} cases (Benchmark &lt;2.0%)
            </span>
          </div>
        </div>

        {/* Vitrectomy Rate & Duration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Vitrectomy Rate
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats.vitrectomyRate}%</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>{stats.vitrectomyCount} cases</span>
            <span className="text-slate-300">•</span>
            <span>Avg {stats.avgDurationMinutes}m / case</span>
          </div>
        </div>
      </div>

      {/* Grid: Complication Breakdown & Surgical Technique Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complications Distribution Panel */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              Intraoperative Complications Breakdown
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {stats.complicatedCases} Total Events
            </span>
          </div>

          {stats.complicationTypeCounts.length > 0 ? (
            <div className="space-y-3">
              {stats.complicationTypeCounts.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.type}</span>
                    <span className="text-slate-500 font-mono">
                      <strong>{item.count}</strong> ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.type.toLowerCase().includes('pc tear')
                          ? 'bg-rose-500'
                          : item.type.toLowerCase().includes('vitrectomy')
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, item.percentage * 5 + 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">Zero Complications in this Period</p>
              <p className="text-[11px] text-slate-400">All cataract surgeries completed without adverse events.</p>
            </div>
          )}


        </div>

        {/* Surgical Technique Safety Matrix */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Technique Safety Comparison (Phaco vs SICS vs ECCE)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2">Technique</th>
                  <th className="pb-2 text-center">Cases</th>
                  <th className="pb-2 text-center">Clean</th>
                  <th className="pb-2 text-center">Complications</th>
                  <th className="pb-2 text-right">Comp. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.byTechnique.map((tech) => (
                  <tr key={tech.technique} className="hover:bg-slate-50/70">
                    <td className="py-2.5 font-bold text-slate-900">{tech.technique}</td>
                    <td className="py-2.5 text-center font-mono">{tech.total}</td>
                    <td className="py-2.5 text-center text-emerald-600 font-mono">
                      {tech.total - tech.complicated}
                    </td>
                    <td className="py-2.5 text-center font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          tech.complicated > 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {tech.complicated}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-800">
                      {tech.complicationRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Anesthesia distribution summary */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Anesthesia Modality Distribution
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stats.byAnesthesia.map((anes) => (
                <div key={anes.type} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-800">{anes.type}</div>
                  <div className="text-[10px] text-slate-500">
                    {anes.total} cases ({anes.complicated} complications)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* Complications Registry Detail Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Case-by-Case Complications & Management Register ({complicatedRecords.length} Cases)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" /> Print Monthly Register
          </button>
        </div>

        {complicatedRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Patient MRN</th>
                  <th className="py-2.5 px-3 text-center">Eye</th>
                  <th className="py-2.5 px-3">Surgeon</th>
                  <th className="py-2.5 px-3">Technique</th>
                  <th className="py-2.5 px-3">Complication(s)</th>
                  <th className="py-2.5 px-3">Immediate Management</th>
                  <th className="py-2.5 px-3 text-center">IOL</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complicatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-600">{r.date}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold font-mono text-blue-700">{r.mrn}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Age {r.age} • {r.sex}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-blue-700">
                      {r.operatedEye}
                    </td>
                    <td className="py-3 px-3 text-slate-700">{r.surgeon}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{r.lensExtraction}</td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        {r.complications.map((c, i) => (
                          <div key={i} className="text-rose-700 font-bold text-[11px]">
                            • {c.type}
                          </div>
                        ))}
                        {r.conversionNeeded && (
                          <div className="text-amber-700 font-bold text-[10px]">
                            • Converted to ECCE/SICS
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] max-w-xs">
                      {r.complications.map((c) => c.management).filter(Boolean).join('; ') ||
                        'Standard surgical management'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded-sm text-[10px] font-semibold text-slate-700">
                        {r.iolPlacement}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => generateOperativeRecordPDF(r)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          title="Download Operative Record PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {onViewRecord && (
                          <button
                            type="button"
                            onClick={() => onViewRecord(r)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit or view case"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs font-semibold">No Complications Recorded in this Timeframe</p>
          </div>
        )}
      </div>
    </div>
  );
};
