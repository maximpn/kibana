/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiSpacer } from '@elastic/eui';
import React from 'react';
import { Route } from '@kbn/kibana-react-plugin/public';
import { Switch, useParams } from 'react-router-dom';
import { RulesManagementTour } from './rules_table/guided_onboarding/rules_management_tour';
import { useInitializeRulesTableSavedState } from './rules_table/use_initialize_rules_table_saved_state';
import { useSyncRulesTableSavedState } from './rules_table/use_sync_rules_table_saved_state';
import { RulesTables } from './rules_tables';
import { AllRulesTabs, RulesTableToolbar } from './rules_table_toolbar';

function TabContainer(): JSX.Element {
  const params = useParams<{ tabName: string }>();
  const activeTab =
    params.tabName === AllRulesTabs.monitoring ? AllRulesTabs.monitoring : AllRulesTabs.rules;

  return (
    <>
      <RulesTableToolbar activeTab={activeTab} />
      <EuiSpacer />
      <RulesTables selectedTab={activeTab} />
    </>
  );
}

/**
 * Table Component for displaying all Rules for a given cluster. Provides the ability to filter
 * by name, sort by enabled, and perform the following actions:
 *   * Enable/Disable
 *   * Duplicate
 *   * Delete
 *   * Import/Export
 */
export const AllRules = React.memo(() => {
  useInitializeRulesTableSavedState();
  useSyncRulesTableSavedState();

  return (
    <>
      <RulesManagementTour />
      <Switch>
        <Route path="/rules/:tabName">
          <TabContainer />
        </Route>
        <Route>
          <TabContainer />
        </Route>
      </Switch>
    </>
  );
});

AllRules.displayName = 'AllRules';
