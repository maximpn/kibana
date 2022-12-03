/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFilterButton, EuiFilterGroup, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { isEqual } from 'lodash/fp';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useRuleManagementFilters } from '../../../../rule_management/logic/use_rule_management_filters';
import { RULES_TABLE_ACTIONS } from '../../../../../common/lib/apm/user_actions';
import { useStartTransaction } from '../../../../../common/lib/apm/use_start_transaction';
import * as i18n from '../../../../../detections/pages/detection_engine/rules/translations';
import { useRulesTableContext } from '../rules_table/rules_table_context';
import { TagsFilterPopover } from './tags_filter_popover';
import { RuleSearchField } from './rule_search_field';

const FilterWrapper = styled(EuiFlexGroup)`
  margin-bottom: ${({ theme }) => theme.eui.euiSizeXS};
`;

/**
 * Collection of filters for filtering data within the RulesTable. Contains search bar, Elastic/Custom
 * Rules filter button toggle, and tag selection
 */
const RulesTableFiltersComponent = () => {
  const { startTransaction } = useStartTransaction();
  const {
    state: { filterOptions },
    actions: { setFilterOptions },
  } = useRulesTableContext();
  const { data: filtersData } = useRuleManagementFilters();
  const allTags = filtersData?.tags ?? [];
  const rulesCustomCount = filtersData?.rules_custom_count;
  const rulesPrebuiltInstalledCount = filtersData?.rules_prebuilt_installed_count;

  const { showCustomRules, showElasticRules, tags: selectedTags } = filterOptions;

  const handleOnSearch = useCallback(
    (filterString) => {
      startTransaction({ name: RULES_TABLE_ACTIONS.FILTER });
      setFilterOptions({ filter: filterString.trim() });
    },
    [setFilterOptions, startTransaction]
  );

  const handleElasticRulesClick = useCallback(() => {
    startTransaction({ name: RULES_TABLE_ACTIONS.FILTER });
    setFilterOptions({ showElasticRules: !showElasticRules, showCustomRules: false });
  }, [setFilterOptions, showElasticRules, startTransaction]);

  const handleCustomRulesClick = useCallback(() => {
    startTransaction({ name: RULES_TABLE_ACTIONS.FILTER });
    setFilterOptions({ showCustomRules: !showCustomRules, showElasticRules: false });
  }, [setFilterOptions, showCustomRules, startTransaction]);

  const handleSelectedTags = useCallback(
    (newTags: string[]) => {
      if (!isEqual(newTags, selectedTags)) {
        startTransaction({ name: RULES_TABLE_ACTIONS.FILTER });
        setFilterOptions({ tags: newTags });
      }
    },
    [selectedTags, setFilterOptions, startTransaction]
  );

  return (
    <FilterWrapper gutterSize="m" justifyContent="flexEnd">
      <RuleSearchField initialValue={filterOptions.filter} onSearch={handleOnSearch} />
      <EuiFlexItem grow={false}>
        <EuiFilterGroup>
          <TagsFilterPopover
            onSelectedTagsChanged={handleSelectedTags}
            selectedTags={selectedTags}
            tags={allTags}
            data-test-subj="allRulesTagPopover"
          />
        </EuiFilterGroup>
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiFilterGroup>
          <EuiFilterButton
            hasActiveFilters={showElasticRules}
            onClick={handleElasticRulesClick}
            data-test-subj="showElasticRulesFilterButton"
            withNext
          >
            {i18n.ELASTIC_RULES}
            {rulesPrebuiltInstalledCount != null ? ` (${rulesPrebuiltInstalledCount ?? ''})` : ''}
          </EuiFilterButton>
          <EuiFilterButton
            hasActiveFilters={showCustomRules}
            onClick={handleCustomRulesClick}
            data-test-subj="showCustomRulesFilterButton"
          >
            {i18n.CUSTOM_RULES}
            {rulesCustomCount != null ? ` (${rulesCustomCount})` : ''}
          </EuiFilterButton>
        </EuiFilterGroup>
      </EuiFlexItem>
    </FilterWrapper>
  );
};

RulesTableFiltersComponent.displayName = 'RulesTableFiltersComponent';

export const RulesTableFilters = React.memo(RulesTableFiltersComponent);

RulesTableFilters.displayName = 'RulesTableFilters';
