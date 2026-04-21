/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Logger } from '@kbn/core/server';

import type { ElasticAssistantPluginRouter } from '../types';
import type { ConfigSchema } from '../config_schema';
import { registerCoreRoutes } from './register_core_routes';
import { registerAttackDiscoveryRoutes } from './register_attack_discovery_routes';
import { registerDefendInsightsRoutes } from './register_defend_insights_routes';
import { registerTestInternalRoutes } from './register_test_internal_routes';

/**
 * Registers routes by domain. Chunked registrars keep this file small; for true
 * lazy-loaded route modules at setup, core would need to allow `Promise<TSetup>`
 * from `Plugin.setup` (today only runtime awaits async setup with a dev warning).
 */
export const registerRoutes = (
  router: ElasticAssistantPluginRouter,
  logger: Logger,
  config: ConfigSchema,
  enableDataGeneratorRoutes = false
) => {
  registerCoreRoutes(router, logger, config);
  registerAttackDiscoveryRoutes(router);
  registerDefendInsightsRoutes(router);
  registerTestInternalRoutes(router, enableDataGeneratorRoutes);
};
