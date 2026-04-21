/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Logger } from '@kbn/core/server';

import { findSecurityAIPromptsRoute } from './security_ai_prompts/find_prompts';
import { findAlertSummaryRoute } from './alert_summary/find_route';
import type { ElasticAssistantPluginRouter } from '../types';
import { createConversationRoute } from './user_conversations/create_route';
import { deleteConversationRoute } from './user_conversations/delete_route';
import { readConversationRoute } from './user_conversations/read_route';
import { updateConversationRoute } from './user_conversations/update_route';
import { findUserConversationsRoute } from './user_conversations/find_route';
import { bulkActionConversationsRoute } from './user_conversations/bulk_actions_route';
import { appendConversationMessageRoute } from './user_conversations/append_conversation_messages_route';
import { getKnowledgeBaseStatusRoute } from './knowledge_base/get_knowledge_base_status';
import { postKnowledgeBaseRoute } from './knowledge_base/post_knowledge_base';
import { getEvaluateRoute } from './evaluate/get_evaluate';
import { postEvaluateRoute } from './evaluate/post_evaluate';
import { getCapabilitiesRoute } from './capabilities/get_capabilities_route';
import { bulkPromptsRoute } from './prompts/bulk_actions_route';
import { findPromptsRoute } from './prompts/find_route';
import { bulkActionAnonymizationFieldsRoute } from './anonymization_fields/bulk_actions_route';
import { findAnonymizationFieldsRoute } from './anonymization_fields/find_route';
import { chatCompleteRoute } from './chat/chat_complete_route';
import { postActionsConnectorExecuteRoute } from './post_actions_connector_execute';
import { bulkActionKnowledgeBaseEntriesRoute } from './knowledge_base/entries/bulk_actions_route';
import { createKnowledgeBaseEntryRoute } from './knowledge_base/entries/create_route';
import { findKnowledgeBaseEntriesRoute } from './knowledge_base/entries/find_route';
import { deleteKnowledgeBaseEntryRoute } from './knowledge_base/entries/delete_route';
import { updateKnowledgeBaseEntryRoute } from './knowledge_base/entries/update_route';
import { getKnowledgeBaseEntryRoute } from './knowledge_base/entries/get_route';
import { bulkAlertSummaryRoute } from './alert_summary/bulk_actions_route';
import type { ConfigSchema } from '../config_schema';
import { deleteAllConversationsRoute } from './user_conversations/delete_all_route';
import { suggestUsersRoute } from './users/suggest';

export const registerCoreRoutes = (
  router: ElasticAssistantPluginRouter,
  logger: Logger,
  config: ConfigSchema
) => {
  chatCompleteRoute(router, config);
  getCapabilitiesRoute(router);
  createConversationRoute(router);
  readConversationRoute(router);
  updateConversationRoute(router);
  deleteConversationRoute(router);
  deleteAllConversationsRoute(router);
  appendConversationMessageRoute(router);
  bulkActionConversationsRoute(router, logger);
  findUserConversationsRoute(router);
  getKnowledgeBaseStatusRoute(router);
  postKnowledgeBaseRoute(router);
  getKnowledgeBaseEntryRoute(router);
  findKnowledgeBaseEntriesRoute(router);
  createKnowledgeBaseEntryRoute(router);
  updateKnowledgeBaseEntryRoute(router);
  deleteKnowledgeBaseEntryRoute(router);
  bulkActionKnowledgeBaseEntriesRoute(router);
  postActionsConnectorExecuteRoute(router, config);
  getEvaluateRoute(router);
  postEvaluateRoute(router, config);
  suggestUsersRoute(router, logger);
  bulkPromptsRoute(router, logger);
  findPromptsRoute(router, logger);
  findSecurityAIPromptsRoute(router, logger);
  bulkActionAnonymizationFieldsRoute(router, logger);
  findAnonymizationFieldsRoute(router, logger);
  bulkAlertSummaryRoute(router, logger);
  findAlertSummaryRoute(router, logger);
};
