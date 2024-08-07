/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Get exception list summary API endpoint
 *   version: 2023-10-31
 */

import { z } from 'zod';

import {
  ExceptionListId,
  ExceptionListHumanId,
  ExceptionNamespaceType,
} from '../model/exception_list_common.gen';

export type GetExceptionListSummaryRequestQuery = z.infer<
  typeof GetExceptionListSummaryRequestQuery
>;
export const GetExceptionListSummaryRequestQuery = z.object({
  /**
   * Exception list's identifier generated upon creation
   */
  id: ExceptionListId.optional(),
  /**
   * Exception list's human readable identifier
   */
  list_id: ExceptionListHumanId.optional(),
  namespace_type: ExceptionNamespaceType.optional().default('single'),
  /**
   * Search filter clause
   */
  filter: z.string().optional(),
});
export type GetExceptionListSummaryRequestQueryInput = z.input<
  typeof GetExceptionListSummaryRequestQuery
>;

export type GetExceptionListSummaryResponse = z.infer<typeof GetExceptionListSummaryResponse>;
export const GetExceptionListSummaryResponse = z.object({
  windows: z.number().int().min(0).optional(),
  linux: z.number().int().min(0).optional(),
  macos: z.number().int().min(0).optional(),
  total: z.number().int().min(0).optional(),
});
