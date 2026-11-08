import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CataractRecord, MonthlyAuditStats } from '../types/surgery';

export interface HospitalConfig {
  hospitalName: string;
  departmentName: string;
  unitName?: string;
  auditorName?: string;
}

export const DEFAULT_HOSPITAL_CONFIG: HospitalConfig = {
  hospitalName: "St. Paul's Hospital Millennium Medical College",
  departmentName: 'Department of Ophthalmology',
  unitName: 'Cataract & Anterior Segment Surgical Unit',
  auditorName: 'Clinical Audit & Quality Lead',
};

/**
 * Generates and downloads a clinical Monthly Complications & Quality Audit Report PDF
 */
export function generateMonthlyReportPDF(
  stats: MonthlyAuditStats,
  records: CataractRecord[],
  config: HospitalConfig = DEFAULT_HOSPITAL_CONFIG
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header banner
  doc.setFillColor(15, 60, 110); // Deep medical navy
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(config.hospitalName.toUpperCase(), margin, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`${config.departmentName} — ${config.unitName || ''}`, margin, 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`CATARACT INTRAOPERATIVE COMPLICATIONS AUDIT: ${stats.monthLabel.toUpperCase()}`, margin, 23);

  // Metadata block
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const printDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${printDate} | Intraoperative Complications & Quality Audit`, margin, 34);

  // Executive KPI summary cards (4 boxes across)
  const boxWidth = (pageWidth - margin * 2 - 9) / 4;
  const startY = 38;
  const boxHeight = 22;

  const kpis = [
    {
      title: 'TOTAL SURGERIES',
      value: `${stats.totalCases}`,
      sub: `${stats.uncomplicatedCases} uncomplicated`,
      color: [240, 245, 250],
      textColor: [15, 60, 110],
    },
    {
      title: 'COMPLICATION RATE',
      value: `${stats.complicationRate}%`,
      sub: `${stats.complicatedCases} cases (Target <4.5%)`,
      color: stats.complicationRate <= 4.5 ? [240, 253, 244] : [254, 242, 242],
      textColor: stats.complicationRate <= 4.5 ? [22, 101, 52] : [153, 27, 27],
    },
    {
      title: 'PC TEAR / RUPTURE',
      value: `${stats.pcTearRate}%`,
      sub: `${stats.pcTearCount} cases (Target <2.0%)`,
      color: stats.pcTearRate <= 2.0 ? [240, 253, 244] : [254, 242, 242],
      textColor: stats.pcTearRate <= 2.0 ? [22, 101, 52] : [185, 28, 28],
    },
    {
      title: 'VITRECTOMY RATE',
      value: `${stats.vitrectomyRate}%`,
      sub: `${stats.vitrectomyCount} cases (Target <1.8%)`,
      color: stats.vitrectomyRate <= 1.8 ? [240, 253, 244] : [255, 247, 237],
      textColor: stats.vitrectomyRate <= 1.8 ? [22, 101, 52] : [194, 65, 12],
    },
  ];

  kpis.forEach((kpi, i) => {
    const x = margin + i * (boxWidth + 3);
    doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.roundedRect(x, startY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setDrawColor(220, 225, 230);
    doc.roundedRect(x, startY, boxWidth, boxHeight, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(90, 100, 115);
    doc.text(kpi.title, x + 3, startY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(kpi.textColor[0], kpi.textColor[1], kpi.textColor[2]);
    doc.text(kpi.value, x + 3, startY + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(110, 115, 125);
    doc.text(kpi.sub, x + 3, startY + 18.5);
  });

  let currentY = startY + boxHeight + 6;

  // Table 1: Complications Distribution Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 60, 110);
  doc.text('1. INTRAOPERATIVE COMPLICATIONS INCIDENCE', margin, currentY);
  currentY += 2;

  const compTableData = stats.complicationTypeCounts.length > 0
    ? stats.complicationTypeCounts.map((c) => [
        c.type,
        c.count.toString(),
        `${c.percentage}%`,
        c.type.toLowerCase().includes('pc tear')
          ? c.percentage <= 2.0 ? 'Compliant (<2%)' : 'Exceeds Benchmark'
          : 'Monitored',
      ])
    : [['No intraoperative complications recorded in this period', '0', '0.0%', 'Optimal']];

  autoTable(doc, {
    startY: currentY,
    head: [['Complication Type', 'Count', '% of Surgeries', 'Clinical Audit Status']],
    body: compTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 75, 130],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [40, 40, 40],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 42, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Table 2: Surgical Technique Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 60, 110);
  doc.text('2. SURGICAL TECHNIQUE SAFETY COMPARISON', margin, currentY);
  currentY += 2;

  const techRows = stats.byTechnique.map((t) => [
    t.technique,
    t.total.toString(),
    (t.total - t.complicated).toString(),
    t.complicated.toString(),
    `${t.complicationRate}%`,
    t.complicationRate <= 5.0 ? 'Acceptable' : 'Review Indicated',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Extraction Technique', 'Total Cases', 'Uncomplicated', 'Complications', 'Rate (%)', 'Safety Target']],
    body: techRows.length > 0 ? techRows : [['No data', '0', '0', '0', '0%', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 75, 130],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [40, 40, 40],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 28, halign: 'center' },
      4: { cellWidth: 28, halign: 'center' },
      5: { cellWidth: 33, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  // Page 2: Detailed Complicated Cases Registry
  const complicatedRecords = records.filter(
    (r) => r.hasComplication || r.complications?.length > 0 || r.vitrectomy !== 'None' || r.conversionNeeded
  );

  doc.addPage();
  // Header on Page 2
  doc.setFillColor(15, 60, 110);
  doc.rect(0, 0, pageWidth, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`${config.hospitalName} — ${stats.monthLabel} Complications Registry`, margin, 10);

  currentY = 22;
  doc.setTextColor(15, 60, 110);
  doc.setFontSize(10);
  doc.text('3. CASE-BY-CASE COMPLICATIONS & MANAGEMENT REGISTER', margin, currentY);
  currentY += 3;

  const caseRows = complicatedRecords.map((r) => {
    const compText = r.complications.map((c) => c.type).join('; ') || (r.vitrectomy !== 'None' ? `Vitrectomy (${r.vitrectomy})` : 'Complication noted');
    const mgmtText = r.complications.map((c) => c.management).filter(Boolean).join('; ') || (r.conversionNeeded ? `Converted (${r.conversionDetails || 'Manual delivery'})` : 'Standard intraop management');
    return [
      r.date,
      r.mrn,
      `${r.age}y / ${r.sex.charAt(0)}`,
      r.operatedEye,
      r.surgeon,
      r.lensExtraction,
      compText,
      mgmtText,
      r.iolPlacement,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'MRN', 'Age/Sex', 'Eye', 'Surgeon', 'Technique', 'Complication(s)', 'Immediate Management', 'IOL']],
    body: caseRows.length > 0 ? caseRows : [['-', '-', 'No complicated cases logged in this period', '-', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 75, 130],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2,
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      textColor: [40, 40, 40],
    },
    columnStyles: {
      0: { cellWidth: 16 },
      1: { cellWidth: 16 },
      2: { cellWidth: 26 },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 22 },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 32 },
      7: { cellWidth: 32 },
      8: { cellWidth: 12, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  // Audit Sign-off box
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = 25;
  }

  doc.setDrawColor(180, 190, 205);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 26, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 50, 80);
  doc.text('CLINICAL GOVERNANCE & AUDIT VERIFICATION', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 90, 100);
  doc.text('Prepared by: ____________________________________', margin + 4, currentY + 14);
  doc.text('Signature: __________________________  Date: ____________', margin + 4, currentY + 21);

  doc.text('Department Chair / Reviewer: ______________________________', margin + 95, currentY + 14);
  doc.text('Signature: __________________________  Date: ____________', margin + 95, currentY + 21);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 145, 150);
    doc.text(
      `CataractOR Quality Audit System | ${config.hospitalName} | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Save PDF
  const safeMonth = stats.monthKey.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Cataract_Audit_Report_${safeMonth}.pdf`);
}

/**
 * Generates and downloads a single Operative Record PDF
 * matching the user's St. Paul's Hospital Operative Record Form structure
 */
export function generateOperativeRecordPDF(
  record: CataractRecord,
  config: HospitalConfig = DEFAULT_HOSPITAL_CONFIG
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Box
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(margin, 12, pageWidth - margin * 2, 24);

  // Logo / Emblem placeholder area
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 60, 110);
  doc.text('ቅዱስ ጳውሎስ ሆስፒታል', margin + 4, 18);
  doc.setFontSize(7.5);
  doc.setTextColor(60, 70, 80);
  doc.text("St. Paul's Hospital Millennium Medical College", margin + 4, 23);
  doc.text('Department of Ophthalmology', margin + 4, 27);

  // Right Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text("St. Paul's Hospital Millennium Medical College", margin + 70, 18);
  doc.setFontSize(11);
  doc.text('Department of Ophthalmology', margin + 70, 24);
  doc.setFontSize(12);
  doc.text('Cataract Surgery Operative Record Form', margin + 70, 31);

  let y = 40;

  // Row 1: Date, MRN, Age & Sex, Diagnosis, Surgeon, Assistant
  // Type of Anesthesia, Anesthesia Complication
  const colWidth = (pageWidth - margin * 2) / 2;

  // Outer border for Patient / Surgeon details
  doc.rect(margin, y, pageWidth - margin * 2, 38);
  doc.line(margin + colWidth, y, margin + colWidth, y + 38);

  // Left Column
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date: ${record.date || '____/____/________'}`, margin + 3, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(`MRN: ${record.mrn || '_________________'}`, margin + 50, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Age: ${record.age || '__'} yrs   Sex: ${record.sex}`, margin + 3, y + 13);
  doc.text(`Diagnosis: ${record.diagnosis || 'Cataract'}`, margin + 50, y + 13);
  doc.text(`Surgeon: ${record.surgeon || '________________'}`, margin + 3, y + 21);
  doc.text(`Assistant: ${record.assistant || '________________'}`, margin + 50, y + 21);

  // OPERATED EYE banner
  doc.setFillColor(240, 240, 240);
  doc.rect(margin + 2, y + 29, colWidth - 4, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(record.operatedEye === 'OD' ? 180 : 0, record.operatedEye === 'OS' ? 180 : 0, 30);
  doc.text(`OPERATED EYE:   [ ${record.operatedEye} ]   ${record.operatedEye === 'OD' ? 'RIGHT EYE' : record.operatedEye === 'OS' ? 'LEFT EYE' : 'BILATERAL'}`, margin + 5, y + 34);

  // Right Column (Anesthesia)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text('Type of Anesthesia:', margin + colWidth + 3, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${record.anesthesiaType}`, margin + colWidth + 35, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Anesthesia Complication:', margin + colWidth + 3, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${record.anesthesiaComplication}`, margin + colWidth + 40, y + 14);
  if (record.anesthesiaNotes) {
    doc.text(`Note: ${record.anesthesiaNotes}`, margin + colWidth + 3, y + 20);
  }

  y += 42;

  // Grid Section 2: Surgical Procedure Steps (Left) vs Supplies Used (Right)
  const gridHeight = 110;
  doc.rect(margin, y, pageWidth - margin * 2, gridHeight);
  doc.line(margin + colWidth, y, margin + colWidth, y + gridHeight);

  // Left side: Procedural Parameters
  let py = y + 7;
  const printCheck = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${label}:`, margin + 3, py);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 34, py);
    py += 8.2;
  };

  printCheck('Topical Povidone', record.topicalPovidone ? 'Yes (5% instilled)' : 'No');
  printCheck('Traction Suture', record.tractionSuture ? 'Yes (Bridle placed)' : 'No');
  printCheck('Peritomy', record.peritomy);
  printCheck('AC Entry', record.acEntry);
  printCheck('Capsulotomy', record.capsulotomy);
  printCheck('Lens Extraction', record.lensExtraction);
  printCheck('IOL Placement', record.iolPlacement);
  printCheck('IOL Power / Type', `${record.iolPower ? `+${record.iolPower} D` : 'None'}  [${record.iolType}] ${record.iolModel ? `(${record.iolModel})` : ''}`);
  printCheck('Iridectomy', record.iridectomy);
  printCheck('Vitrectomy', record.vitrectomy);

  // Right side: Supplies & Medications
  let ry = y + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Supplies Used & Medications', margin + colWidth + 3, ry);
  ry += 7;

  const printSupply = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${label}:`, margin + colWidth + 3, ry);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + colWidth + 38, ry);
    ry += 8.2;
  };

  printSupply('Irrigating Solution', record.irrigatingSolution);
  printSupply('AC Maintainer', record.acMaintainer);
  printSupply('Intracameral Meds', record.intracameralMeds.length > 0 ? record.intracameralMeds.join(', ') : 'None');
  printSupply('Subconj Injection', record.subconjInj);
  printSupply('Suture', record.suture);
  const sutureTypeStr = (record.sutureTypes && record.sutureTypes.length > 0 ? record.sutureTypes.join(', ') : record.sutureType) || 'None';
  printSupply('Suture Type', sutureTypeStr);

  y += gridHeight + 4;

  // Grid Section 3: Intra-operative Complications (Left) vs Post-op (Right)
  const bottomHeight = 65;
  doc.rect(margin, y, pageWidth - margin * 2, bottomHeight);
  doc.line(margin + colWidth, y, margin + colWidth, y + bottomHeight);

  // Complications Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(record.hasComplication ? 180 : 0, 0, 0);
  doc.text('Intra-operative Complications:', margin + 3, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  if (record.hasComplication && record.complications.length > 0) {
    let cy = y + 12;
    record.complications.forEach((c) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${c.type} (${c.severity})`, margin + 3, cy);
      cy += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`  Mgmt: ${c.management}`, margin + 3, cy);
      cy += 5;
    });
    if (record.conversionNeeded) {
      doc.setFont('helvetica', 'bold');
      doc.text(`• Converted: ${record.conversionDetails || 'Yes'}`, margin + 3, cy);
    }
  } else {
    doc.text('None (Uncomplicated procedure completed successfully)', margin + 3, y + 13);
  }

  // Post-Op Medications & Duration (Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Post-Op Medications and Instructions:', margin + colWidth + 3, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(record.postOpMedications || 'Moxifloxacin 0.5% qid, Prednisolone 1% q2h', margin + colWidth + 3, y + 12);
  doc.text(`Instructions: ${record.postOpInstructions || 'Protective eye shield, avoid water/rubbing'}`, margin + colWidth + 3, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Duration of surgery:  ${record.durationMinutes} minutes`, margin + colWidth + 3, y + 32);

  // Signature line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text("Surgeon's Signature: ____________________________", margin + colWidth + 3, y + 48);
  doc.text(`Date & Time: ${record.date}  ${record.time || ''}`, margin + colWidth + 3, y + 55);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `St. Paul's Hospital Millennium Medical College — Cataract Operative Record | MRN: ${record.mrn}`,
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  doc.save(`Operative_Record_${record.mrn || 'Cataract'}_${record.date}.pdf`);
}

/**
 * Generates automated CSV data export for spreadsheet or statistical audit
 */
export function exportRecordsToCSV(records: CataractRecord[]): void {
  const headers = [
    'Date',
    'MRN',
    'Age',
    'Sex',
    'Diagnosis',
    'Operated Eye',
    'Surgeon',
    'Assistant',
    'Anesthesia',
    'Anesthesia Complication',
    'Topical Povidone',
    'Traction Suture',
    'Peritomy',
    'AC Entry',
    'Capsulotomy',
    'Lens Extraction',
    'IOL Placement',
    'IOL Power (D)',
    'IOL Type',
    'IOL Model',
    'Iridectomy',
    'Vitrectomy',
    'Irrigating Solution',
    'AC Maintainer',
    'Intracameral Meds',
    'Subconj Inj',
    'Suture',
    'Suture Types',
    'Complication Present',
    'Complications List',
    'Immediate Management',
    'Converted',
    'Duration (min)',
  ];

  const rows = records.map((r) => [
    r.date,
    `"${r.mrn}"`,
    r.age,
    r.sex,
    `"${r.diagnosis.replace(/"/g, '""')}"`,
    r.operatedEye,
    `"${r.surgeon.replace(/"/g, '""')}"`,
    `"${r.assistant.replace(/"/g, '""')}"`,
    r.anesthesiaType,
    r.anesthesiaComplication,
    r.topicalPovidone ? 'Yes' : 'No',
    r.tractionSuture ? 'Yes' : 'No',
    r.peritomy,
    r.acEntry,
    r.capsulotomy,
    r.lensExtraction,
    r.iolPlacement,
    r.iolPower !== null ? r.iolPower : '',
    r.iolType,
    `"${(r.iolModel || '').replace(/"/g, '""')}"`,
    r.iridectomy,
    r.vitrectomy,
    r.irrigatingSolution,
    r.acMaintainer,
    `"${r.intracameralMeds.join(', ')}"`,
    `"${r.subconjInj}"`,
    r.suture,
    `"${(r.sutureTypes && r.sutureTypes.length > 0 ? r.sutureTypes.join(', ') : r.sutureType) || 'None'}"`,
    r.hasComplication ? 'YES' : 'NO',
    `"${r.complications.map((c) => c.type).join('; ')}"`,
    `"${r.complications.map((c) => c.management).join('; ')}"`,
    r.conversionNeeded ? 'YES' : 'NO',
    r.durationMinutes,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Cataract_Audit_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
