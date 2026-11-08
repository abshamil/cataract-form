import { CataractRecord, MonthlyAuditStats, LensExtraction, AnesthesiaType } from '../types/surgery';

export const STANDARD_COMPLICATIONS = [
  { id: 'pc_tear_no_vit', label: 'PC tear (no vitreous loss)', category: 'Capsular' as const, severity: 'Moderate' as const, defaultManagement: 'Sulcus IOL / Viscoat barrier' },
  { id: 'pc_tear_with_vit', label: 'PC tear with vitreous loss', category: 'Capsular' as const, severity: 'Severe' as const, defaultManagement: 'Anterior vitrectomy + Sulcus IOL' },
  { id: 'zonular_dialysis', label: 'Zonular dialysis / dehiscence', category: 'Capsular' as const, severity: 'Moderate' as const, defaultManagement: 'Capsular Tension Ring (CTR) inserted' },
  { id: 'unplanned_aphakia', label: 'Unplanned Aphakia (no IOL)', category: 'Capsular' as const, severity: 'Severe' as const, defaultManagement: 'Deferred secondary IOL' },
  { id: 'iridodialysis', label: 'Iridodialysis / Iris trauma', category: 'Iris / Uveal' as const, severity: 'Moderate' as const, defaultManagement: 'McCannel suture / Iris repair' },
  { id: 'iris_prolapse', label: 'Iris prolapse / IFIS', category: 'Iris / Uveal' as const, severity: 'Mild' as const, defaultManagement: 'Iris retractors / Intracameral phenylephrine' },
  { id: 'dropped_nucleus', label: 'Dropped nucleus into vitreous', category: 'Posterior Segment' as const, severity: 'Severe' as const, defaultManagement: 'Referred to retina / Pars plana vitrectomy' },
  { id: 'radial_capsular_tear', label: 'Anterior capsule radial tear', category: 'Capsular' as const, severity: 'Mild' as const, defaultManagement: 'Low vacuum, converted rhexis vector' },
  { id: 'descemet_detachment', label: "Descemet's membrane detachment", category: 'Corneal' as const, severity: 'Moderate' as const, defaultManagement: 'Air bubble tamponade in AC' },
  { id: 'corneal_burn', label: 'Corneal thermal wound burn', category: 'Corneal' as const, severity: 'Moderate' as const, defaultManagement: 'Stromal hydration + Tight nylon suture' },
  { id: 'hyphema', label: 'Hyphema / AC hemorrhage', category: 'Iris / Uveal' as const, severity: 'Mild' as const, defaultManagement: 'OVD tamponade, BSS irrigation' },
  { id: 'suprachoroidal_hem', label: 'Suprachoroidal hemorrhage', category: 'Posterior Segment' as const, severity: 'Severe' as const, defaultManagement: 'Immediate wound closure + IV mannitol' },
  { id: 'iol_damage_malposition', label: 'IOL damage / Decentration / Wrong power', category: 'IOL Related' as const, severity: 'Moderate' as const, defaultManagement: 'IOL explanted and exchanged' },
  { id: 'converted_procedure', label: 'Converted to ECCE / SICS', category: 'Systemic / Other' as const, severity: 'Moderate' as const, defaultManagement: 'Incision enlarged, manual nucleus delivery' },
];

export const BENCHMARKS = {
  PCR_MAX_TARGET: 2.0, // EUREQUO / RCOphth Posterior Capsule Rupture target < 2.0%
  VITRECTOMY_MAX_TARGET: 1.8, // Anterior Vitrectomy rate < 1.8%
  COMPLICATION_OVERALL_TARGET: 4.5, // Overall complication target < 4.5%
};

/**
 * Extracts month key 'YYYY-MM' from date string 'YYYY-MM-DD'
 */
export function getMonthKey(dateStr: string): string {
  if (!dateStr || dateStr.length < 7) return new Date().toISOString().slice(0, 7);
  return dateStr.slice(0, 7);
}

/**
 * Returns human readable month label, e.g. "November 2026"
 */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get sorted list of all unique month keys from records
 */
export function getUniqueMonths(records: CataractRecord[]): string[] {
  const set = new Set<string>();
  records.forEach((r) => set.add(getMonthKey(r.date)));
  return Array.from(set).sort().reverse();
}

/**
 * Computes monthly clinical audit statistics for a given month or all records
 */
export function computeMonthlyAuditStats(
  records: CataractRecord[],
  selectedMonthKey?: string
): MonthlyAuditStats {
  const filtered = selectedMonthKey && selectedMonthKey !== 'ALL'
    ? records.filter((r) => getMonthKey(r.date) === selectedMonthKey)
    : records;

  const totalCases = filtered.length;
  if (totalCases === 0) {
    const defaultKey = selectedMonthKey && selectedMonthKey !== 'ALL' 
      ? selectedMonthKey 
      : new Date().toISOString().slice(0, 7);
    return {
      monthKey: defaultKey,
      monthLabel: formatMonthLabel(defaultKey),
      totalCases: 0,
      uncomplicatedCases: 0,
      complicatedCases: 0,
      complicationRate: 0,
      benchmarkPCRate: BENCHMARKS.PCR_MAX_TARGET,
      pcTearCount: 0,
      pcTearRate: 0,
      vitrectomyCount: 0,
      vitrectomyRate: 0,
      aphakiaCount: 0,
      iridodialysisCount: 0,
      droppedNucleusCount: 0,
      zonularDialysisCount: 0,
      convertedCount: 0,
      byTechnique: [],
      bySurgeon: [],
      byAnesthesia: [],
      complicationTypeCounts: [],
      avgDurationMinutes: 0,
      operatedEyeCounts: { OD: 0, OS: 0, OU: 0 },
    };
  }

  let complicatedCases = 0;
  let pcTearCount = 0;
  let vitrectomyCount = 0;
  let aphakiaCount = 0;
  let iridodialysisCount = 0;
  let droppedNucleusCount = 0;
  let zonularDialysisCount = 0;
  let convertedCount = 0;
  let totalDuration = 0;

  const eyeCounts = { OD: 0, OS: 0, OU: 0 };
  const compTypeMap: Record<string, number> = {};
  const techniqueMap: Record<LensExtraction, { total: number; complicated: number }> = {
    Phaco: { total: 0, complicated: 0 },
    SICS: { total: 0, complicated: 0 },
    ECCE: { total: 0, complicated: 0 },
    ICCE: { total: 0, complicated: 0 },
    FLACS: { total: 0, complicated: 0 },
  };
  const surgeonMap: Record<
    string,
    { total: number; complicated: number; pcTear: number; vitrectomy: number }
  > = {};
  const anesthesiaMap: Record<AnesthesiaType, { total: number; complicated: number }> = {
    Topical: { total: 0, complicated: 0 },
    Peribulbar: { total: 0, complicated: 0 },
    RBA: { total: 0, complicated: 0 },
    STA: { total: 0, complicated: 0 },
    GA: { total: 0, complicated: 0 },
    'Intracameral / Local + Sedation': { total: 0, complicated: 0 },
    Other: { total: 0, complicated: 0 },
  };

  filtered.forEach((r) => {
    totalDuration += r.durationMinutes || 0;
    if (r.operatedEye) eyeCounts[r.operatedEye] = (eyeCounts[r.operatedEye] || 0) + 1;

    // Technique tracking
    if (techniqueMap[r.lensExtraction]) {
      techniqueMap[r.lensExtraction].total += 1;
    }

    // Anesthesia tracking
    if (anesthesiaMap[r.anesthesiaType]) {
      anesthesiaMap[r.anesthesiaType].total += 1;
    }

    // Surgeon tracking
    const sName = r.surgeon.trim() || 'Unassigned';
    if (!surgeonMap[sName]) {
      surgeonMap[sName] = { total: 0, complicated: 0, pcTear: 0, vitrectomy: 0 };
    }
    surgeonMap[sName].total += 1;

    // Vitrectomy procedure tracking
    const hadVitrectomy = r.vitrectomy === 'Automated' || r.vitrectomy === 'Manual';
    if (hadVitrectomy) {
      vitrectomyCount += 1;
      surgeonMap[sName].vitrectomy += 1;
    }

    if (r.conversionNeeded) {
      convertedCount += 1;
    }

    if (r.iolPlacement === 'Aphakia' || r.iolType === 'None (Aphakic)') {
      aphakiaCount += 1;
    }

    // Complications
    const hasComp = r.hasComplication || (r.complications && r.complications.length > 0) || hadVitrectomy || r.conversionNeeded;
    if (hasComp) {
      complicatedCases += 1;
      if (techniqueMap[r.lensExtraction]) techniqueMap[r.lensExtraction].complicated += 1;
      if (anesthesiaMap[r.anesthesiaType]) anesthesiaMap[r.anesthesiaType].complicated += 1;
      surgeonMap[sName].complicated += 1;

      // Check specific complications
      r.complications.forEach((c) => {
        const type = c.type;
        compTypeMap[type] = (compTypeMap[type] || 0) + 1;

        const lower = type.toLowerCase();
        if (lower.includes('pc tear') || lower.includes('posterior capsule') || lower.includes('pcr')) {
          pcTearCount += 1;
          surgeonMap[sName].pcTear += 1;
        }
        if (lower.includes('iridodialysis')) iridodialysisCount += 1;
        if (lower.includes('dropped nucleus')) droppedNucleusCount += 1;
        if (lower.includes('zonul')) zonularDialysisCount += 1;
      });
    }
  });

  const uncomplicatedCases = totalCases - complicatedCases;
  const complicationRate = Number(((complicatedCases / totalCases) * 100).toFixed(1));
  const pcTearRate = Number(((pcTearCount / totalCases) * 100).toFixed(1));
  const vitrectomyRate = Number(((vitrectomyCount / totalCases) * 100).toFixed(1));
  const avgDurationMinutes = Math.round(totalDuration / totalCases);

  const byTechnique = (Object.keys(techniqueMap) as LensExtraction[])
    .filter((k) => techniqueMap[k].total > 0)
    .map((k) => ({
      technique: k,
      total: techniqueMap[k].total,
      complicated: techniqueMap[k].complicated,
      complicationRate: Number(((techniqueMap[k].complicated / techniqueMap[k].total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.total - a.total);

  const bySurgeon = Object.entries(surgeonMap)
    .map(([surgeon, data]) => ({
      surgeon,
      total: data.total,
      complicated: data.complicated,
      complicationRate: Number(((data.complicated / data.total) * 100).toFixed(1)),
      pcTearCount: data.pcTear,
      vitrectomyCount: data.vitrectomy,
    }))
    .sort((a, b) => b.total - a.total);

  const byAnesthesia = (Object.keys(anesthesiaMap) as AnesthesiaType[])
    .filter((k) => anesthesiaMap[k].total > 0)
    .map((k) => ({
      type: k,
      total: anesthesiaMap[k].total,
      complicated: anesthesiaMap[k].complicated,
    }));

  const complicationTypeCounts = Object.entries(compTypeMap)
    .map(([type, count]) => ({
      type,
      count,
      percentage: Number(((count / totalCases) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count);

  const currentKey = selectedMonthKey && selectedMonthKey !== 'ALL'
    ? selectedMonthKey
    : 'ALL';

  return {
    monthKey: currentKey,
    monthLabel: currentKey === 'ALL' ? 'All Months Summary' : formatMonthLabel(currentKey),
    totalCases,
    uncomplicatedCases,
    complicatedCases,
    complicationRate,
    benchmarkPCRate: BENCHMARKS.PCR_MAX_TARGET,
    pcTearCount,
    pcTearRate,
    vitrectomyCount,
    vitrectomyRate,
    aphakiaCount,
    iridodialysisCount,
    droppedNucleusCount,
    zonularDialysisCount,
    convertedCount,
    byTechnique,
    bySurgeon,
    byAnesthesia,
    complicationTypeCounts,
    avgDurationMinutes,
    operatedEyeCounts: eyeCounts,
  };
}

/**
 * Search records by MRN query string (case-insensitive substring match)
 */
export function filterRecordsByMRN(records: CataractRecord[], query: string): CataractRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return records;
  return records.filter((r) => r.mrn.toLowerCase().includes(q));
}

/**
 * Returns latest records sorted by date/time descending
 */
export function getRecentRecords(records: CataractRecord[], limit = 10): CataractRecord[] {
  return [...records]
    .sort((a, b) => new Date(b.date + (b.time ? 'T' + b.time : '')).getTime() - new Date(a.date + (a.time ? 'T' + a.time : '')).getTime())
    .slice(0, limit);
}

