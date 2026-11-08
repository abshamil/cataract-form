import React, { useState } from 'react';
import {
  Save,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  Syringe,
  Scissors,
  Package,
  Layers,
  Sparkles,
  X,
  Plus,
  Trash2,
  Clock,
  Eye as EyeIcon,
} from 'lucide-react';
import type {
  CataractRecord,
  Eye,
  AnesthesiaType,
  AnesthesiaComplication,
  Peritomy,
  ACEntry,
  Capsulotomy,
  LensExtraction,
  IOLPlacement,
  IOLType,
  Iridectomy,
  Vitrectomy,
  IrrigatingSolution,
  ACMaintainer,
  SutureStatus,
  SutureType,
  ComplicationDetail,
} from '../types/surgery';
import { STANDARD_COMPLICATIONS } from '../utils/auditLogic';

interface SurgeryFormProps {
  initialData?: CataractRecord | null;
  onSave: (record: CataractRecord, andPrint?: boolean) => void;
  onCancel?: () => void;
}

export const SurgeryForm: React.FC<SurgeryFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  // Pop-out modal states
  const [activeModal, setActiveModal] = useState<
    'anesthesia' | 'procedure' | 'sutures' | 'supplies' | 'complications' | 'eye' | null
  >(null);

  // Core Clinical State
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(initialData?.time || new Date().toTimeString().slice(0, 5));
  const [mrn, setMrn] = useState(initialData?.mrn || '');
  const [age, setAge] = useState<number>(initialData?.age || 65);
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>(initialData?.sex || 'Male');
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || 'Mature Senile Cataract');
  const [operatedEye, setOperatedEye] = useState<Eye>(initialData?.operatedEye || 'OD');

  const [surgeon, setSurgeon] = useState(initialData?.surgeon || 'Dr. ');
  const [assistant, setAssistant] = useState(initialData?.assistant || 'Dr. ');
  const [scrubNurse, setScrubNurse] = useState(initialData?.scrubNurse || '');

  // Anesthesia & Antisepsis
  const [anesthesiaType, setAnesthesiaType] = useState<AnesthesiaType>(
    initialData?.anesthesiaType || 'Peribulbar'
  );
  const [anesthesiaComplication, setAnesthesiaComplication] = useState<AnesthesiaComplication>(
    initialData?.anesthesiaComplication || 'None'
  );
  const [anesthesiaNotes, setAnesthesiaNotes] = useState(initialData?.anesthesiaNotes || '');
  const [topicalPovidone, setTopicalPovidone] = useState(initialData?.topicalPovidone ?? true);
  const [tractionSuture, setTractionSuture] = useState(initialData?.tractionSuture ?? true);
  const [peritomy, setPeritomy] = useState<Peritomy>(initialData?.peritomy || 'Superior');
  const [acEntry, setAcEntry] = useState<ACEntry>(initialData?.acEntry || 'Sclero-corneal');

  // Procedure & IOL
  const [capsulotomy, setCapsulotomy] = useState<Capsulotomy>(initialData?.capsulotomy || 'CCC');
  const [lensExtraction, setLensExtraction] = useState<LensExtraction>(
    initialData?.lensExtraction || 'SICS'
  );
  const [iolPlacement, setIolPlacement] = useState<IOLPlacement>(initialData?.iolPlacement || 'PC');
  const [iolPower, setIolPower] = useState<number | null>(initialData?.iolPower ?? 21.5);
  const [iolType, setIolType] = useState<IOLType>(initialData?.iolType || 'Rigid');
  const [iolModel, setIolModel] = useState(initialData?.iolModel || 'Aurolab PMMA SQ525');
  const [iridectomy, setIridectomy] = useState<Iridectomy>(initialData?.iridectomy || 'None');
  const [vitrectomy, setVitrectomy] = useState<Vitrectomy>(initialData?.vitrectomy || 'None');

  // Suture & Suture Types (Multi-select)
  const [suture, setSuture] = useState<SutureStatus>(initialData?.suture || 'None');
  const [sutureTypes, setSutureTypes] = useState<string[]>(
    initialData?.sutureTypes || (initialData?.sutureType && initialData.sutureType !== 'None' ? [initialData.sutureType] : [])
  );

  // Supplies & Intracameral Meds (Multi-select)
  const [irrigatingSolution, setIrrigatingSolution] = useState<IrrigatingSolution>(
    initialData?.irrigatingSolution || 'RL'
  );
  const [acMaintainer, setAcMaintainer] = useState<ACMaintainer>(initialData?.acMaintainer || 'HPMC');
  const [intracameralMeds, setIntracameralMeds] = useState<string[]>(
    initialData?.intracameralMeds || ['Trypan Blue', 'Moxifloxacin']
  );
  const [subconjInj, setSubconjInj] = useState(initialData?.subconjInj || 'gentamycin + dexa');

  // Complications (Multi-select)
  const [hasComplication, setHasComplication] = useState(initialData?.hasComplication ?? false);
  const [complications, setComplications] = useState<ComplicationDetail[]>(
    initialData?.complications || []
  );
  const [conversionNeeded, setConversionNeeded] = useState(initialData?.conversionNeeded ?? false);
  const [conversionDetails, setConversionDetails] = useState(initialData?.conversionDetails || '');
  const [customCompNote, setCustomCompNote] = useState('');

  // Post-Op & Duration
  const [postOpMedications, setPostOpMedications] = useState(
    initialData?.postOpMedications || ''
  );
  const [postOpInstructions, setPostOpInstructions] = useState(
    initialData?.postOpInstructions || ''
  );
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes || 18);

  // Toggle multi-select suture types
  const toggleSutureType = (type: string) => {
    setSutureTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Toggle multi-select intracameral meds
  const toggleIntracameralMed = (med: string) => {
    setIntracameralMeds((prev) =>
      prev.includes(med) ? prev.filter((m) => m !== med) : [...prev, med]
    );
  };

  // Toggle multi-select complication preset
  const toggleComplication = (compItem: typeof STANDARD_COMPLICATIONS[number]) => {
    const exists = complications.some((c) => c.type === compItem.label);
    if (exists) {
      const remaining = complications.filter((c) => c.type !== compItem.label);
      setComplications(remaining);
      if (remaining.length === 0 && !conversionNeeded && vitrectomy === 'None') {
        setHasComplication(false);
      }
    } else {
      setHasComplication(true);
      const newComp: ComplicationDetail = {
        type: compItem.label,
        category: compItem.category,
        severity: compItem.severity,
        management: compItem.defaultManagement,
      };
      setComplications([...complications, newComp]);

      if (compItem.id === 'pc_tear_with_vit') {
        setVitrectomy('Automated');
        if (iolPlacement === 'PC') setIolPlacement('Sulcus');
      }
      if (compItem.id === 'aphakia' || compItem.id === 'unplanned_aphakia') {
        setIolPlacement('Aphakia');
        setIolType('None (Aphakic)');
        setIolPower(null);
      }
      if (compItem.id === 'converted_procedure') {
        setConversionNeeded(true);
      }
    }
  };

  const handleAddCustomComplication = () => {
    if (!customCompNote.trim()) return;
    setHasComplication(true);
    setComplications([
      ...complications,
      {
        type: customCompNote.trim(),
        category: 'Systemic / Other',
        severity: 'Moderate',
        management: 'Intraoperative stabilization and monitored care',
      },
    ]);
    setCustomCompNote('');
  };

  const handleRemoveComplication = (index: number) => {
    const updated = complications.filter((_, i) => i !== index);
    setComplications(updated);
    if (updated.length === 0 && !conversionNeeded && vitrectomy === 'None') {
      setHasComplication(false);
    }
  };

  const handleSubmit = (andPrint = false) => {
    const cleanMRN = mrn.trim() || `SP-${Date.now().toString().slice(-6)}`;
    const record: CataractRecord = {
      id: initialData?.id || `rec-${Date.now()}`,
      date,
      time,
      mrn: cleanMRN,
      age: Number(age) || 65,
      sex,
      diagnosis,
      operatedEye,
      surgeon,
      assistant,
      scrubNurse,
      anesthesiaType,
      anesthesiaComplication,
      anesthesiaNotes,
      topicalPovidone,
      tractionSuture,
      peritomy,
      acEntry,
      capsulotomy,
      lensExtraction,
      iolPlacement,
      iolPower,
      iolType,
      iolModel,
      iridectomy,
      vitrectomy,
      irrigatingSolution,
      acMaintainer,
      intracameralMeds,
      subconjInj,
      suture,
      sutureTypes,
      hasComplication: hasComplication || complications.length > 0 || vitrectomy !== 'None' || conversionNeeded,
      complications,
      conversionNeeded,
      conversionDetails,
      postOpMedications,
      postOpInstructions,
      durationMinutes: Number(durationMinutes) || 15,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(record, andPrint);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-10">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {initialData ? `Edit Record: MRN ${initialData.mrn}` : 'New Cataract Operative Record'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
            title="Save and download Operative PDF"
          >
            <Printer className="w-4 h-4" />
            Save & PDF
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Record
          </button>
        </div>
      </div>

      {/* SECTION 1: Patient MRN & Essential Identifiers (Concise Row) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            1. Patient MRN & Surgical Team
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">{date} • {time}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* MRN Input */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-900 block mb-1">
              Patient MRN <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              value={mrn}
              onChange={(e) => setMrn(e.target.value)}
              placeholder="e.g. SP-2026-9041"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Age & Sex */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-center text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Sex</label>
              <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                {(['Male', 'Female'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSex(s)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      sex === s ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {s.charAt(0)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Duration in Minutes (Clean without -5/+5) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Duration (Min)</label>
            <input
              type="number"
              min="1"
              max="300"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 15)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-center text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Row 2: OPERATED EYE (POP-OUT TRIGGER) + Diagnosis + Surgeon + Assistant Surgeon */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-1">
          {/* Operated Eye Pop-Out Trigger Button */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">
              Operated Eye <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setActiveModal('eye')}
              className={`w-full px-3.5 py-2.5 rounded-xl border-2 text-left flex items-center justify-between transition-all group ${
                operatedEye === 'OD'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                  : operatedEye === 'OS'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                  : 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
              }`}
            >
              <div className="flex items-center gap-2">
                <EyeIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-black">{operatedEye}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Surgeon</label>
            <input
              type="text"
              value={surgeon}
              onChange={(e) => setSurgeon(e.target.value)}
              placeholder="Dr. "
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Assistant Surgeon</label>
            <input
              type="text"
              value={assistant}
              onChange={(e) => setAssistant(e.target.value)}
              placeholder="Dr. "
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: CONCISE POP-OUT TRIGGER BUTTONS (USER REQUESTED ARCHITECTURE) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            2. Operative Steps & Medications (Tap button to pop out options)
          </h3>
          <span className="text-[11px] text-slate-400">Multi-select enabled</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Button 1: Anesthesia & Safety Popout */}
          <button
            type="button"
            onClick={() => setActiveModal('anesthesia')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Syringe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                  Anesthesia & Incision Setup
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {anesthesiaType} • {topicalPovidone ? 'Povidone 5% (Yes)' : 'No Povidone'} • {acEntry}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          {/* Button 2: Procedure & IOL Popout */}
          <button
            type="button"
            onClick={() => setActiveModal('procedure')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                  Capsulotomy, Extraction & IOL
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {capsulotomy} • {lensExtraction} • {iolPlacement} ({iolPower ? `+${iolPower}D` : 'Aphakic'}, {iolType})
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </button>

          {/* Button 3: Suture & Suture Types Multi-select Popout (Directly Requested!) */}
          <button
            type="button"
            onClick={() => setActiveModal('sutures')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-2">
                  <span>Suture & Suture Types</span>
                  {suture !== 'None' && (
                    <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {sutureTypes.length} Selected
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {suture === 'None'
                    ? 'None (Sutureless incision)'
                    : `${suture}: ${sutureTypes.join(', ') || 'Select types...'}`}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </button>

          {/* Button 4: Supplies & Intracameral Meds Multi-select Popout */}
          <button
            type="button"
            onClick={() => setActiveModal('supplies')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 flex items-center gap-2">
                  <span>Supplies & Intracameral Meds</span>
                  <span className="px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {intracameralMeds.length} Meds
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[220px]">
                  {irrigatingSolution} • {acMaintainer} • {intracameralMeds.join(', ')}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
          </button>
        </div>
      </div>

      {/* SECTION 3: INTRAOPERATIVE COMPLICATIONS POP-OUT TRIGGER (AUDIT CORE) */}
      <div
        className={`rounded-2xl p-5 border-2 transition-all shadow-xs ${
          hasComplication ? 'bg-rose-50/50 border-rose-400' : 'bg-white border-emerald-400/80'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-xs ${
                hasComplication ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {hasComplication ? <AlertOctagon className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Intraoperative Complications
                </h3>
                {hasComplication ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    {complications.length} Complication(s) Logged
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Clean Case (Uncomplicated)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {hasComplication
                  ? complications.map((c) => c.type).join(' • ')
                  : 'No surgical complications occurred.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveModal('complications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                hasComplication
                  ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {hasComplication ? 'Edit Complications' : 'Select Complication'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: Post-Op Medications */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          3. Post-Operative Plan & Review
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Post-Op Medications</label>
            <input
              type="text"
              value={postOpMedications}
              onChange={(e) => setPostOpMedications(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Post-Op Instructions</label>
            <input
              type="text"
              value={postOpInstructions}
              onChange={(e) => setPostOpInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* POP-OUT MODAL 1: SUTURES & SUTURE TYPES (MULTI-SELECT) */}
      {/* ============================================================ */}
      {activeModal === 'sutures' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Suture & Suture Types (Multi-Select)</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Suture Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['None', 'Interrupted', 'Continuous'] as SutureStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSuture(s)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        suture === s
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {suture !== 'None' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Suture Materials (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Nylon 10/0',
                      'Nylon 9/0',
                      'Vicryl 8/0',
                      'Vicryl 6/0',
                      'Silk 8/0',
                      'Prolene 10/0',
                    ].map((st) => {
                      const isSelected = sutureTypes.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => toggleSutureType(st)}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{st}</span>
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                              isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                            }`}
                          >
                            {isSelected && '✓'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
              >
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POP-OUT MODAL 2: ANESTHESIA & SAFETY POP-OUT */}
      {/* ============================================================ */}
      {activeModal === 'anesthesia' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Syringe className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Anesthesia & Surgical Safety</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Type of Anesthesia</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Peribulbar', 'Topical', 'STA', 'RBA', 'GA', 'Other'] as AnesthesiaType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAnesthesiaType(t)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                        anesthesiaType === t
                          ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Anesthesia Complication</label>
                <select
                  value={anesthesiaComplication}
                  onChange={(e) => setAnesthesiaComplication(e.target.value as AnesthesiaComplication)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                >
                  <option value="None">None</option>
                  <option value="RB hemorrhage">RB hemorrhage</option>
                  <option value="Globe perforation">Globe perforation</option>
                  <option value="Brain stem anesthesia">Brain stem anesthesia</option>
                  <option value="Others (specify)">Others (specify)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 mb-1">Topical Povidone 5%</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTopicalPovidone(true)}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg border ${
                        topicalPovidone ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopicalPovidone(false)}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg border ${
                        !topicalPovidone ? 'bg-rose-600 text-white border-rose-600' : 'bg-white'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 mb-1">Traction Suture</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTractionSuture(true)}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg border ${
                        tractionSuture ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setTractionSuture(false)}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg border ${
                        !tractionSuture ? 'bg-slate-700 text-white border-slate-700' : 'bg-white'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Peritomy</label>
                  <select
                    value={peritomy}
                    onChange={(e) => setPeritomy(e.target.value as Peritomy)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="Superior">Superior</option>
                    <option value="Temporal">Temporal</option>
                    <option value="None">None</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">AC Entry</label>
                  <select
                    value={acEntry}
                    onChange={(e) => setAcEntry(e.target.value as ACEntry)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="Sclero-corneal">Sclero-corneal</option>
                    <option value="Corneal">Corneal (Clear corneal)</option>
                    <option value="Limbal">Limbal</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
              >
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POP-OUT MODAL 3: CAPSULOTOMY, EXTRACTION & IOL */}
      {/* ============================================================ */}
      {activeModal === 'procedure' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">Procedure Steps & IOL</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Capsulotomy</label>
                  <select
                    value={capsulotomy}
                    onChange={(e) => setCapsulotomy(e.target.value as Capsulotomy)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="CCC">CCC</option>
                    <option value="Can-opener">Can-opener</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lens Extraction</label>
                  <select
                    value={lensExtraction}
                    onChange={(e) => setLensExtraction(e.target.value as LensExtraction)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="SICS">SICS</option>
                    <option value="Phaco">Phaco</option>
                    <option value="ECCE">ECCE</option>
                    <option value="ICCE">ICCE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">IOL Placement</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PC', 'Sulcus', 'AC', 'Iris claw', 'Aphakia', 'Scleral fixated / Yamane'] as IOLPlacement[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setIolPlacement(p)}
                      className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition-all ${
                        iolPlacement === p
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">IOL Power (Diopters)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={iolPower ?? ''}
                    onChange={(e) => setIolPower(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="21.5"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">IOL Type</label>
                  <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                    {(['Foldable', 'Rigid'] as IOLType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setIolType(t)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          iolType === t ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Iridectomy</label>
                  <select
                    value={iridectomy}
                    onChange={(e) => setIridectomy(e.target.value as Iridectomy)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="None">None</option>
                    <option value="PI">PI</option>
                    <option value="Sphincterotomy">Sphincterotomy</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vitrectomy</label>
                  <select
                    value={vitrectomy}
                    onChange={(e) => setVitrectomy(e.target.value as Vitrectomy)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="None">None</option>
                    <option value="Automated">Automated</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
              >
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POP-OUT MODAL 4: SUPPLIES & INTRACAMERAL MEDS (MULTI-SELECT) */}
      {/* ============================================================ */}
      {activeModal === 'supplies' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">Supplies & Medications</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Irrigating Solution</label>
                  <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                    {(['RL', 'BSS'] as IrrigatingSolution[]).map((sol) => (
                      <button
                        key={sol}
                        type="button"
                        onClick={() => setIrrigatingSolution(sol)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          irrigatingSolution === sol ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {sol}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">AC Maintainer</label>
                  <select
                    value={acMaintainer}
                    onChange={(e) => setAcMaintainer(e.target.value as ACMaintainer)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="HPMC">HPMC</option>
                    <option value="BSS">BSS</option>
                    <option value="Air">Air</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Intracameral Medications (Multi-Select)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Trypan Blue',
                    'Moxifloxacin',
                    'Adrenaline / Epinephrine',
                    'Triamcinolone',
                  ].map((med) => {
                    const isSelected = intracameralMeds.includes(med);
                    return (
                      <button
                        key={med}
                        type="button"
                        onClick={() => toggleIntracameralMed(med)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{med}</span>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                            isSelected ? 'bg-amber-600 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && '✓'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subconjunctival Injection</label>
                <select
                  value={subconjInj}
                  onChange={(e) => setSubconjInj(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                >
                  <option value="gentamycin + dexa">gentamycin + dexa</option>
                  <option value="dexa only">dexa only</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
              >
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POP-OUT MODAL 5: INTRAOPERATIVE COMPLICATIONS (MULTI-SELECT) */}
      {/* ============================================================ */}
      {activeModal === 'complications' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Select Intraoperative Complications (Multi-Select)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Tap any complication to toggle. Multiple selections supported.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setHasComplication(false);
                    setComplications([]);
                    setVitrectomy('None');
                    setConversionNeeded(false);
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-300"
                >
                  Clear All (Clean Case)
                </button>
              </div>

              {/* Complications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STANDARD_COMPLICATIONS.map((comp) => {
                  const isSelected = complications.some((c) => c.type === comp.label);
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => toggleComplication(comp)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold leading-snug">{comp.label}</div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                          isSelected ? 'bg-rose-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isSelected && '✓'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Complication Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customCompNote}
                  onChange={(e) => setCustomCompNote(e.target.value)}
                  placeholder="Other adverse event specify..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomComplication();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomComplication}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Add Custom
                </button>
              </div>

              {/* Immediate Management actions for selected complications */}
              {complications.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    Immediate Intraoperative Management Actions:
                  </div>
                  {complications.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-rose-700 w-44 shrink-0 truncate">
                        {c.type}:
                      </span>
                      <input
                        type="text"
                        value={c.management}
                        onChange={(e) => {
                          const updated = [...complications];
                          updated[idx].management = e.target.value;
                          setComplications(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        placeholder="Management actions..."
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveComplication(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POP-OUT MODAL: OPERATED EYE SELECTION */}
      {/* ============================================================ */}
      {activeModal === 'eye' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeIcon className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Select Operated Eye</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {(['OD', 'OS', 'OU'] as Eye[]).map((eyeOption) => {
                const isSelected = operatedEye === eyeOption;
                return (
                  <button
                    key={eyeOption}
                    type="button"
                    onClick={() => {
                      setOperatedEye(eyeOption);
                      setActiveModal(null);
                    }}
                    className={`w-full py-3.5 px-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-base font-black tracking-wider">{eyeOption}</span>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
