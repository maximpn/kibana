/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 */

import type { IKibanaResponse, Logger } from '@kbn/core/server';
import { transformError } from '@kbn/securitysolution-es-utils';
import type { SecuritySolutionPluginRouter } from '../../../types';
import { buildSiemResponse } from '../../../lib/detection_engine/routes/utils';
import type { GetEndpointSuggestionsResponse } from '../../../../common/api/endpoint/suggestions/get_suggestions.gen';
import { handleGetEndpointSuggestionsRequest } from './handle_get_endpoint_suggestions_request.gen';

export const GetEndpointSuggestionsRoute = (
  router: SecuritySolutionPluginRouter,
  logger: Logger
) => {
  router.versioned
    .post({
      access: 'public',
      path: '/api/endpoint/suggestions/{suggestion_type}',
      options: {
        tags: ['access:securitySolution'],
      },
    })
    .addVersion(
      {
        version: '2023-10-31',
        validate: false,
      },
      async (
        context,
        request,
        response
      ): Promise<IKibanaResponse<GetEndpointSuggestionsResponse>> => {
        const siemResponse = buildSiemResponse(response);

        try {
          const result = await handleGetEndpointSuggestionsRequest(context, request, logger);

          return response.ok({
            body: result,
          });
        } catch (err) {
          const error = transformError(err);
          return siemResponse.error({
            body: error.message,
            statusCode: error.statusCode,
          });
        }
      }
    );
};
