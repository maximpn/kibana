/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { z, lazySchema } from '@kbn/zod/v4';
import type { RouteValidationResultFactory } from '@kbn/core/server';

import { buildRouteValidationWithZod } from './common';
import {
  CreateKnowledgeBaseRequestParams as GenCreateKnowledgeBaseRequestParams,
  ReadKnowledgeBaseRequestParams as GenReadKnowledgeBaseRequestParams,
} from './knowledge_base/crud_kb_route.gen';
import { CreateKnowledgeBaseRequestParams, ReadKnowledgeBaseRequestParams } from '.';

const validationResult = {
  ok: <T>(value: T) => ({ value }),
  badRequest: (error: Error | string) =>
    ({
      error: { message: typeof error === 'string' ? error : error.message },
    } as ReturnType<RouteValidationResultFactory['badRequest']>),
} as RouteValidationResultFactory;

describe('buildRouteValidationWithZod', () => {
  it('returns ok for valid input on a lazy-wrapped object schema', () => {
    const validate = buildRouteValidationWithZod(lazySchema(() => z.object({ name: z.string() })));
    expect(validate({ name: 'a' }, validationResult)).toEqual({ value: { name: 'a' } });
  });

  it('returns badRequest for invalid input on a lazy-wrapped object schema', () => {
    const validate = buildRouteValidationWithZod(lazySchema(() => z.object({ name: z.string() })));
    const result = validate({}, validationResult);
    expect('error' in result && Boolean(result.error)).toBe(true);
  });
});

describe('Knowledge base request params (lazy barrel overrides)', () => {
  it('returns success for CreateKnowledgeBaseRequestParams when resource is omitted', () => {
    expect(CreateKnowledgeBaseRequestParams.safeParse({})).toEqual(
      expect.objectContaining({ success: true, data: {} })
    );
  });

  it('returns success for CreateKnowledgeBaseRequestParams when resource is set', () => {
    expect(CreateKnowledgeBaseRequestParams.safeParse({ resource: 'kb' })).toEqual(
      expect.objectContaining({ success: true, data: { resource: 'kb' } })
    );
  });

  it('returns success for ReadKnowledgeBaseRequestParams when resource is omitted', () => {
    expect(ReadKnowledgeBaseRequestParams.safeParse({})).toEqual(
      expect.objectContaining({ success: true, data: {} })
    );
  });

  it('returns success for ReadKnowledgeBaseRequestParams when resource is set', () => {
    expect(ReadKnowledgeBaseRequestParams.safeParse({ resource: 'kb' })).toEqual(
      expect.objectContaining({ success: true, data: { resource: 'kb' } })
    );
  });

  it('rejects empty params on generated CreateKnowledgeBaseRequestParams', () => {
    expect(GenCreateKnowledgeBaseRequestParams.safeParse({}).success).toBe(false);
  });

  it('rejects empty params on generated ReadKnowledgeBaseRequestParams', () => {
    expect(GenReadKnowledgeBaseRequestParams.safeParse({}).success).toBe(false);
  });
});
