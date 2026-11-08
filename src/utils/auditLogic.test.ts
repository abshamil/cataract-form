import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeMonthlyAuditStats,
  getMonthKey,
  formatMonthLabel,
  filterRecordsByMRN,
  getRecentRecords,
  BENCHMARKS,
} from './auditLogic';
import { CataractRecord } from '../types/surgery';

const mockRecords: CataractRecord[] = [
  {
    id: 'rec-1',
    date: '2026-11-02',
    time: '08:30',
    mrn: 'SP-1001',
    age: 65,
    sex: 'Male',
    diagnosis: 'Senile Mature Cataract',
    operatedEye: 'OD',
    surgeon: 'Dr. Alula Haile',
    assistant: 'Dr. Helen',
    anesthesiaType: 'Peribulbar',
    anesthesiaComplication: 'None',
    topicalPovidone: true,
    tractionSuture: true,
    peritomy: 'Superior',
    acEntry: 'Sclero-corneal',
    capsulotomy: 'CCC',
    lensExtraction: 'SICS',
    iolPlacement: 'PC',
    iolPower: 21.5,
    iolType: 'Rigid',
    iridectomy: 'None',
    vitrectomy: 'None',
    irrigatingSolution: 'RL',
    acMaintainer: 'HPMC',
    intracameralMeds: ['Trypan Blue', 'Moxifloxacin'],
    subconjInj: 'gentamycin + dexa',
    suture: 'None',
    sutureTypes: [],
    hasComplication: false,
    complications: [],
    conversionNeeded: false,
    postOpMedications: 'Prednisolone 1% q2h, Moxifloxacin 0.5% qid',
    postOpInstructions: 'Eye shield overnight',
    durationMinutes: 18,
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-02T10:00:00Z',
  },
  {
    id: 'rec-2',
    date: '2026-11-04',
    time: '09:15',
    mrn: 'SP-1002',
    age: 72,
    sex: 'Female',
    diagnosis: 'Hypermature Morgagnian Cataract',
    operatedEye: 'OS',
    surgeon: 'Dr. Alula Haile',
    assistant: 'Dr. Michael',
    anesthesiaType: 'Peribulbar',
    anesthesiaComplication: 'None',
    topicalPovidone: true,
    tractionSuture: false,
    peritomy: 'None',
    acEntry: 'Corneal',
    capsulotomy: 'CCC',
    lensExtraction: 'Phaco',
    iolPlacement: 'Sulcus',
    iolPower: 20.0,
    iolType: 'Foldable',
    iridectomy: 'PI',
    vitrectomy: 'Automated',
    irrigatingSolution: 'BSS',
    acMaintainer: 'HPMC',
    intracameralMeds: ['Trypan Blue', 'Adrenaline', 'Moxifloxacin'],
    subconjInj: 'dexa only',
    suture: 'Interrupted',
    sutureTypes: ['Nylon 10/0'],
    hasComplication: true,
    complications: [
      {
        type: 'PC tear with vitreous loss',
        category: 'Capsular',
        severity: 'Severe',
        management: 'Anterior automated vitrectomy, Sulcus 3-piece IOL placed',
      },
    ],
    conversionNeeded: false,
    postOpMedications: 'Prednisolone 1%, Moxifloxacin, Timolol 0.5%',
    postOpInstructions: 'Strict IOP check at 4 hours',
    durationMinutes: 35,
    createdAt: '2026-11-04T11:00:00Z',
    updatedAt: '2026-11-04T11:00:00Z',
  },
  {
    id: 'rec-3',
    date: '2026-10-15',
    time: '10:00',
    mrn: 'SP-0950',
    age: 58,
    sex: 'Male',
    diagnosis: 'Posterior Subcapsular Cataract',
    operatedEye: 'OD',
    surgeon: 'Dr. Senait Bekele',
    assistant: 'Dr. Helen',
    anesthesiaType: 'Topical',
    anesthesiaComplication: 'None',
    topicalPovidone: true,
    tractionSuture: false,
    peritomy: 'None',
    acEntry: 'Corneal',
    capsulotomy: 'CCC',
    lensExtraction: 'Phaco',
    iolPlacement: 'PC',
    iolPower: 22.0,
    iolType: 'Foldable',
    iridectomy: 'None',
    vitrectomy: 'None',
    irrigatingSolution: 'BSS',
    acMaintainer: 'BSS',
    intracameralMeds: ['Moxifloxacin', 'Miochol'],
    subconjInj: 'None',
    suture: 'None',
    sutureTypes: [],
    hasComplication: false,
    complications: [],
    conversionNeeded: false,
    postOpMedications: 'Moxifloxacin qid',
    postOpInstructions: 'Standard post-op',
    durationMinutes: 14,
    createdAt: '2026-10-15T09:30:00Z',
    updatedAt: '2026-10-15T09:30:00Z',
  },
];

test('computeMonthlyAuditStats filters by month correctly and calculates rates', () => {
  const statsNov = computeMonthlyAuditStats(mockRecords, '2026-11');
  assert.equal(statsNov.totalCases, 2);
  assert.equal(statsNov.uncomplicatedCases, 1);
  assert.equal(statsNov.complicatedCases, 1);
  assert.equal(statsNov.complicationRate, 50.0);
  assert.equal(statsNov.pcTearCount, 1);
  assert.equal(statsNov.pcTearRate, 50.0);
  assert.equal(statsNov.vitrectomyCount, 1);
  assert.equal(statsNov.vitrectomyRate, 50.0);
});

test('computeMonthlyAuditStats aggregates all records when ALL is passed', () => {
  const statsAll = computeMonthlyAuditStats(mockRecords, 'ALL');
  assert.equal(statsAll.totalCases, 3);
  assert.equal(statsAll.uncomplicatedCases, 2);
  assert.equal(statsAll.complicatedCases, 1);
  assert.equal(statsAll.complicationRate, 33.3);
  assert.equal(statsAll.bySurgeon.length, 2);
});

test('filterRecordsByMRN matches MRN regardless of casing', () => {
  const match1 = filterRecordsByMRN(mockRecords, 'sp-1002');
  assert.equal(match1.length, 1);
  assert.equal(match1[0].mrn, 'SP-1002');

  const matchAllSP = filterRecordsByMRN(mockRecords, 'SP-');
  assert.equal(matchAllSP.length, 3);

  const matchNone = filterRecordsByMRN(mockRecords, 'NONEXISTENT');
  assert.equal(matchNone.length, 0);
});

test('getRecentRecords returns sorted descending list', () => {
  const recent = getRecentRecords(mockRecords, 2);
  assert.equal(recent.length, 2);
  assert.equal(recent[0].mrn, 'SP-1002'); // Nov 4
  assert.equal(recent[1].mrn, 'SP-1001'); // Nov 2
});
