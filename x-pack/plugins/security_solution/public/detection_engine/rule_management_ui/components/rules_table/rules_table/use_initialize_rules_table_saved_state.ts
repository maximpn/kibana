/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useCallback } from 'react';
import { RULES_TABLE_MAX_PAGE_SIZE } from '../../../../../../common/constants';
import { useKibana } from '../../../../../common/lib/kibana';
import { URL_PARAM_KEY } from '../../../../../common/hooks/use_url_state';
import { useInitializeUrlParam } from '../../../../../common/utils/global_query_string';
import { RULES_TABLE_STATE_STORAGE_KEY } from '../constants';
import {
  INITIAL_FILTER_OPTIONS,
  INITIAL_SORTING_OPTIONS,
  useRulesTableContext,
} from './rules_table_context';
import type { RulesTableSavedState } from './rules_table_saved_state';

export function useInitializeRulesTableSavedState(): void {
  const { actions } = useRulesTableContext();
  const {
    services: { sessionStorage },
  } = useKibana();
  const onInitializeRulesTableContextFromUrlParam = useCallback(
    (params: RulesTableSavedState | null) => {
      const savedState: Partial<RulesTableSavedState> | null = sessionStorage.get(
        RULES_TABLE_STATE_STORAGE_KEY
      );

      if (!params && !savedState) {
        return;
      }

      const searchTerm = params?.searchTerm ?? savedState?.searchTerm;
      const showCustomRules = params?.showCustomRules ?? savedState?.showCustomRules;
      const tags = params?.tags ?? savedState?.tags;
      const sorting = params?.sort ?? savedState?.sort;
      const page = params?.page ?? savedState?.page;
      const perPage = params?.perPage ?? savedState?.perPage;

      actions.setFilterOptions({
        filter: typeof searchTerm === 'string' ? searchTerm : INITIAL_FILTER_OPTIONS.filter,
        showElasticRules: showCustomRules === false,
        showCustomRules: showCustomRules === true,
        tags: Array.isArray(tags) ? tags : INITIAL_FILTER_OPTIONS.tags,
      });

      if (sorting) {
        actions.setSortingOptions({
          field: sorting.field ?? INITIAL_SORTING_OPTIONS.field,
          order: sorting.order ?? INITIAL_SORTING_OPTIONS.order,
        });
      }

      if (page) {
        actions.setPage(page);
      }

      if (perPage && perPage > 0 && perPage <= RULES_TABLE_MAX_PAGE_SIZE) {
        actions.setPerPage(perPage);
      }
    },
    [actions, sessionStorage]
  );

  useInitializeUrlParam(URL_PARAM_KEY.rulesTable, onInitializeRulesTableContextFromUrlParam);
}
