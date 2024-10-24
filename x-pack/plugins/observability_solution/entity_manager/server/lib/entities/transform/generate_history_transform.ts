/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EntityDefinition } from '@kbn/entities-schema';
import {
  QueryDslQueryContainer,
  TransformPutTransformRequest,
} from '@elastic/elasticsearch/lib/api/types';
import { getElasticsearchQueryOrThrow } from '../helpers/get_elasticsearch_query_or_throw';
import { generateHistoryMetricAggregations } from './generate_metric_aggregations';
import {
  ENTITY_DEFAULT_HISTORY_FREQUENCY,
  ENTITY_DEFAULT_HISTORY_SYNC_DELAY,
} from '../../../../common/constants_entities';
import { generateHistoryMetadataAggregations } from './generate_metadata_aggregations';
import {
  generateHistoryTransformId,
  generateHistoryIngestPipelineId,
  generateHistoryIndexName,
  generateHistoryBackfillTransformId,
} from '../helpers/generate_component_id';
import { isBackfillEnabled } from '../helpers/is_backfill_enabled';

export function generateHistoryTransform(
  definition: EntityDefinition,
  backfill = false
): TransformPutTransformRequest {
  if (backfill && !isBackfillEnabled(definition)) {
    throw new Error(
      'This function was called with backfill=true without history.settings.backfillSyncDelay'
    );
  }

  const filter: QueryDslQueryContainer[] = [];

  if (definition.filter) {
    filter.push(getElasticsearchQueryOrThrow(definition.filter));
  }

  if (backfill && definition.history.settings?.backfillLookbackPeriod) {
    filter.push({
      range: {
        [definition.history.timestampField]: {
          gte: `now-${definition.history.settings?.backfillLookbackPeriod.toJSON()}`,
        },
      },
    });
  }

  const syncDelay = backfill
    ? definition.history.settings?.backfillSyncDelay
    : definition.history.settings?.syncDelay;

  const transformId = backfill
    ? generateHistoryBackfillTransformId(definition)
    : generateHistoryTransformId(definition);

  const frequency = backfill
    ? definition.history.settings?.backfillFrequency
    : definition.history.settings?.frequency;

  return {
    transform_id: transformId,
    _meta: {
      definitionVersion: definition.version,
      managed: definition.managed,
    },
    defer_validation: true,
    source: {
      index: definition.indexPatterns,
      ...(filter.length > 0 && {
        query: {
          bool: {
            filter,
          },
        },
      }),
    },
    dest: {
      index: `${generateHistoryIndexName({ id: 'noop' } as EntityDefinition)}`,
      pipeline: generateHistoryIngestPipelineId(definition),
    },
    frequency: frequency || ENTITY_DEFAULT_HISTORY_FREQUENCY,
    sync: {
      time: {
        field: definition.history.settings?.syncField ?? definition.history.timestampField,
        delay: syncDelay || ENTITY_DEFAULT_HISTORY_SYNC_DELAY,
      },
    },
    settings: {
      deduce_mappings: false,
      unattended: true,
    },
    pivot: {
      group_by: {
        ...definition.identityFields.reduce(
          (acc, id) => ({
            ...acc,
            [`entity.identity.${id.field}`]: {
              terms: { field: id.field, missing_bucket: id.optional },
            },
          }),
          {}
        ),
        ['@timestamp']: {
          date_histogram: {
            field: definition.history.timestampField,
            fixed_interval: definition.history.interval.toJSON(),
          },
        },
      },
      aggs: {
        ...generateHistoryMetricAggregations(definition),
        ...generateHistoryMetadataAggregations(definition),
        'entity.lastSeenTimestamp': {
          max: {
            field: definition.history.timestampField,
          },
        },
      },
    },
  };
}
