export type Eye = 'OD' | 'OS' | 'OU';

export type AnesthesiaType =
  | 'Topical'
  | 'Peribulbar'
  | 'RBA' // Retrobulbar
  | 'STA' // Sub-Tenon's
  | 'GA'  // General Anesthesia
  | 'Other';

export type AnesthesiaComplication =
  | 'None'
  | 'RB hemorrhage'
  | 'Globe perforation'
  | 'Brain stem anesthesia'
  | 'Others (specify)';

export type Peritomy = 'Superior' | 'Temporal' | 'Superotemporal' | 'None';

export type ACEntry = 'Limbal' | 'Corneal' | 'Sclero-corneal';

export type Capsulotomy = 'CCC' | 'Can-opener';

export type LensExtraction = 'Phaco' | 'SICS' | 'ECCE' | 'ICCE';

export type IOLPlacement =
  | 'PC'       // Posterior Chamber (in-the-bag)
  | 'Sulcus'   // Ciliary sulcus
  | 'AC'       // Anterior chamber
  | 'Iris claw' // Artisan / retro-pupillary
  | 'Aphakia'  // No IOL
  | 'Scleral fixated / Yamane';

export type IOLType = 'Foldable' | 'Rigid' | 'None (Aphakic)';

export type Iridectomy = 'None' | 'PI' | 'Sphincterotomy';

export type Vitrectomy = 'None' | 'Automated' | 'Manual';

export type IrrigatingSolution = 'BSS' | 'RL' | 'BSS Plus';

export type ACMaintainer = 'HPMC' | 'BSS' | 'Air' | 'DisCoVisc' | 'None';

export type SutureStatus = 'None' | 'Interrupted' | 'Continuous';

export type SutureType = 'Nylon 10/0' | 'Nylon 9/0' | 'Vicryl 8/0' | 'Vicryl 6/0' | 'Silk 8/0' | 'None';

export interface ComplicationDetail {
  type: string;
  category: 'Capsular' | 'Iris / Uveal' | 'Corneal' | 'Posterior Segment' | 'IOL Related' | 'Systemic / Other';
  severity: 'Mild' | 'Moderate' | 'Severe';
  management: string;
}

export interface CataractRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  mrn: string; // Medical Record Number (primary patient identifier)
  patientName?: string; // Removed from active UI per clinical privacy request
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  diagnosis: string;
  operatedEye: Eye;
  
  // Surgical team
  surgeon: string;
  assistant: string;
  scrubNurse?: string;

  // Anesthesia
  anesthesiaType: AnesthesiaType;
  anesthesiaComplication: AnesthesiaComplication;
  anesthesiaNotes?: string;

  // Prep & Incision
  topicalPovidone: boolean; // Yes / No
  tractionSuture: boolean;  // Yes / No (Bridle)
  peritomy: Peritomy;
  acEntry: ACEntry;

  // Procedure Steps
  capsulotomy: Capsulotomy;
  lensExtraction: LensExtraction;
  iolPlacement: IOLPlacement;
  iolPower: number | null; // e.g. 21.5 D
  iolType: IOLType;
  iolModel?: string;
  iolSerial?: string;
  iridectomy: Iridectomy;
  vitrectomy: Vitrectomy;

  // Supplies & Medications
  irrigatingSolution: IrrigatingSolution;
  acMaintainer: ACMaintainer;
  intracameralMeds: string[]; // multi-select: ['Trypan Blue', 'Adrenaline', 'Miochol', 'Moxi', 'Lidocaine']
  subconjInj: string; // 'dexa only' | 'gentamycin + dexa' | 'cefazolin + dexa' | 'None' | 'Other'
  suture: SutureStatus;
  sutureType?: SutureType;
  sutureTypes: string[]; // multi-select suture types (e.g. ['Nylon 10/0', 'Vicryl 8/0'])

  // Complications
  hasComplication: boolean;
  complications: ComplicationDetail[];
  complicationsSummary?: string;
  conversionNeeded: boolean;
  conversionDetails?: string;

  // Post-Op & Stats
  postOpMedications: string;
  postOpInstructions: string;
  durationMinutes: number;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface MonthlyAuditStats {
  monthKey: string; // 'YYYY-MM'
  monthLabel: string; // 'November 2026'
  totalCases: number;
  uncomplicatedCases: number;
  complicatedCases: number;
  complicationRate: number; // percentage e.g. 4.2%
  
  // Benchmark comparison
  benchmarkPCRate: number; // e.g. 2.0% (Royal College of Ophthalmologists standard)
  pcTearCount: number;
  pcTearRate: number;
  vitrectomyCount: number;
  vitrectomyRate: number;
  aphakiaCount: number;
  iridodialysisCount: number;
  droppedNucleusCount: number;
  zonularDialysisCount: number;
  convertedCount: number;

  // By Technique
  byTechnique: {
    technique: LensExtraction;
    total: number;
    complicated: number;
    complicationRate: number;
  }[];

  // By Surgeon
  bySurgeon: {
    surgeon: string;
    total: number;
    complicated: number;
    complicationRate: number;
    pcTearCount: number;
    vitrectomyCount: number;
  }[];

  // By Anesthesia
  byAnesthesia: {
    type: AnesthesiaType;
    total: number;
    complicated: number;
  }[];

  // Complication breakdown frequency
  complicationTypeCounts: {
    type: string;
    count: number;
    percentage: number;
  }[];

  avgDurationMinutes: number;
  operatedEyeCounts: { OD: number; OS: number; OU: number };
}
