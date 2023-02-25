/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RuleActionThrottle } from '@kbn/securitysolution-io-ts-alerting-types';
import { getMockThreatData } from '../../public/detections/mitre/mitre_tactics_techniques';
import type { CompleteTimeline } from './timeline';
import { getTimeline, getIndicatorMatchTimelineTemplate } from './timeline';
import type { Connectors } from './connector';

const ccsRemoteName: string = Cypress.env('CCS_REMOTE_NAME');

interface MitreAttackTechnique {
  name: string;
  subtechniques: string[];
}

export interface Mitre {
  tactic: string;
  techniques: MitreAttackTechnique[];
}

interface SeverityOverride {
  sourceField: string;
  sourceValue: string;
}

interface Interval {
  interval: string;
  timeType: string;
  type: string;
}

export interface Actions {
  throttle: RuleActionThrottle;
  connectors: Connectors[];
}

export type RuleDataSource =
  | { type: 'indexPatterns'; index: string[] }
  | { type: 'dataView'; dataView: string };

export interface CustomRule {
  customQuery?: string;
  id?: string;
  name: string;
  description: string;
  dataSource: RuleDataSource;
  severity?: string;
  riskScore?: string;
  tags?: string[];
  timelineTemplate?: string;
  referenceUrls?: string[];
  falsePositivesExamples?: string[];
  mitre?: Mitre[];
  note?: string;
  runsEvery?: Interval;
  interval?: string;
  lookBack?: Interval;
  timeline?: CompleteTimeline;
  maxSignals?: number;
  buildingBlockType?: string;
  exceptionLists?: Array<{ id: string; list_id: string; type: string; namespace_type: string }>;
  actions?: Actions;
  enabled?: boolean;
}

export interface ThresholdRule extends CustomRule {
  thresholdField: string;
  threshold: string;
}

export interface SavedQueryRule extends CustomRule {
  savedId: string;
}

export interface OverrideRule extends CustomRule {
  severityOverride: SeverityOverride[];
  riskOverride: string;
  nameOverride: string;
  timestampOverride: string;
}

export interface ThreatIndicatorRule extends CustomRule {
  indicatorIndexPattern: string[];
  indicatorMappingField: string;
  indicatorIndexField: string;
  threatIndicatorPath: string;
  type?: string;
  atomic?: string;
  matchedType?: string;
  matchedId?: string;
  matchedIndex?: string;
}

export interface NewTermsRule extends CustomRule {
  newTermsFields: string[];
  historyWindowSize: Interval;
}

export interface MachineLearningRule {
  machineLearningJobs: string[];
  anomalyScoreThreshold: number;
  id?: string;
  name: string;
  description: string;
  severity: string;
  riskScore: string;
  tags: string[];
  timelineTemplate?: string;
  referenceUrls: string[];
  falsePositivesExamples: string[];
  mitre: Mitre[];
  note: string;
  runsEvery: Interval;
  lookBack: Interval;
  interval?: string;
}

export const getIndexPatterns = (): string[] => [
  'apm-*-transaction*',
  'auditbeat-*',
  'endgame-*',
  'filebeat-*',
  'logs-*',
  'packetbeat-*',
  'traces-apm*',
  'winlogbeat-*',
  '-*elastic-cloud-logs-*',
];

export const getThreatIndexPatterns = (): string[] => ['logs-ti_*'];

const getMitre1 = (): Mitre => ({
  tactic: `${getMockThreatData().tactic.name} (${getMockThreatData().tactic.id})`,
  techniques: [
    {
      name: `${getMockThreatData().technique.name} (${getMockThreatData().technique.id})`,
      subtechniques: [
        `${getMockThreatData().subtechnique.name} (${getMockThreatData().subtechnique.id})`,
      ],
    },
    {
      name: `${getMockThreatData().technique.name} (${getMockThreatData().technique.id})`,
      subtechniques: [],
    },
  ],
});

const getMitre2 = (): Mitre => ({
  tactic: `${getMockThreatData().tactic.name} (${getMockThreatData().tactic.id})`,
  techniques: [
    {
      name: `${getMockThreatData().technique.name} (${getMockThreatData().technique.id})`,
      subtechniques: [
        `${getMockThreatData().subtechnique.name} (${getMockThreatData().subtechnique.id})`,
      ],
    },
  ],
});

const getSeverityOverride1 = (): SeverityOverride => ({
  sourceField: 'host.name',
  sourceValue: 'host',
});

const getSeverityOverride2 = (): SeverityOverride => ({
  sourceField: '@timestamp',
  sourceValue: '10/02/2020',
});

const getSeverityOverride3 = (): SeverityOverride => ({
  sourceField: 'host.geo.name',
  sourceValue: 'atack',
});

const getSeverityOverride4 = (): SeverityOverride => ({
  sourceField: 'agent.type',
  sourceValue: 'auditbeat',
});

const getRunsEvery = (): Interval => ({
  interval: '100',
  timeType: 'Minutes',
  type: 'm',
});

const getLookBack = (): Interval => ({
  interval: '50000',
  timeType: 'Hours',
  type: 'h',
});

export const getDataViewRule = (): CustomRule => ({
  customQuery: 'host.name: *',
  dataSource: { dataView: 'auditbeat-2022', type: 'dataView' },
  name: 'New Data View Rule',
  description: 'The new rule description.',
  severity: 'High',
  riskScore: '17',
  tags: ['test', 'newRule'],
  referenceUrls: ['http://example.com/', 'https://example.com/'],
  falsePositivesExamples: ['False1', 'False2'],
  mitre: [getMitre1(), getMitre2()],
  note: '# test markdown',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  timeline: getTimeline(),
  maxSignals: 100,
});

export const getNewRule = (rewrites?: Partial<CustomRule>): CustomRule => ({
  customQuery: 'host.name: *',
  dataSource: { index: getIndexPatterns(), type: 'indexPatterns' },
  name: 'New Rule Test',
  description: 'The new rule description.',
  severity: 'High',
  riskScore: '17',
  tags: ['test', 'newRule'],
  referenceUrls: ['http://example.com/', 'https://example.com/'],
  falsePositivesExamples: ['False1', 'False2'],
  mitre: [getMitre1(), getMitre2()],
  note: '# test markdown',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  timeline: getTimeline(),
  maxSignals: 100,
  ...rewrites,
});

export const getSimpleCustomQueryRule = (): CustomRule => ({
  customQuery: 'host.name: *',
  dataSource: { index: getIndexPatterns(), type: 'indexPatterns' },
  name: 'New Rule Test',
  description: 'The new rule description.',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
});

export const getBuildingBlockRule = (): CustomRule => ({
  customQuery: 'host.name: *',
  dataSource: { index: getIndexPatterns(), type: 'indexPatterns' },
  name: 'Building Block Rule Test',
  description: 'The new rule description.',
  severity: 'High',
  riskScore: '17',
  tags: ['test', 'newRule'],
  referenceUrls: ['http://example.com/', 'https://example.com/'],
  falsePositivesExamples: ['False1', 'False2'],
  mitre: [getMitre1(), getMitre2()],
  note: '# test markdown',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  timeline: getTimeline(),
  maxSignals: 100,
  buildingBlockType: 'default',
});

export const getUnmappedRule = (): CustomRule => ({
  customQuery: '*:*',
  dataSource: { index: ['unmapped*'], type: 'indexPatterns' },
  name: 'Rule with unmapped fields',
  description: 'The new rule description.',
  severity: 'High',
  riskScore: '17',
  tags: ['test', 'newRule'],
  referenceUrls: ['http://example.com/', 'https://example.com/'],
  falsePositivesExamples: ['False1', 'False2'],
  mitre: [getMitre1(), getMitre2()],
  note: '# test markdown',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  timeline: getTimeline(),
  maxSignals: 100,
});

export const getUnmappedCCSRule = (): CustomRule => ({
  customQuery: '*:*',
  dataSource: { index: [`${ccsRemoteName}:unmapped*`], type: 'indexPatterns' },
  name: 'Rule with unmapped fields',
  description: 'The new rule description.',
  severity: 'High',
  riskScore: '17',
  tags: ['test', 'newRule'],
  referenceUrls: ['http://example.com/', 'https://example.com/'],
  falsePositivesExamples: ['False1', 'False2'],
  mitre: [getMitre1(), getMitre2()],
  note: '# test markdown',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  timeline: getTimeline(),
  maxSignals: 100,
});

export const getExistingRule = (rewrites?: Partial<CustomRule>): CustomRule => ({
  customQuery: 'host.name: *',
  name: 'Rule 1',
  description: 'Description for Rule 1',
  dataSource: { index: ['auditbeat-*'], type: 'indexPatterns' },
  severity: 'High',
  riskScore: '19',
  tags: ['rule1'],
  referenceUrls: [],
  falsePositivesExamples: [],
  mitre: [],
  note: 'This is my note',
  runsEvery: getRunsEvery(),
  interval: '100m',
  lookBack: getLookBack(),
  timeline: getTimeline(),
  // Please do not change, or if you do, needs
  // to be any number other than default value
  maxSignals: 500,
  ...rewrites,
});

export const getNewOverrideRule = (rewrites?: Partial<OverrideRule>): OverrideRule => ({
  customQuery: 'host.name: *',
  dataSource: { index: getIndexPatterns(), type: 'indexPatterns' },
  name: 'Override Rule',
  description: 'The new rule description.',
  severity: 'High',
  riskScore: '17',
  tags: ['test', 'newRule'],
  referenceUrls: ['http://example.com/', 'https://example.com/'],
  falsePositivesExamples: ['False1', 'False2'],
  mitre: [getMitre1(), getMitre2()],
  note: '# test markdown',
  severityOverride: [
    getSeverityOverride1(),
    getSeverityOverride2(),
    getSeverityOverride3(),
    getSeverityOverride4(),
  ],
  riskOverride: 'destination.port',
  nameOverride: 'agent.type',
  timestampOverride: '@timestamp',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  timeline: getTimeline(),
  maxSignals: 100,
  ...rewrites,
});

export const getNewThresholdRule = (rewrites?: Partial<ThresholdRule>): ThresholdRule => ({
  customQuery: 'host.name: *',
  dataSource: { index: getIndexPatterns(), type: 'indexPatterns' },
  name: 'Threshold Rule',
  description: 'The new rule description.',
  severity: 'High',
  riskScore: '17',
  tags: ['test', 'newRule'],
  referenceUrls: ['http://example.com/', 'https://example.com/'],
  falsePositivesExamples: ['False1', 'False2'],
  mitre: [getMitre1(), getMitre2()],
  note: '# test markdown',
  thresholdField: 'host.name',
  threshold: '1',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  timeline: getTimeline(),
  maxSignals: 100,
  ...rewrites,
});

export const getNewTermsRule = (rewrites?: Partial<NewTermsRule>): NewTermsRule => ({
  customQuery: 'host.name: *',
  dataSource: { index: getIndexPatterns(), type: 'indexPatterns' },
  name: 'New Terms Rule',
  description: 'The new rule description.',
  severity: 'High',
  riskScore: '17',
  tags: ['test', 'newRule'],
  referenceUrls: ['http://example.com/', 'https://example.com/'],
  falsePositivesExamples: ['False1', 'False2'],
  mitre: [getMitre1(), getMitre2()],
  note: '# test markdown',
  newTermsFields: ['host.name'],
  historyWindowSize: {
    // historyWindowSize needs to be larger than the rule's lookback value
    interval: '51000',
    timeType: 'Hours',
    type: 'h',
  },
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  timeline: getTimeline(),
  maxSignals: 100,
  ...rewrites,
});

export const getMachineLearningRule = (
  rewrites?: Partial<MachineLearningRule>
): MachineLearningRule => ({
  machineLearningJobs: [
    'Unusual Linux Network Activity',
    'Anomalous Process for a Linux Population',
  ],
  anomalyScoreThreshold: 20,
  name: 'New ML Rule Test',
  description: 'The new ML rule description.',
  severity: 'Critical',
  riskScore: '70',
  tags: ['ML'],
  referenceUrls: ['https://elastic.co/'],
  falsePositivesExamples: ['False1'],
  mitre: [getMitre1()],
  note: '# test markdown',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  ...rewrites,
});

export const getEqlRule = (rewrites?: Partial<CustomRule>): CustomRule => ({
  customQuery: 'any where process.name == "zsh"',
  name: 'New EQL Rule',
  dataSource: { index: getIndexPatterns(), type: 'indexPatterns' },
  description: 'New EQL rule description.',
  severity: 'High',
  riskScore: '17',
  tags: ['test', 'newRule'],
  referenceUrls: ['http://example.com/', 'https://example.com/'],
  falsePositivesExamples: ['False1', 'False2'],
  mitre: [getMitre1(), getMitre2()],
  note: '# test markdown',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  timeline: getTimeline(),
  maxSignals: 100,
  ...rewrites,
});

export const getCCSEqlRule = (): CustomRule => ({
  customQuery: 'any where process.name == "run-parts"',
  name: 'New EQL Rule',
  dataSource: { index: [`${ccsRemoteName}:run-parts`], type: 'indexPatterns' },
  description: 'New EQL rule description.',
  severity: 'High',
  riskScore: '17',
  tags: ['test', 'newRule'],
  referenceUrls: ['http://example.com/', 'https://example.com/'],
  falsePositivesExamples: ['False1', 'False2'],
  mitre: [getMitre1(), getMitre2()],
  note: '# test markdown',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  timeline: getTimeline(),
  maxSignals: 100,
});

export const getEqlSequenceRule = (): CustomRule => ({
  customQuery:
    'sequence with maxspan=30s\
     [any where agent.name == "test.local"]\
     [any where host.name == "test.local"]',
  name: 'New EQL Sequence Rule',
  dataSource: { index: getIndexPatterns(), type: 'indexPatterns' },
  description: 'New EQL rule description.',
  severity: 'High',
  riskScore: '17',
  tags: ['test', 'newRule'],
  referenceUrls: ['http://example.com/', 'https://example.com/'],
  falsePositivesExamples: ['False1', 'False2'],
  mitre: [getMitre1(), getMitre2()],
  note: '# test markdown',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  timeline: getTimeline(),
  maxSignals: 100,
});

export const getNewThreatIndicatorRule = (
  rewrites?: Partial<ThreatIndicatorRule>
): ThreatIndicatorRule => ({
  name: 'Threat Indicator Rule Test',
  description: 'The threat indicator rule description.',
  dataSource: { index: ['suspicious-*'], type: 'indexPatterns' },
  severity: 'Critical',
  riskScore: '20',
  tags: ['test', 'threat'],
  referenceUrls: ['http://example.com/', 'https://example.com/'],
  falsePositivesExamples: ['False1', 'False2'],
  mitre: [getMitre1(), getMitre2()],
  note: '# test markdown',
  runsEvery: getRunsEvery(),
  lookBack: getLookBack(),
  indicatorIndexPattern: ['filebeat-*'],
  indicatorMappingField: 'myhash.mysha256',
  indicatorIndexField: 'threat.indicator.file.hash.sha256',
  type: 'file',
  atomic: 'a04ac6d98ad989312783d4fe3456c53730b212c79a426fb215708b6c6daa3de3',
  timeline: getIndicatorMatchTimelineTemplate(),
  maxSignals: 100,
  threatIndicatorPath: 'threat.indicator',
  matchedType: 'indicator_match_rule',
  matchedId: '84cf452c1e0375c3d4412cb550bd1783358468a3b3b777da4829d72c7d6fb74f',
  matchedIndex: 'logs-ti_abusech.malware',
  ...rewrites,
});

export const duplicatedRuleName = `${getNewThreatIndicatorRule().name} [Duplicate]`;

export const getSeveritiesOverride = (): string[] => ['Low', 'Medium', 'High', 'Critical'];

export const getEditedRule = (): CustomRule => ({
  ...getExistingRule(),
  severity: 'Medium',
  description: 'Edited Rule description',
  tags: [...(getExistingRule().tags || []), 'edited'],
});
