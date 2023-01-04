/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { aggregateAlertRoute } from './aggregate';
import { httpServiceMock } from '@kbn/core/server/mocks';
import { licenseStateMock } from '../../lib/license_state.mock';
import { verifyApiAccess } from '../../lib/license_api_access';
import { mockHandlerArguments } from '../_mock_handler_arguments';
import { rulesClientMock } from '../../rules_client.mock';
import { trackLegacyRouteUsage } from '../../lib/track_legacy_route_usage';
import { trackLegacyTerminology } from '../lib/track_legacy_terminology';
import { usageCountersServiceMock } from '@kbn/usage-collection-plugin/server/usage_counters/usage_counters_service.mock';

const rulesClient = rulesClientMock.create();
const mockUsageCountersSetup = usageCountersServiceMock.createSetupContract();
const mockUsageCounter = mockUsageCountersSetup.createUsageCounter('test');

jest.mock('../../lib/track_legacy_route_usage', () => ({
  trackLegacyRouteUsage: jest.fn(),
}));

jest.mock('../../lib/license_api_access', () => ({
  verifyApiAccess: jest.fn(),
}));

jest.mock('../lib/track_legacy_terminology', () => ({
  trackLegacyTerminology: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

describe('aggregateAlertRoute', () => {
  it('aggregate alerts with proper parameters', async () => {
    const licenseState = licenseStateMock.create();
    const router = httpServiceMock.createRouter();

    aggregateAlertRoute(router, licenseState);

    const [config, handler] = router.get.mock.calls[0];

    expect(config.path).toMatchInlineSnapshot(`"/api/alerts/_aggregate"`);

    rulesClient.aggregate.mockResolvedValueOnce({
      status: {
        buckets: [
          { key: 'active', doc_count: 23 },
          { key: 'error', doc_count: 2 },
          { key: 'ok', doc_count: 15 },
          { key: 'pending', doc_count: 1 },
        ],
      },
      outcome: {
        buckets: [
          { key: 'failed', doc_count: 2 },
          { key: 'succeeded', doc_count: 1 },
          { key: 'warning', doc_count: 3 },
        ],
      },
      muted: {
        buckets: [
          { key: 1, key_as_string: '1', doc_count: 1 },
          { key: 2, key_as_string: '2', doc_count: 2 },
        ],
      },
      enabled: {
        buckets: [
          { key: 1, key_as_string: '1', doc_count: 1 },
          { key: 0, key_as_string: '0', doc_count: 2 },
        ],
      },
      snoozed: {
        count: {
          doc_count: 1,
        },
      },
      tags: {
        buckets: [
          { key: 'tag-1', doc_count: 1 },
          { key: 'tag-2', doc_count: 2 },
        ],
      },
    });

    const [context, req, res] = mockHandlerArguments(
      { rulesClient },
      {
        query: {
          default_search_operator: 'AND',
        },
      },
      ['ok']
    );

    expect(await handler(context, req, res)).toEqual({
      body: {
        alertExecutionStatus: {
          active: 23,
          error: 2,
          ok: 15,
          pending: 1,
          unknown: 0,
          warning: 0,
        },
        ruleEnabledStatus: {
          disabled: 2,
          enabled: 1,
        },
        ruleLastRunOutcome: {
          failed: 2,
          succeeded: 1,
          warning: 3,
        },
        ruleMutedStatus: {
          muted: 1,
          unmuted: 0,
        },
        ruleSnoozedStatus: {
          snoozed: 1,
        },
        ruleTags: ['tag-1', 'tag-2'],
      },
    });

    expect(rulesClient.aggregate).toHaveBeenCalledTimes(1);
    expect(rulesClient.aggregate).toHaveBeenCalledWith(
      {
        enabled: { terms: { field: 'alert.attributes.enabled' } },
        muted: { terms: { field: 'alert.attributes.muteAll' } },
        outcome: { terms: { field: 'alert.attributes.lastRun.outcome' } },
        snoozed: {
          aggs: {
            count: { filter: { exists: { field: 'alert.attributes.snoozeSchedule.duration' } } },
          },
          nested: { path: 'alert.attributes.snoozeSchedule' },
        },
        status: { terms: { field: 'alert.attributes.executionStatus.status' } },
        tags: { terms: { field: 'alert.attributes.tags', order: { _key: 'asc' }, size: 50 } },
      },
      { defaultSearchOperator: 'AND' }
    );

    expect(res.ok).toHaveBeenCalledWith({
      body: {
        alertExecutionStatus: {
          ok: 15,
          error: 2,
          active: 23,
          pending: 1,
          unknown: 0,
          warning: 0,
        },
        ruleEnabledStatus: {
          disabled: 2,
          enabled: 1,
        },
        ruleLastRunOutcome: {
          succeeded: 1,
          failed: 2,
          warning: 3,
        },
        ruleMutedStatus: {
          muted: 1,
          unmuted: 0,
        },
        ruleSnoozedStatus: {
          snoozed: 1,
        },
        ruleTags: ['tag-1', 'tag-2'],
      },
    });
  });

  it('ensures the license allows aggregating alerts', async () => {
    const licenseState = licenseStateMock.create();
    const router = httpServiceMock.createRouter();

    aggregateAlertRoute(router, licenseState);

    const [, handler] = router.get.mock.calls[0];

    rulesClient.aggregate.mockResolvedValueOnce({
      status: {
        buckets: [
          { key: 'active', doc_count: 23 },
          { key: 'error', doc_count: 2 },
          { key: 'ok', doc_count: 15 },
          { key: 'pending', doc_count: 1 },
        ],
      },
      outcome: {
        buckets: [
          { key: 'failed', doc_count: 2 },
          { key: 'succeeded', doc_count: 1 },
          { key: 'warning', doc_count: 3 },
        ],
      },
      muted: {
        buckets: [
          { key: 1, key_as_string: '1', doc_count: 1 },
          { key: 2, key_as_string: '2', doc_count: 2 },
        ],
      },
      enabled: {
        buckets: [
          { key: 1, key_as_string: '1', doc_count: 1 },
          { key: 0, key_as_string: '0', doc_count: 2 },
        ],
      },
      snoozed: {
        count: {
          doc_count: 1,
        },
      },
      tags: {
        buckets: [
          { key: 'tag-1', doc_count: 1 },
          { key: 'tag-2', doc_count: 2 },
        ],
      },
    });

    const [context, req, res] = mockHandlerArguments(
      { rulesClient },
      {
        query: {
          default_search_operator: 'OR',
        },
      }
    );

    await handler(context, req, res);

    expect(verifyApiAccess).toHaveBeenCalledWith(licenseState);
  });

  it('ensures the license check prevents aggregating alerts', async () => {
    const licenseState = licenseStateMock.create();
    const router = httpServiceMock.createRouter();

    (verifyApiAccess as jest.Mock).mockImplementation(() => {
      throw new Error('OMG');
    });

    aggregateAlertRoute(router, licenseState);

    const [, handler] = router.get.mock.calls[0];

    const [context, req, res] = mockHandlerArguments(
      {},
      {
        query: {},
      },
      ['ok']
    );
    expect(handler(context, req, res)).rejects.toMatchInlineSnapshot(`[Error: OMG]`);

    expect(verifyApiAccess).toHaveBeenCalledWith(licenseState);
  });

  it('should track every call', async () => {
    const licenseState = licenseStateMock.create();
    const router = httpServiceMock.createRouter();

    aggregateAlertRoute(router, licenseState, mockUsageCounter);
    const [, handler] = router.get.mock.calls[0];
    const [context, req, res] = mockHandlerArguments(
      { rulesClient },
      {
        query: {
          default_search_operator: 'AND',
        },
      },
      ['ok']
    );
    await handler(context, req, res);
    expect(trackLegacyRouteUsage).toHaveBeenCalledWith('aggregate', mockUsageCounter);
  });

  it('should track calls with deprecated param values', async () => {
    const licenseState = licenseStateMock.create();
    const router = httpServiceMock.createRouter();

    aggregateAlertRoute(router, licenseState, mockUsageCounter);
    const [, handler] = router.get.mock.calls[0];
    const [context, req, res] = mockHandlerArguments(
      { rulesClient },
      {
        params: {},
        query: {
          search_fields: ['alertTypeId:1', 'message:foo'],
          search: 'alertTypeId:2',
        },
      },
      ['ok']
    );
    await handler(context, req, res);
    expect(trackLegacyTerminology).toHaveBeenCalledTimes(1);
    expect((trackLegacyTerminology as jest.Mock).mock.calls[0][0]).toStrictEqual([
      'alertTypeId:2',
      ['alertTypeId:1', 'message:foo'],
    ]);
  });
});
