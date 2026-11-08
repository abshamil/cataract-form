import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Printer,
  Edit3,
  Trash2,
  Copy,
  AlertOctagon,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { CataractRecord, LensExtraction, Eye } from '../types/surgery';
import { generateOperativeRecordPDF, exportRecordsToCSV } from '../utils/pdfExport';

interface SurgeryLogViewProps {
  records: CataractRecord[];
  onAddNew?: () => void;
  onEdit: (record: CataractRecord) => void;
  onDelete: (id: string) => void;
  onDuplicate: (record: CataractRecord) => void;
  initialSearchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const SurgeryLogView: React.FC<SurgeryLogViewProps> = ({
  records,
  onAddNew,
  onEdit,
  onDelete,
  onDuplicate,
  initialSearchQuery = '',
  onSearchChange,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filterEye, setFilterEye] = useState<string>('ALL');
  const [filterTechnique, setFilterTechnique] = useState<string>('ALL');
  const [filterComplication, setFilterComplication] = useState<'ALL' | 'COMPLICATED' | 'CLEAN'>('ALL');

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const filteredRecords = records.filter((r) => {
    // Search query by MRN, surgeon, or diagnosis
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.mrn.toLowerCase().includes(q) ||
      r.surgeon.toLowerCase().includes(q) ||
      r.diagnosis.toLowerCase().includes(q);

    // Eye filter
    const matchesEye = filterEye === 'ALL' || r.operatedEye === filterEye;

    // Technique filter
    const matchesTechnique = filterTechnique === 'ALL' || r.lensExtraction === filterTechnique;

    // Complication filter
    const hasComp = r.hasComplication || r.complications.length > 0 || r.vitrectomy !== 'None';
    const matchesComp =
      filterComplication === 'ALL' ||
      (filterComplication === 'COMPLICATED' && hasComp) ||
      (filterComplication === 'CLEAN' && !hasComp);

    return matchesSearch && matchesEye && matchesTechnique && matchesComp;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-16">
      {/* Top Banner & Primary Action */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Patient MRN Directory & Records
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {records.length} patients logged by MRN ({records.filter((r) => r.hasComplication).length} with intraop complications).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => exportRecordsToCSV(records)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search by MRN input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            placeholder="Search by Patient MRN (e.g. SP-2026-8812), Surgeon, or Diagnosis..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden placeholder:font-sans placeholder:font-normal"
          />
        </div>

        {/* Filter Pills & Selectors */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Eye filter */}
          <select
            value={filterEye}
            onChange={(e) => setFilterEye(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Eyes (OD/OS/OU)</option>
            <option value="OD">OD (Right Eye)</option>
            <option value="OS">OS (Left Eye)</option>
            <option value="OU">OU (Bilateral)</option>
          </select>

          {/* Technique filter */}
          <select
            value={filterTechnique}
            onChange={(e) => setFilterTechnique(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Techniques</option>
            <option value="SICS">SICS</option>
            <option value="Phaco">Phaco</option>
            <option value="ECCE">ECCE</option>
            <option value="ICCE">ICCE</option>
          </select>

          {/* Complication Filter */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterComplication('ALL')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                filterComplication === 'ALL' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({records.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterComplication('COMPLICATED')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                filterComplication === 'COMPLICATED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Adverse ({records.filter((r) => r.hasComplication).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterComplication('CLEAN')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                filterComplication === 'CLEAN' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Clean ({records.filter((r) => !r.hasComplication).length})
            </button>
          </div>
        </div>
      </div>

      {/* Case Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Patient MRN</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Age & Sex</th>
                <th className="py-3 px-3 text-center">Eye</th>
                <th className="py-3 px-4">Surgeon</th>
                <th className="py-3 px-3 text-center">Technique</th>
                <th className="py-3 px-3 text-center">IOL Power & Type</th>
                <th className="py-3 px-4">Complications & Status</th>
                <th className="py-3 px-3 text-center">Duration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => {
                  const hasComp = r.hasComplication || r.complications.length > 0 || r.vitrectomy !== 'None';
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        hasComp ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* MRN */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-blue-700 text-xs">{r.mrn}</div>
                        <div className="text-[10px] text-slate-400">{r.diagnosis}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {r.date}
                      </td>

                      {/* Age & Sex */}
                      <td className="py-3 px-3 text-slate-700">
                        {r.age} yrs • {r.sex.charAt(0)}
                      </td>

                      {/* Operated Eye Badge */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-black text-xs ${
                            r.operatedEye === 'OD'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : r.operatedEye === 'OS'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {r.operatedEye}
                        </span>
                      </td>

                      {/* Surgeon */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{r.surgeon}</div>
                        <div className="text-[10px] text-slate-400">Asst: {r.assistant || 'None'}</div>
                      </td>

                      {/* Technique */}
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {r.lensExtraction}
                      </td>

                      {/* IOL Details */}
                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        {r.iolPlacement === 'Aphakia' ? (
                          <span className="text-amber-700 font-bold">Aphakic</span>
                        ) : (
                          <>
                            <div className="font-bold text-slate-900">
                              {r.iolPower ? `+${r.iolPower} D` : '-'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {r.iolPlacement} • {r.iolType}
                            </div>
                          </>
                        )}
                      </td>

                      {/* Complications & Status */}
                      <td className="py-3 px-4">
                        {hasComp ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <AlertOctagon className="w-3 h-3 text-rose-600" />
                              Complication
                            </span>
                            {r.complications.map((c, i) => (
                              <div key={i} className="text-rose-700 text-[11px] font-semibold">
                                {c.type}
                              </div>
                            ))}
                            {r.vitrectomy !== 'None' && (
                              <div className="text-[10px] text-slate-600 font-medium">
                                Vitrectomy: {r.vitrectomy}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Uncomplicated
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-3 text-center font-mono text-slate-700 text-[11px]">
                        {r.durationMinutes}m
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => generateOperativeRecordPDF(r)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Download St. Paul's Operative PDF Form"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicate(r)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Duplicate record"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(r)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete record for MRN ${r.mrn}?`)) {
                                onDelete(r.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600 mb-1">No patient found matching search</p>
                    <p className="text-xs text-slate-400">Check the MRN query or add a new operative record.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
