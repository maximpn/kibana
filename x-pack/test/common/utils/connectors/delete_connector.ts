/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type SuperTest from 'supertest';
import {
  ELASTIC_HTTP_VERSION_HEADER,
  X_ELASTIC_INTERNAL_ORIGIN_REQUEST,
} from '@kbn/core-http-common';
import { getSpaceUrlPrefix } from '../get_space_prefix';

/**
 * Deletes a connector
 *
 * @param supertest The supertest agent
 * @param connectorId The connector to delete
 * @param spaceId The space id (optional, defaults to "default")
 */
export function deleteConnector(
  supertest: SuperTest.SuperTest<SuperTest.Test>,
  connectorId: string,
  { spaceId = 'default' } = {}
): SuperTest.Test {
  return supertest
    .delete(`${getSpaceUrlPrefix(spaceId)}/api/actions/connector/${connectorId}`)
    .set('kbn-xsrf', 'some-xsrf-token')
    .set(ELASTIC_HTTP_VERSION_HEADER, '1')
    .set(X_ELASTIC_INTERNAL_ORIGIN_REQUEST, 'kibana');
}
