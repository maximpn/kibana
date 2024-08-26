/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { AnyEventObject } from 'xstate';
import { assign, createMachine } from 'xstate';
import { useMachine } from '@xstate/react';
import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EuiButton, EuiToolTip } from '@elastic/eui';
import type { EuiTabbedContentTab } from '@elastic/eui';
import type { MlSummaryJob } from '@kbn/ml-plugin/common';
import { PerFieldRuleDiffTab } from '../../../../rule_management/components/rule_details/per_field_rule_diff_tab';
import { useIsUpgradingSecurityPackages } from '../../../../rule_management/logic/use_upgrade_security_packages';
import { useInstalledSecurityJobs } from '../../../../../common/components/ml/hooks/use_installed_security_jobs';
import { useBoolState } from '../../../../../common/hooks/use_bool_state';
import { affectedJobIds } from '../../../../../detections/components/callouts/ml_job_compatibility_callout/affected_job_ids';
import type { RuleUpgradeInfoForReview } from '../../../../../../common/api/detection_engine/prebuilt_rules';
import type {
  RuleObjectId,
  RuleSignatureId,
} from '../../../../../../common/api/detection_engine/model/rule_schema';
import { invariant } from '../../../../../../common/utils/invariant';
import {
  usePerformUpgradeAllRules,
  usePerformUpgradeSpecificRules,
} from '../../../../rule_management/logic/prebuilt_rules/use_perform_rule_upgrade';
import { usePrebuiltRulesUpgradeReview } from '../../../../rule_management/logic/prebuilt_rules/use_prebuilt_rules_upgrade_review';
import type { UpgradePrebuiltRulesTableFilterOptions } from './use_filter_prebuilt_rules_to_upgrade';
import { useFilterPrebuiltRulesToUpgrade } from './use_filter_prebuilt_rules_to_upgrade';
import { useAsyncConfirmation } from '../rules_table/use_async_confirmation';
import { useRuleDetailsFlyout } from '../../../../rule_management/components/rule_details/use_rule_details_flyout';
import {
  RuleDetailsFlyout,
  TabContentPadding,
} from '../../../../rule_management/components/rule_details/rule_details_flyout';
import { RuleDiffTab } from '../../../../rule_management/components/rule_details/rule_diff_tab';
import { MlJobUpgradeModal } from '../../../../../detections/components/modals/ml_job_upgrade_modal';
import * as ruleDetailsI18n from '../../../../rule_management/components/rule_details/translations';
import * as i18n from './translations';

export interface UpgradePrebuiltRulesTableState {
  /**
   * Rules available to be updated
   */
  rules: RuleUpgradeInfoForReview[];
  /**
   * Rules to display in table after applying filters
   */
  filteredRules: RuleUpgradeInfoForReview[];
  /**
   * Currently selected table filter
   */
  filterOptions: UpgradePrebuiltRulesTableFilterOptions;
  /**
   * All unique tags for all rules
   */
  tags: string[];
  /**
   * Is true then there is no cached data and the query is currently fetching.
   */
  isLoading: boolean;
  /**
   * Will be true if the query has been fetched.
   */
  isFetched: boolean;
  /**
   * Is true whenever a background refetch is in-flight, which does not include initial loading
   */
  isRefetching: boolean;
  /**
   * Is true when installing security_detection_rules
   * package in background
   */
  isUpgradingSecurityPackages: boolean;
  /**
   * List of rule IDs that are currently being upgraded
   */
  loadingRules: RuleSignatureId[];
  /**
  /**
   * The timestamp for when the rules were successfully fetched
   */
  lastUpdated: number;
  /**
   * Rule rows selected in EUI InMemory Table
   */
  selectedRules: RuleUpgradeInfoForReview[];
}

export const PREBUILT_RULE_UPDATE_FLYOUT_ANCHOR = 'updatePrebuiltRulePreview';

interface Context {
  rules?: RuleUpgradeInfoForReview[];
  legacyJobsCount: number;
  currentRule?: RuleUpgradeInfoForReview;
}

type Event =
  | { type: 'DATA_UPDATE'; rules: RuleUpgradeInfoForReview[]; jobs: MlSummaryJob[] }
  | {
      type: 'UPGRATOR_UPDATE';
    }
  | {
      type: 'DATA_LOAD_ERROR';
    }
  | {
      type: 'OPEN_MODAL';
      ruleId: string;
    }
  | {
      type: 'REQUEST_RULE_UPGRADE';
    }
  | {
      type: 'CONFIRM_RULE_UPGRADE';
    }
  | {
      type: 'CLOSE_MODAL';
    };

export interface UpgradePrebuiltRulesTableActions {
  reFetchRules: () => void;
  upgradeOneRule: (ruleId: string) => void;
  upgradeSelectedRules: () => void;
  upgradeAllRules: () => void;
  setFilterOptions: Dispatch<SetStateAction<UpgradePrebuiltRulesTableFilterOptions>>;
  selectRules: (rules: RuleUpgradeInfoForReview[]) => void;
  openRulePreview: (ruleId: string) => void;
}

export interface UpgradePrebuiltRulesContextType {
  state: UpgradePrebuiltRulesTableState;
  actions: UpgradePrebuiltRulesTableActions;
}

const UpgradePrebuiltRulesTableContext = createContext<UpgradePrebuiltRulesContextType | null>(
  null
);

interface UpgradePrebuiltRulesTableContextProviderProps {
  children: React.ReactNode;
}

const upgradePrebuiltRuleMachine = createMachine<Context, Event>(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QFcAOUBOBDCYAKGYARsgJYA2ALgErLlwDEAIgIIAqLA+gKp6tsBRANoAGALqJQqAPaxSlUtIB2kkAE9EAWgDMATgAcAGhAAPRAEZdegHQBWWwBYAbPoDstgL4fjaTDnyEJBQ0dHDWpErypFjkpHJKUMzsXLz8wuKqMnIKyqpmCOauDtZOruZubtqu+g6uTsYaCNoATE4lrrquzSLm2iK22g6e3iC+2LgExGRUtPSw4ZEKMXERifxcADIA8ixMnALU1FvUohJIIFlRuef5hcWl5dWuVTV1DYjdtta6zZ2tXSIRLoHOZhj50OMAlNgrMwqQIPQGFs8AIAHKcACyW1YG1OmVkVxUN0Qul61lBTmatkpbhE+l07wQmicbQczUeYNGEP8kyCM1C8wAttIIDFONJUGAlAwAMLbADKAkx2JYuIy50uOSJoEaOnMIjsxluTnMbQG5ipXnBfgmgWmITm1mFovI4slSmshAAbqQwAB3VYMagCACK3AE8rYnGo3A2St4AHFqLt0mcpAStXkPs1tOSOi53Iyfq5rIMnNp9H0HLoa78rVybVC+Q6ws6xRKpZ6wD7-YHg2GI1GY3GeHgkymhOY0xcM4ptaZs7nCroC7ZGeWvmWK1Waz9dPWxjy7TCBU6Re33dYsH6sFEEpwAMbKABmpAwgqwWtlW1RADEAJLUBi0axvGY7Jkwqb4tkc5Zk05jFFS66VqWzjbiI1a1vuIyHra0L8o6oqUFgGzSDgqwCBgGDSBgSQcKOaR4hqs7XKA+TUuY1gODUFYIfYQx0oy5TNN85q2OylY1iITheCMSginAqi4U29qwvAzEwaxC5MiujI6AY1iAkZ2jaKUrjPCZB7cnhzZqQsUTLPEUDQYScG1Iy7IiTU5aVhhu7NPo+hWY2vKqae8L0C5mbEggXS6CU1JUjSrh0gy6gfGSpSdKa24tJSwWQqFJ6Om2rodvOmqwTFmjcYyzicWWIKVg41b6HSMk4dZKnFa255lZe3q+gGCRRVVbGICIjKOPo1jeehmF7gVR74S2Qp9W6nbXreCj3k+Sivu+n5jTOmnzvkk3pQgLi5luvkLXWnUhceBG9S6G0erhqyjVp52MvohSzWhd3+dh1qFc9q3WERJFkRAFFUTR31nYgvHWM0rTUiuTgiM0dTAh50lcb8XSlN0QIgsMXhAA */
    id: 'upgradePrebuiltRules',
    initial: 'initialising',
    context: {
      rules: [],
      legacyJobsCount: -1,
      currentRule: undefined,
    },
    on: {
      DATA_UPDATE: { actions: 'updateData' },
    },
    states: {
      initialising: {
        on: {
          DATA_UPDATE: {
            actions: 'updateData',
            target: 'idle',
          },
          DATA_LOAD_ERROR: 'dataLoadingError',
        },
      },
      idle: {
        on: {
          OPEN_MODAL: {
            target: 'modal_open',
            cond: 'isRuleValid',
            actions: 'setCurrentRule',
          },
        },
      },
      modal_open: {
        initial: 'reviewing',
        states: {
          reviewing: {
            on: {
              REQUEST_RULE_UPGRADE: [
                {
                  target: 'awaiting_confirmation',
                  cond: 'hasLegacyJobs',
                },
                {
                  target: 'upgrading',
                },
              ],
            },
          },
          awaiting_confirmation: {
            on: {
              CONFIRM_RULE_UPGRADE: 'upgrading',
            },
          },
          upgrading: {
            invoke: {
              src: 'upgradeCurrentRule',
            },
          },
        },
        on: {
          CLOSE_MODAL: {
            target: 'idle',
            actions: 'resetCurrentRule',
          },
        },
      },
      dataLoadingError: {
        on: {
          DATA_UPDATE: {
            actions: 'updateData',
            target: 'idle',
          },
        },
      },
    },
  },
  {
    actions: {
      updateData: assign({
        rules: (_, event) => (event.type === 'DATA_UPDATE' ? event.rules : undefined),
        legacyJobsCount: (_, event) =>
          event.type === 'DATA_UPDATE'
            ? event.jobs.filter((job) => affectedJobIds.includes(job.id)).length
            : -1,
      }),
      setCurrentRule: assign({
        currentRule: (context, event: AnyEventObject) =>
          context.rules?.find((rule) => rule.id === event.ruleId),
      }),
      resetCurrentRule: assign({
        currentRule: () => undefined,
      }),
    },
    guards: {
      isRuleValid: (context, event) =>
        event.type === 'OPEN_MODAL'
          ? context.rules?.some((rule) => rule.id === event.ruleId) ?? false
          : false,
      hasLegacyJobs: (context) => context.legacyJobsCount > 0,
    },
  }
);

export const UpgradePrebuiltRulesTableContextProvider = ({
  children,
}: UpgradePrebuiltRulesTableContextProviderProps) => {
  const {
    data: { rules, stats: { tags } } = {
      rules: [],
      stats: { tags: [] },
    },
    status,
    refetch,
    dataUpdatedAt,
    isFetched,
    isLoading,
    isRefetching,
  } = usePrebuiltRulesUpgradeReview({
    refetchInterval: false, // Disable automatic refetching since request is expensive
    keepPreviousData: true, // Use this option so that the state doesn't jump between "success" and "loading" on page change
  });
  const { loading: loadingJobs, jobs } = useInstalledSecurityJobs();
  const { mutateAsync: upgradeAllRulesRequest } = usePerformUpgradeAllRules();
  const { mutateAsync: upgradeSpecificRulesRequest } = usePerformUpgradeSpecificRules();

  const [machineState, sendToMachine] = useMachine(upgradePrebuiltRuleMachine, {
    devTools: true,
    services: {
      upgradeCurrentRule: (context) => async (send) => {
        if (!context.currentRule) {
          return;
        }

        const ruleId = context.currentRule?.rule_id;

        try {
          await upgradeSpecificRulesRequest([
            {
              rule_id: ruleId,
              version:
                context.currentRule.diff.fields.version?.target_version ??
                context.currentRule.current_rule.version,
              revision: context.currentRule.revision,
            },
          ]);
        } finally {
          send('CLOSE_MODAL');
        }
      },
    },
  });

  useEffect(() => {
    if (status === 'success') {
      sendToMachine('DATA_UPDATE', { rules, jobs });
    } else if (status === 'error') {
      sendToMachine('DATA_LOAD_ERROR');
    }
  }, [sendToMachine, status, rules, jobs]);

  useEffect(() => {
    sendToMachine('UPGRATOR_UPDATE', { upgradeRule: upgradeSpecificRulesRequest });
  }, [sendToMachine, upgradeSpecificRulesRequest]);

  const legacyJobsInstalled = jobs.filter((job) => affectedJobIds.includes(job.id));

  const [loadingRules, setLoadingRules] = useState<RuleSignatureId[]>([]);
  const [selectedRules, setSelectedRules] = useState<RuleUpgradeInfoForReview[]>([]);
  const [filterOptions, setFilterOptions] = useState<UpgradePrebuiltRulesTableFilterOptions>({
    filter: '',
    tags: [],
  });

  const isUpgradingSecurityPackages = useIsUpgradingSecurityPackages();

  const filteredRules = useFilterPrebuiltRulesToUpgrade({ filterOptions, rules });

  const { previewedRule } = useRuleDetailsFlyout(
    filteredRules.map((upgradeInfo) => upgradeInfo.target_rule)
  );
  const canPreviewedRuleBeUpgraded = Boolean(
    (previewedRule?.rule_id && loadingRules.includes(previewedRule.rule_id)) ||
      isRefetching ||
      isUpgradingSecurityPackages
  );

  // Wrapper to add confirmation modal for users who may be running older ML Jobs that would
  // be overridden by updating their rules. For details, see: https://github.com/elastic/kibana/issues/128121
  const [isUpgradeModalVisible, showUpgradeModal, hideUpgradeModal] = useBoolState(false);

  const [confirmUpgrade, handleUpgradeConfirm, handleUpgradeCancel] = useAsyncConfirmation({
    onInit: showUpgradeModal,
    onFinish: hideUpgradeModal,
  });

  const shouldConfirmUpgrade = legacyJobsInstalled.length > 0;

  const upgradeOneRule = useCallback(
    async (ruleId: RuleSignatureId) => {
      const rule = rules.find((r) => r.rule_id === ruleId);
      invariant(rule, `Rule with id ${ruleId} not found`);

      setLoadingRules((prev) => [...prev, ruleId]);
      try {
        if (shouldConfirmUpgrade && !(await confirmUpgrade())) {
          return;
        }
        await upgradeSpecificRulesRequest([
          {
            rule_id: ruleId,
            version: rule.diff.fields.version?.target_version ?? rule.current_rule.version,
            revision: rule.revision,
          },
        ]);
      } finally {
        setLoadingRules((prev) => prev.filter((id) => id !== ruleId));
      }
    },
    [confirmUpgrade, rules, shouldConfirmUpgrade, upgradeSpecificRulesRequest]
  );

  const upgradeSelectedRules = useCallback(async () => {
    const rulesToUpgrade = selectedRules.map((rule) => ({
      rule_id: rule.rule_id,
      version: rule.diff.fields.version?.target_version ?? rule.current_rule.version,
      revision: rule.revision,
    }));
    setLoadingRules((prev) => [...prev, ...rulesToUpgrade.map((r) => r.rule_id)]);
    try {
      if (shouldConfirmUpgrade && !(await confirmUpgrade())) {
        return;
      }
      await upgradeSpecificRulesRequest(rulesToUpgrade);
    } finally {
      setLoadingRules((prev) => prev.filter((id) => !rulesToUpgrade.some((r) => r.rule_id === id)));
      setSelectedRules([]);
    }
  }, [confirmUpgrade, selectedRules, shouldConfirmUpgrade, upgradeSpecificRulesRequest]);

  const upgradeAllRules = useCallback(async () => {
    // Unselect all rules so that the table doesn't show the "bulk actions" bar
    setLoadingRules((prev) => [...prev, ...rules.map((r) => r.rule_id)]);
    try {
      if (shouldConfirmUpgrade && !(await confirmUpgrade())) {
        return;
      }
      await upgradeAllRulesRequest();
    } finally {
      setLoadingRules([]);
      setSelectedRules([]);
    }
  }, [confirmUpgrade, rules, shouldConfirmUpgrade, upgradeAllRulesRequest]);

  const openRulePreview = useCallback(
    (ruleId: RuleObjectId) => {
      sendToMachine('OPEN_MODAL', { ruleId });
    },
    [sendToMachine]
  );

  const actions = useMemo<UpgradePrebuiltRulesTableActions>(
    () => ({
      reFetchRules: refetch,
      upgradeOneRule,
      upgradeSelectedRules,
      upgradeAllRules,
      setFilterOptions,
      selectRules: setSelectedRules,
      openRulePreview,
    }),
    [refetch, upgradeOneRule, upgradeSelectedRules, upgradeAllRules, openRulePreview]
  );

  const providerValue = useMemo<UpgradePrebuiltRulesContextType>(() => {
    return {
      state: {
        rules,
        filteredRules,
        filterOptions,
        tags,
        isFetched,
        isLoading: isLoading && loadingJobs,
        isRefetching,
        isUpgradingSecurityPackages,
        selectedRules,
        loadingRules,
        lastUpdated: dataUpdatedAt,
      },
      actions,
    };
  }, [
    rules,
    filteredRules,
    filterOptions,
    tags,
    isFetched,
    isLoading,
    loadingJobs,
    isRefetching,
    isUpgradingSecurityPackages,
    selectedRules,
    loadingRules,
    dataUpdatedAt,
    actions,
  ]);

  const extraTabs = useMemo<EuiTabbedContentTab[]>(() => {
    const activeRule =
      machineState.context.currentRule &&
      filteredRules.find(({ id }) => id === machineState.context.currentRule?.id);

    if (!activeRule) {
      return [];
    }

    return [
      {
        id: 'updates',
        name: (
          <EuiToolTip position="top" content={i18n.UPDATE_FLYOUT_PER_FIELD_TOOLTIP_DESCRIPTION}>
            <>{ruleDetailsI18n.UPDATES_TAB_LABEL}</>
          </EuiToolTip>
        ),
        content: (
          <TabContentPadding>
            <PerFieldRuleDiffTab ruleDiff={activeRule.diff} />
          </TabContentPadding>
        ),
      },
      {
        id: 'jsonViewUpdates',
        name: (
          <EuiToolTip position="top" content={i18n.UPDATE_FLYOUT_JSON_VIEW_TOOLTIP_DESCRIPTION}>
            <>{ruleDetailsI18n.JSON_VIEW_UPDATES_TAB_LABEL}</>
          </EuiToolTip>
        ),
        content: (
          <TabContentPadding>
            <RuleDiffTab oldRule={activeRule.current_rule} newRule={activeRule.target_rule} />
          </TabContentPadding>
        ),
      },
    ];
  }, [machineState.context.currentRule, filteredRules]);

  return (
    <UpgradePrebuiltRulesTableContext.Provider value={providerValue}>
      <>
        {isUpgradeModalVisible && (
          <MlJobUpgradeModal
            jobs={legacyJobsInstalled}
            onCancel={handleUpgradeCancel}
            onConfirm={handleUpgradeConfirm}
          />
        )}
        {children}
        {machineState.matches('modal_open') && machineState.context.currentRule && (
          <RuleDetailsFlyout
            rule={machineState.context.currentRule.target_rule}
            size="l"
            id={PREBUILT_RULE_UPDATE_FLYOUT_ANCHOR}
            dataTestSubj="updatePrebuiltRulePreview"
            closeFlyout={() => sendToMachine('CLOSE_MODAL')}
            ruleActions={
              <EuiButton
                disabled={canPreviewedRuleBeUpgraded}
                onClick={() => sendToMachine('REQUEST_RULE_UPGRADE')}
                fill
                data-test-subj="updatePrebuiltRuleFromFlyoutButton"
              >
                {i18n.UPDATE_BUTTON_LABEL}
              </EuiButton>
            }
            extraTabs={extraTabs}
          />
        )}
      </>
    </UpgradePrebuiltRulesTableContext.Provider>
  );
};

export const useUpgradePrebuiltRulesTableContext = (): UpgradePrebuiltRulesContextType => {
  const rulesTableContext = useContext(UpgradePrebuiltRulesTableContext);
  invariant(
    rulesTableContext,
    'useUpgradePrebuiltRulesTableContext should be used inside UpgradePrebuiltRulesTableContextProvider'
  );

  return rulesTableContext;
};
