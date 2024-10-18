/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { KqlQueryEditForm } from './fields/kql_query';
import type { UpgradeableSavedQueryFields } from '../../../../model/prebuilt_rule_upgrade/fields';

interface SavedQueryRuleFieldEditProps {
  fieldName: UpgradeableSavedQueryFields;
}

export function SavedQueryRuleFieldEdit({ fieldName }: SavedQueryRuleFieldEditProps) {
  switch (fieldName) {
    case 'kql_query':
      return <KqlQueryEditForm />;
    default:
      return null; // Will be replaced with `assertUnreachable(fieldName)` once all fields are implemented
  }
}
