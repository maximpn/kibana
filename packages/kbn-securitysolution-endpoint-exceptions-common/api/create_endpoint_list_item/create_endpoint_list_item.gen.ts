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
 *   title: Create endpoint list item API endpoint
 *   version: 2023-10-31
 */

import { z } from 'zod';

import {
  ExceptionListItemHumanId,
  ExceptionListItemType,
  ExceptionListItemName,
  ExceptionListItemDescription,
  ExceptionListItemOsTypeArray,
  ExceptionListItemTags,
  ExceptionListItemMeta,
  ExceptionListItemCommentArray,
} from '@kbn/securitysolution-exceptions-common/api/model/exception_list_common.gen';
import { ExceptionListItemEntryArray } from '@kbn/securitysolution-exceptions-common/api/model/exception_list_item_entry.gen';
import { EndpointListItem } from '../model/endpoint_list_common.gen';

export type CreateEndpointListItemRequestBody = z.infer<typeof CreateEndpointListItemRequestBody>;
export const CreateEndpointListItemRequestBody = z.object({
  item_id: ExceptionListItemHumanId.optional(),
  type: ExceptionListItemType,
  name: ExceptionListItemName,
  description: ExceptionListItemDescription,
  entries: ExceptionListItemEntryArray,
  os_types: ExceptionListItemOsTypeArray,
  tags: ExceptionListItemTags,
  meta: ExceptionListItemMeta.optional(),
  comments: ExceptionListItemCommentArray,
});
export type CreateEndpointListItemRequestBodyInput = z.input<
  typeof CreateEndpointListItemRequestBody
>;

export type CreateEndpointListItemResponse = z.infer<typeof CreateEndpointListItemResponse>;
export const CreateEndpointListItemResponse = EndpointListItem;
