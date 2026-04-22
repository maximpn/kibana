/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ElasticAssistantPluginRouter } from '../types';
import { findAttackDiscoveriesRoute } from './attack_discovery/public/get/find_attack_discoveries';
import { postAttackDiscoveryGenerateRoute } from './attack_discovery/public/post/post_attack_discovery_generate';
import { postAttackDiscoveryBulkRoute } from './attack_discovery/public/post/post_attack_discovery_bulk';
import { getAttackDiscoveryGenerationsRoute } from './attack_discovery/public/get/get_attack_discovery_generations';
import { getAttackDiscoveryGenerationRoute } from './attack_discovery/public/get/get_attack_discovery_generation';
import { postAttackDiscoveryGenerationsDismissRoute } from './attack_discovery/public/post/post_attack_discovery_generations_dismiss';
import { createAttackDiscoverySchedulesRoute } from './attack_discovery/schedules/public/post/create';
import { getAttackDiscoverySchedulesRoute } from './attack_discovery/schedules/public/get/get';
import { updateAttackDiscoverySchedulesRoute } from './attack_discovery/schedules/public/put/update';
import { deleteAttackDiscoverySchedulesRoute } from './attack_discovery/schedules/public/delete/delete';
import { findAttackDiscoverySchedulesRoute } from './attack_discovery/schedules/public/get/find';
import { disableAttackDiscoverySchedulesRoute } from './attack_discovery/schedules/public/post/disable';
import { enableAttackDiscoverySchedulesRoute } from './attack_discovery/schedules/public/post/enable';
import { getMissingIndexPrivilegesInternalRoute } from './attack_discovery/privileges/get_missing_privileges';

export const registerAttackDiscoveryRoutes = (router: ElasticAssistantPluginRouter) => {
  findAttackDiscoveriesRoute(router);
  postAttackDiscoveryBulkRoute(router);
  getAttackDiscoveryGenerationsRoute(router);
  getAttackDiscoveryGenerationRoute(router);
  postAttackDiscoveryGenerationsDismissRoute(router);
  postAttackDiscoveryGenerateRoute(router);
  getMissingIndexPrivilegesInternalRoute(router);
  createAttackDiscoverySchedulesRoute(router);
  getAttackDiscoverySchedulesRoute(router);
  findAttackDiscoverySchedulesRoute(router);
  updateAttackDiscoverySchedulesRoute(router);
  deleteAttackDiscoverySchedulesRoute(router);
  disableAttackDiscoverySchedulesRoute(router);
  enableAttackDiscoverySchedulesRoute(router);
};
