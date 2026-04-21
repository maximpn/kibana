/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ElasticAssistantPluginRouter } from '../types';
import { updateAnonymizationFieldsRoute } from './test_internal/update_anonymization_fields_route';
import { createAttackDiscoveryAlertsRoute } from './test_internal/create_attack_discovery_alerts_route';

export const registerTestInternalRoutes = (
  router: ElasticAssistantPluginRouter,
  enableDataGeneratorRoutes: boolean
) => {
  updateAnonymizationFieldsRoute(router);
  if (enableDataGeneratorRoutes) {
    createAttackDiscoveryAlertsRoute(router);
  }
};
