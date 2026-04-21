/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ElasticAssistantPluginRouter } from '../types';
import {
  getDefendInsightRoute,
  getDefendInsightsRoute,
  postDefendInsightsRoute,
} from './defend_insights';

export const registerDefendInsightsRoutes = (router: ElasticAssistantPluginRouter) => {
  getDefendInsightRoute(router);
  getDefendInsightsRoute(router);
  postDefendInsightsRoute(router);
};
