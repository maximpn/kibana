/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { renderHook } from '@testing-library/react-hooks';
import { useKibana } from '../../../../../common/lib/kibana';
import { useUpdateUrlParam } from '../../../../../common/utils/global_query_string';
import { RULES_TABLE_STATE_STORAGE_KEY } from '../constants';
import type { RulesTableState } from './rules_table_context';
import {
  DEFAULT_PAGE,
  DEFAULT_RULES_PER_PAGE,
  INITIAL_FILTER_OPTIONS,
  INITIAL_SORTING_OPTIONS,
  useRulesTableContext,
} from './rules_table_context';
import type { RulesTableSavedState } from './rules_table_saved_state';
import { useSyncRulesTableSavedState } from './use_sync_rules_table_saved_state';

jest.mock('../../../../../common/lib/kibana');
jest.mock('../../../../../common/utils/global_query_string');
jest.mock('./rules_table_context', () => ({
  INITIAL_FILTER_OPTIONS: jest.requireActual('./rules_table_context').INITIAL_FILTER_OPTIONS,
  INITIAL_SORTING_OPTIONS: jest.requireActual('./rules_table_context').INITIAL_SORTING_OPTIONS,
  DEFAULT_PAGE: jest.requireActual('./rules_table_context').DEFAULT_PAGE,
  DEFAULT_RULES_PER_PAGE: jest.requireActual('./rules_table_context').DEFAULT_RULES_PER_PAGE,
  useRulesTableContext: jest.fn(),
}));

describe('useSyncRulesTableSavedState', () => {
  const defaultState = {
    filterOptions: INITIAL_FILTER_OPTIONS,
    sortingOptions: INITIAL_SORTING_OPTIONS,
    pagination: {
      page: DEFAULT_PAGE,
      perPage: DEFAULT_RULES_PER_PAGE,
      total: 100,
    },
  };
  const expectUrlSync = (state: Partial<RulesTableState>, expected: RulesTableSavedState) => {
    (useRulesTableContext as jest.Mock).mockReturnValue({
      state,
    });

    renderHook(() => useSyncRulesTableSavedState());

    expect(updateUrlParam).toHaveBeenCalledWith(expected);
  };
  const expectStorageSync = (state: Partial<RulesTableState>, expected: RulesTableSavedState) => {
    (useRulesTableContext as jest.Mock).mockReturnValue({
      state,
    });

    renderHook(() => useSyncRulesTableSavedState());

    expect(setStorage).toHaveBeenCalledWith(RULES_TABLE_STATE_STORAGE_KEY, expected);
  };

  let updateUrlParam: jest.Mock;
  let setStorage: jest.Mock;
  let removeStorage: jest.Mock;

  beforeEach(() => {
    updateUrlParam = jest.fn();
    setStorage = jest.fn();
    removeStorage = jest.fn();

    (useUpdateUrlParam as jest.Mock).mockReturnValue(updateUrlParam);
    (useKibana as jest.Mock).mockReturnValue({
      services: { sessionStorage: { set: setStorage, remove: removeStorage } },
    });
  });

  it('clears the default state when there is nothing to sync', () => {
    (useRulesTableContext as jest.Mock).mockReturnValue({ state: defaultState });

    renderHook(() => useSyncRulesTableSavedState());

    expect(updateUrlParam).toHaveBeenCalledWith(null);
    expect(setStorage).not.toHaveBeenCalled();
    expect(removeStorage).toHaveBeenCalledWith(RULES_TABLE_STATE_STORAGE_KEY);
  });

  it('syncs both the url and the storage', () => {
    const state = {
      filterOptions: {
        filter: 'test',
        tags: ['test'],
        showCustomRules: true,
        showElasticRules: false,
      },
      sortingOptions: {
        field: 'name',
        order: 'asc',
      },
      pagination: {
        page: 3,
        perPage: 10,
        total: 100,
      },
    };
    const expected = {
      searchTerm: 'test',
      showCustomRules: true,
      tags: ['test'],
      sort: {
        field: 'name',
        order: 'asc',
      },
      page: 3,
      perPage: 10,
    };

    (useRulesTableContext as jest.Mock).mockReturnValue({
      state,
    });

    renderHook(() => useSyncRulesTableSavedState());

    expect(updateUrlParam).toHaveBeenCalledWith(expected);
    expect(setStorage).toHaveBeenCalledWith(RULES_TABLE_STATE_STORAGE_KEY, expected);
  });

  describe('with the url', () => {
    it('syncs only the search term', () => {
      expectUrlSync(
        { ...defaultState, filterOptions: { ...INITIAL_FILTER_OPTIONS, filter: 'test' } },
        { searchTerm: 'test' }
      );
    });

    it('syncs only the show elastic rules filter', () => {
      expectUrlSync(
        {
          ...defaultState,
          filterOptions: { ...defaultState.filterOptions, showElasticRules: true },
        },
        { showCustomRules: false }
      );
    });

    it('syncs only the show custom rules filter', () => {
      expectUrlSync(
        {
          ...defaultState,
          filterOptions: { ...defaultState.filterOptions, showCustomRules: true },
        },
        { showCustomRules: true }
      );
    });

    it('syncs only the tags', () => {
      expectUrlSync(
        {
          ...defaultState,
          filterOptions: { ...defaultState.filterOptions, tags: ['test'] },
        },
        { tags: ['test'] }
      );
    });

    it('syncs only the sorting field', () => {
      expectUrlSync(
        {
          ...defaultState,
          sortingOptions: { ...defaultState.sortingOptions, field: 'name' },
        },
        { sort: { field: 'name' } }
      );
    });

    it('syncs only the sorting order', () => {
      expectUrlSync(
        {
          ...defaultState,
          sortingOptions: { ...defaultState.sortingOptions, order: 'asc' },
        },
        { sort: { order: 'asc' } }
      );
    });

    it('syncs only the page number', () => {
      expectUrlSync(
        {
          ...defaultState,
          pagination: {
            ...defaultState.pagination,
            page: 10,
          },
        },
        { page: 10 }
      );
    });

    it('syncs only the page size', () => {
      expectUrlSync(
        {
          ...defaultState,
          pagination: {
            ...defaultState.pagination,
            perPage: 10,
          },
        },
        { perPage: 10 }
      );
    });
  });

  describe('with the storage', () => {
    it('syncs only the search term', () => {
      expectStorageSync(
        { ...defaultState, filterOptions: { ...defaultState.filterOptions, filter: 'test' } },
        { searchTerm: 'test' }
      );
    });

    it('syncs only the show elastic rules filter', () => {
      expectStorageSync(
        {
          ...defaultState,
          filterOptions: { ...defaultState.filterOptions, showElasticRules: true },
        },
        { showCustomRules: false }
      );
    });

    it('syncs only the show custom rules filter', () => {
      expectStorageSync(
        {
          ...defaultState,
          filterOptions: { ...defaultState.filterOptions, showCustomRules: true },
        },
        { showCustomRules: true }
      );
    });

    it('syncs only the tags', () => {
      expectStorageSync(
        {
          ...defaultState,
          filterOptions: { ...defaultState.filterOptions, tags: ['test'] },
        },
        { tags: ['test'] }
      );
    });

    it('syncs only the sorting field', () => {
      expectStorageSync(
        {
          ...defaultState,
          sortingOptions: { ...defaultState.sortingOptions, field: 'name' },
        },
        { sort: { field: 'name' } }
      );
    });

    it('syncs only the sorting order', () => {
      expectStorageSync(
        {
          ...defaultState,
          sortingOptions: { ...defaultState.sortingOptions, order: 'asc' },
        },
        { sort: { order: 'asc' } }
      );
    });

    it('syncs only the page number', () => {
      expectStorageSync(
        {
          ...defaultState,
          pagination: {
            ...defaultState.pagination,
            page: 10,
          },
        },
        { page: 10 }
      );
    });

    it('syncs only the page size', () => {
      expectStorageSync(
        {
          ...defaultState,
          pagination: {
            ...defaultState.pagination,
            perPage: 10,
          },
        },
        { perPage: 10 }
      );
    });
  });
});
