/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export const DEFAULT_PERCENTILES: number[] = [50, 95, 99, 99.9];

export const DEFAULT_BASE_RULE_FIELDS = [
  'rule.id',
  'rule.category',
  'rule.name',
  'kibana.space_ids',
];
